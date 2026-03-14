// Supabase Edge Function (Deno) - placeholder image inference
// Accepts JSON { imageBase64: string, fileName?: string, lang?: string }
// Returns { disease, recommendation }
// @ts-nocheck

export default async (req: Request) => {
  try {
    const body = await req.json();
    const base64 = body.imageBase64 || '';
    const fileName = body.fileName || 'image';
    // Very simple placeholder logic: pick a label based on string length
    const hash = (base64.length % 5);
    const labels = [
      { disease: 'Leaf Blight', recommendation: 'Remove infected leaves, apply copper fungicide weekly for 2 weeks, improve drainage.' },
      { disease: 'Powdery Mildew', recommendation: 'Apply sulfur-based fungicide, avoid overhead irrigation, ensure good airflow.' },
      { disease: 'Bacterial Spot', recommendation: 'Remove badly affected tissue, use recommended bactericides, rotate crops.' },
      { disease: 'Nutrient Deficiency (Nitrogen)', recommendation: 'Apply urea or organic compost; follow recommended dosage by crop.' },
      { disease: 'Unknown', recommendation: 'Image unclear — take a clearer photo or consult local extension services.' }
    ];

    const pick = labels[hash];
    return new Response(JSON.stringify(pick), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Image infer error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
