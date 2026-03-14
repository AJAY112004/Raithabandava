// Supabase Edge Function (Deno)
// @ts-nocheck
// Endpoint: /functions/v1/chatbot (when deployed)

interface ChatRequest {
  message: string;
  lang?: string; // 'en' | 'kn' | 'hi'
}

const LIBRE = Deno.env.get('LIBRETRANSLATE_URL') || 'https://libretranslate.com/translate';

// Simple in-function knowledge base (small subset).
const LOCAL_KB = {
  knowledge: [
    {
      slug: 'tomato-blight',
      title: 'Tomato - Early Blight',
      tags: ['disease','tomato','blight'],
      recommendation: 'Remove infected leaves, avoid overhead watering, apply copper fungicide weekly for 2 weeks. Rotate crops and maintain sanitation.'
    },
    {
      slug: 'powdery-mildew',
      title: 'Powdery Mildew',
      tags: ['disease','powdery','mildew'],
      recommendation: 'Improve airflow, avoid dense planting, apply sulfur or potassium bicarbonate sprays per label.'
    },
    {
      slug: 'weather-advice',
      title: 'Weather Advice',
      tags: ['weather','rain','drought','frost'],
      recommendation: 'For heavy rain ensure drainage and delay sprays; for drought mulch and irrigate at critical stages; for frost protect with covers.'
    },
    {
      slug: 'market-pricing-tips',
      title: 'Market Pricing Tips',
      tags: ['market','price','sell','pricing'],
      recommendation: 'Harvest at right maturity, grade produce, check multiple markets for best price, and pack neatly for buyers.'
    }
  ],
  fertilizer: {
    rice: { nitrogen: { dose_kg_per_ha: 80, timing: 'Split: 1/3 basal, 1/3 tillering, 1/3 panicle initiation' }, phosphorus: { dose_kg_per_ha: 40, timing: 'Basal' }, potassium: { dose_kg_per_ha: 40, timing: 'Basal or split' } },
    maize: { nitrogen: { dose_kg_per_ha: 120, timing: 'Split: half at sowing, half at knee high' }, phosphorus: { dose_kg_per_ha: 60, timing: 'Basal' }, potassium: { dose_kg_per_ha: 40, timing: 'Basal' } },
    tomato: { nitrogen: { dose_kg_per_ha: 150, timing: 'Split applications during growth' }, phosphorus: { dose_kg_per_ha: 80, timing: 'Basal' }, potassium: { dose_kg_per_ha: 200, timing: 'Split during fruiting' } }
  }
};

async function translate(text: string, source: string, target: string) {
  if (!text) return '';
  if (source === target) return text;
  try {
    const res = await fetch(LIBRE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    const j = await res.json();
    return j.translatedText || j.translated || j.result || j?.data?.translatedText || j?.translated_text || j;
  } catch (err) {
    console.error('Translate error', err);
    return text;
  }
}

async function callOpenAI(promptMessages: any[]) {
  const key = Deno.env.get('OPENAI_API_KEY') || '';
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: promptMessages, max_tokens: 700 })
  });
  const j = await res.json();
  return j?.choices?.[0]?.message?.content ?? '';
}

export default async (req: Request) => {
  try {
    const body: ChatRequest = await req.json();
    const userLang = body.lang || 'en';

    // 1) Translate incoming query to English for consistent processing
    const incomingInEnglish = userLang === 'en' ? body.message : await translate(body.message, userLang, 'en');

    // 2) Lightweight rule-based classification + KB lookup for common Q&A
    const textLower = incomingInEnglish.toLowerCase();
    let classification = 'general';
    let answerInEnglish = '';

    // disease keywords
    if (/blight|leaf blight|early blight|powdery|mildew|disease|fungus|bacterial/.test(textLower)) {
      classification = 'disease';
      // try to find KB match for crop/disease
      const match = LOCAL_KB.knowledge.find(k => {
        return k.tags.some((tag: string) => textLower.includes(tag));
      });
      if (match) {
        answerInEnglish = `${match.title}: ${match.recommendation}`;
      }
    }

    // fertilizer dosage questions
    if (!answerInEnglish && /fertilizer|nitrogen|phosphorus|potassium|dosage|dose|kg per ha|kg\/ha/.test(textLower)) {
      classification = 'fertilizer';
      // detect crop
      const crops = Object.keys(LOCAL_KB.fertilizer);
      const crop = crops.find(c => textLower.includes(c)) || 'rice';
      const fert = LOCAL_KB.fertilizer[crop];
      if (fert) {
        answerInEnglish = `Fertilizer guidance for ${crop}: N: ${fert.nitrogen.dose_kg_per_ha} kg/ha (${fert.nitrogen.timing}). P: ${fert.phosphorus.dose_kg_per_ha} kg/ha (${fert.phosphorus.timing}). K: ${fert.potassium.dose_kg_per_ha} kg/ha (${fert.potassium.timing}).`;
      }
    }

    // weather questions
    if (!answerInEnglish && /rain|drought|frost|weather|forecast/.test(textLower)) {
      classification = 'weather';
      const match = LOCAL_KB.knowledge.find(k => k.slug === 'weather-advice');
      if (match) answerInEnglish = `${match.title}: ${match.recommendation}`;
    }

    // market questions
    if (!answerInEnglish && /price|market|mandi|sell|buyer|pricing/.test(textLower)) {
      classification = 'market';
      const match = LOCAL_KB.knowledge.find(k => k.slug === 'market-pricing-tips');
      if (match) answerInEnglish = `${match.title}: ${match.recommendation}`;
    }

    // If we still don't have a matched KB answer, fall back to OpenAI for classification + answer
    if (!answerInEnglish) {
      const classPrompt = [
        { role: 'system', content: 'You are a classifier. Given a user query, return one label from: disease, fertilizer, weather, market, general. Return ONLY the label.' },
        { role: 'user', content: incomingInEnglish }
      ];
      try {
        const cls = await callOpenAI(classPrompt);
        classification = (cls || 'general').toLowerCase().trim().split('\n')[0];
      } catch (err) {
        console.warn('Classification failed', err);
      }

      // 3) Prepare system prompt tailored to farming advisory
      const systemPrompt = `You are an expert farming advisor. Answer concisely in English and provide actionable steps, dosage (if fertilizer), or immediate remedies (if disease). If weather or market related, provide relevant suggestions and data sources. Keep answers friendly and useful for smallholder farmers.`;

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: incomingInEnglish }
      ];

      answerInEnglish = await callOpenAI(chatMessages);
    }

    // 4) Optionally enrich response (e.g., attach weather API or market price) - omitted here for brevity

    // 5) Translate response back to user's language
    const reply = userLang === 'en' ? answerInEnglish : await translate(answerInEnglish, 'en', userLang);

    const out = { reply, raw: answerInEnglish, classification };
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
