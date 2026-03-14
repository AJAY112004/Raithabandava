// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Environment variables (configure via: supabase secrets set GEMINI_API_KEY=your_key)
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Fallback recommendations database for when AI API is unavailable
const fallbackRecommendations = {
  'Rice': {
    'Black Soil': {
      summary: "Rice cultivation in black soil offers excellent water retention. Focus on proper drainage and nutrient management for optimal yield.",
      ideal_planting_window: "June-July (Kharif) or December-January (Rabi)",
      expected_yield_adjusted: 4.5,
      key_risks: ["Bacterial leaf blight", "Brown plant hopper", "Blast disease"],
      nutrient_plan: {
        basal_fertilizer: "Apply 60kg N + 30kg P2O5 + 30kg K2O per acre at planting",
        top_dressing: "30kg N at tillering stage, 30kg N at panicle initiation",
        micro_nutrients: "Zinc sulphate 25kg/acre if deficient"
      },
      irrigation_schedule: [
        {"stage": "Land preparation", "days_after_planting": "-7-0", "water_requirement_mm": 150},
        {"stage": "Transplanting", "days_after_planting": "0-15", "water_requirement_mm": 50},
        {"stage": "Tillering", "days_after_planting": "15-45", "water_requirement_mm": 35},
        {"stage": "Panicle initiation", "days_after_planting": "45-65", "water_requirement_mm": 40},
        {"stage": "Flowering", "days_after_planting": "65-85", "water_requirement_mm": 45},
        {"stage": "Grain filling", "days_after_planting": "85-110", "water_requirement_mm": 30}
      ],
      pest_disease_alerts: [
        {"issue": "Brown Plant Hopper", "signs": "Yellowing and drying from leaf tips", "preventive_action": "Use BPH resistant varieties, avoid excess nitrogen"},
        {"issue": "Blast Disease", "signs": "Diamond shaped lesions on leaves", "preventive_action": "Ensure proper spacing, avoid late evening irrigation"}
      ],
      harvest_and_post_harvest: {
        maturity_indicators: "80% of grains turn golden yellow, moisture content 20-25%",
        harvest_method: "Cut when morning dew dries, use sharp sickle",
        storage_advice: "Dry to 12-14% moisture, store in moisture-proof containers"
      },
      sustainability_tips: ["Use System of Rice Intensification (SRI) method", "Incorporate crop residues", "Practice alternate wetting and drying"],
      confidence_score: 0.85
    },
    'Red Soil': {
      summary: "Rice in red soil requires careful water management and organic matter enhancement for better nutrient retention.",
      ideal_planting_window: "June-July with monsoon onset",
      expected_yield_adjusted: 3.8,
      key_risks: ["Iron toxicity", "Nutrient leaching", "Water stress"],
      nutrient_plan: {
        basal_fertilizer: "Apply 80kg N + 40kg P2O5 + 40kg K2O per acre with organic compost",
        top_dressing: "Split nitrogen in 3 doses: 25kg each at tillering, panicle, flowering",
        micro_nutrients: "Iron chelate if toxicity symptoms appear"
      },
      irrigation_schedule: [
        {"stage": "Nursery", "days_after_planting": "-30-0", "water_requirement_mm": 200},
        {"stage": "Transplanting", "days_after_planting": "0-10", "water_requirement_mm": 60},
        {"stage": "Establishment", "days_after_planting": "10-30", "water_requirement_mm": 45},
        {"stage": "Tillering", "days_after_planting": "30-60", "water_requirement_mm": 40},
        {"stage": "Reproductive", "days_after_planting": "60-90", "water_requirement_mm": 50},
        {"stage": "Maturity", "days_after_planting": "90-120", "water_requirement_mm": 25}
      ],
      pest_disease_alerts: [
        {"issue": "Stem Borer", "signs": "Dead heart in vegetative stage, white ear heads", "preventive_action": "Use pheromone traps, maintain field sanitation"},
        {"issue": "Sheath Blight", "signs": "Oval lesions on leaf sheaths", "preventive_action": "Improve air circulation, avoid dense planting"}
      ],
      harvest_and_post_harvest: {
        maturity_indicators: "Grains hard when pressed with thumbnail, 85% maturity",
        harvest_method: "Harvest in early morning, avoid rainy weather",
        storage_advice: "Sun dry for 2-3 days, store in elevated structures"
      },
      sustainability_tips: ["Add organic matter regularly", "Use cover crops in fallow", "Practice crop rotation with legumes"],
      confidence_score: 0.82
    }
  },
  'Maize': {
    'Black Soil': {
      summary: "Maize thrives in well-drained black soil with adequate organic matter. Focus on timely planting and balanced nutrition.",
      ideal_planting_window: "June-July (Kharif) or November-December (Rabi)",
      expected_yield_adjusted: 6.2,
      key_risks: ["Fall armyworm", "Stem borer", "Turcicum leaf blight"],
      nutrient_plan: {
        basal_fertilizer: "Apply 120kg N + 60kg P2O5 + 40kg K2O per acre",
        top_dressing: "60kg N at V6 stage, 60kg N at tasseling",
        micro_nutrients: "Zinc sulphate 25kg/acre, Boron 2kg/acre"
      },
      irrigation_schedule: [
        {"stage": "Sowing", "days_after_planting": "0-15", "water_requirement_mm": 25},
        {"stage": "Vegetative", "days_after_planting": "15-45", "water_requirement_mm": 35},
        {"stage": "Knee high", "days_after_planting": "45-65", "water_requirement_mm": 40},
        {"stage": "Tasseling", "days_after_planting": "65-75", "water_requirement_mm": 50},
        {"stage": "Silking", "days_after_planting": "75-85", "water_requirement_mm": 45},
        {"stage": "Grain filling", "days_after_planting": "85-110", "water_requirement_mm": 35}
      ],
      pest_disease_alerts: [
        {"issue": "Fall Armyworm", "signs": "Irregular holes in leaves, sawdust-like frass", "preventive_action": "Early morning scouting, use biocontrol agents"},
        {"issue": "Stem Borer", "signs": "Pin holes in leaves, boring in stem", "preventive_action": "Use resistant varieties, proper field sanitation"}
      ],
      harvest_and_post_harvest: {
        maturity_indicators: "Black layer formation at kernel base, moisture 20-25%",
        harvest_method: "Harvest cobs when husks turn brown",
        storage_advice: "Dry to 12-14% moisture, use hermetic storage"
      },
      sustainability_tips: ["Intercrop with legumes", "Use crop residue mulching", "Practice minimum tillage"],
      confidence_score: 0.88
    }
  },
  'Wheat': {
    'Black Soil': {
      summary: "Wheat cultivation in black soil provides excellent moisture retention. Focus on timely sowing and disease management.",
      ideal_planting_window: "November 15 - December 15 (Rabi season)",
      expected_yield_adjusted: 4.0,
      key_risks: ["Yellow rust", "Aphids", "Late sowing losses"],
      nutrient_plan: {
        basal_fertilizer: "Apply 100kg N + 50kg P2O5 + 30kg K2O per acre at sowing",
        top_dressing: "50kg N at first irrigation, 50kg N at crown root initiation",
        micro_nutrients: "Zinc sulphate 25kg/acre if deficient"
      },
      irrigation_schedule: [
        {"stage": "Sowing", "days_after_planting": "0-21", "water_requirement_mm": 60},
        {"stage": "Crown root initiation", "days_after_planting": "21-40", "water_requirement_mm": 70},
        {"stage": "Tillering", "days_after_planting": "40-60", "water_requirement_mm": 80},
        {"stage": "Jointing", "days_after_planting": "60-80", "water_requirement_mm": 90},
        {"stage": "Flowering", "days_after_planting": "80-95", "water_requirement_mm": 100},
        {"stage": "Grain filling", "days_after_planting": "95-120", "water_requirement_mm": 85}
      ],
      pest_disease_alerts: [
        {"issue": "Yellow Rust", "signs": "Yellow stripe patterns on leaves", "preventive_action": "Use resistant varieties, avoid excess nitrogen"},
        {"issue": "Aphids", "signs": "Sticky honeydew on leaves, stunted growth", "preventive_action": "Monitor regularly, use biological control"}
      ],
      harvest_and_post_harvest: {
        maturity_indicators: "Grains hard, golden color, moisture 18-20%",
        harvest_method: "Cut in early morning when dew is present",
        storage_advice: "Dry to 12% moisture, store in cool, dry place"
      },
      sustainability_tips: ["Zero tillage sowing", "Crop rotation with legumes", "Residue management"],
      confidence_score: 0.86
    }
  },
  'default': {
    'default': {
      summary: "General crop management practices for sustainable agriculture with focus on soil health and integrated pest management.",
      ideal_planting_window: "Follow local agricultural calendar and weather patterns",
      expected_yield_adjusted: 3.5,
      key_risks: ["Weather variability", "Pest outbreaks", "Market fluctuations"],
      nutrient_plan: {
        basal_fertilizer: "Apply balanced NPK based on soil test recommendations",
        top_dressing: "Split nitrogen application in 2-3 doses",
        micro_nutrients: "Apply based on deficiency symptoms"
      },
      irrigation_schedule: [
        {"stage": "Establishment", "days_after_planting": "0-20", "water_requirement_mm": 40},
        {"stage": "Vegetative growth", "days_after_planting": "20-60", "water_requirement_mm": 50},
        {"stage": "Reproductive", "days_after_planting": "60-90", "water_requirement_mm": 60},
        {"stage": "Maturity", "days_after_planting": "90-120", "water_requirement_mm": 30}
      ],
      pest_disease_alerts: [
        {"issue": "General Pests", "signs": "Leaf damage, stunted growth", "preventive_action": "Regular monitoring, IPM practices"},
        {"issue": "Diseases", "signs": "Leaf spots, wilting", "preventive_action": "Proper spacing, field sanitation"}
      ],
      harvest_and_post_harvest: {
        maturity_indicators: "Crop-specific maturity signs, proper moisture content",
        harvest_method: "Use appropriate tools and timing",
        storage_advice: "Proper drying and storage in clean containers"
      },
      sustainability_tips: ["Soil health management", "Water conservation", "Biodiversity promotion"],
      confidence_score: 0.75
    }
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  crop_type?: string;
  soil_type?: string;
  location?: string;
  area?: number;
  planting_date?: string;
  harvest_date?: string;
  notes?: string;
}

function getFallbackRecommendation(crop_type: string, soil_type: string, area: number): any {
  // Normalize crop type (remove Kannada translations)
  const cropKey = crop_type?.split('(')[0]?.trim() || 'default';
  const soilKey = soil_type?.split('(')[0]?.trim() || 'default';
  
  // Find best match
  let recommendation = fallbackRecommendations[cropKey]?.[soilKey] || 
                      fallbackRecommendations[cropKey]?.['default'] || 
                      fallbackRecommendations['default']['default'];

  // Adjust yield based on area (simple scaling)
  if (recommendation && area > 0) {
    recommendation = { ...recommendation };
    recommendation.expected_yield_adjusted = Math.round((recommendation.expected_yield_adjusted * Math.min(area, 5)) * 10) / 10;
  }

  return recommendation;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: RecommendationRequest = {};
    try {
      body = await req.json();
    } catch (_) {
      // ignore
    }

    const {
      crop_type = 'Unknown',
      soil_type = 'Unknown',
      location = 'Unknown',
      area = 1,
      planting_date,
      harvest_date,
      notes = '',
      language = 'en'
    } = body;

    // Determine language instruction
    const languageInstruction = language === 'kn' 
      ? 'Provide the response in Kannada language.' 
      : language === 'hi'
      ? 'Provide the response in Hindi language.'
      : 'Provide the response in English language.';

    const prompt = `You are an expert agronomist for Indian agriculture. ${languageInstruction}\n\nProvide concise crop management for:\n- Crop: ${crop_type}\n- Soil: ${soil_type}\n- Location: ${location}\n- Area: ${area} acres\n- Planting: ${planting_date || 'TBD'}\n- Harvest: ${harvest_date || 'TBD'}\n- Notes: ${notes || 'None'}\n\nReturn ONLY valid JSON with keys: summary, ideal_planting_window, expected_yield_adjusted, key_risks, fertilizer_plan, watering_advice, top_3_tips, confidence_score.`;

    // Use Gemini API as primary
    if (geminiApiKey) {
      console.log('Gemini API Key detected (length:', geminiApiKey?.length, ')');
      console.log('Attempting Gemini API call...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
      
      const geminiPrompt = `You are an expert agronomist for Indian agriculture. ${languageInstruction}

Provide concise crop management recommendations for:
- Crop: ${crop_type}
- Soil: ${soil_type}
- Location: ${location}
- Area: ${area} acres
- Planting Date: ${planting_date || 'TBD'}
- Harvest Date: ${harvest_date || 'TBD'}
- Additional Notes: ${notes || 'None'}

Return ONLY valid JSON (no markdown, no code blocks) with these ESSENTIAL keys only:
{
  "summary": "2-3 sentence overview of crop management strategy",
  "ideal_planting_window": "Best time to plant (e.g., June-July)",
  "expected_yield_adjusted": 4.5,
  "key_risks": ["Only top 3 most critical risks"],
  "fertilizer_plan": "Simple fertilizer recommendation in one sentence",
  "watering_advice": "Simple watering guidance in one sentence",
  "top_3_tips": ["Most important tip 1", "Most important tip 2", "Most important tip 3"],
  "confidence_score": 0.85
}

Keep all descriptions brief and actionable. Focus on the most critical information only.`;

      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: geminiPrompt }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8000
            }
          })
        });

        console.log('Gemini response status:', geminiResponse.status);

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          console.log('Gemini full response:', JSON.stringify(geminiData).substring(0, 500));
          const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (geminiText) {
            console.log('Gemini response received, length:', geminiText.length);
            console.log('Gemini response preview:', geminiText.substring(0, 300));
            try {
              // Remove markdown code blocks if present
              let cleanText = geminiText.trim();
              if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
              } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```\n?/g, '');
              }
              
              const parsed = JSON.parse(cleanText);
              console.log('Successfully parsed Gemini response');
              return new Response(JSON.stringify({ success: true, model: 'gemini-2.5-flash', source: 'gemini', recommendation: parsed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            } catch (e) {
              console.error('Failed to parse Gemini output JSON:', e);
              console.error('Raw Gemini response:', geminiText.substring(0, 300));
            }
          } else {
            console.error('No text in Gemini response. Full response:', JSON.stringify(geminiData));
          }
        } else {
          const errText = await geminiResponse.text();
          console.error('Gemini API error:', geminiResponse.status, errText);
        }
      } catch (e) {
        console.error('Gemini request failed:', e);
      }
    } else {
      console.log('No Gemini API key found');
    }

    // Fallback to rule-based recommendation
    const fallback = getFallbackRecommendation(crop_type, soil_type, area);
    return new Response(JSON.stringify({ success: true, fallback: true, recommendation: fallback }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('crop-recommendations function error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Service unavailable', details: error instanceof Error ? error.message : String(error) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});