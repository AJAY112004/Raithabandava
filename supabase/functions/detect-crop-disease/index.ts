import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Disease detection function called:', { method: req.method });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Support both old and new request formats
    const { imageBase64, image, crop_type, location, user_id, enhanced_mode, language = 'en' } = requestBody;
    const imageData = imageBase64 || image;
    
    console.log('Request received:', { 
      hasImageData: !!imageData, 
      imageSize: imageData?.length,
      hasGeminiKey: !!geminiApiKey,
      cropType: crop_type,
      enhancedMode: enhanced_mode,
      language: language
    });
    
    if (!imageData) {
      console.error('No image data provided');
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate base64 format
    if (!imageData.startsWith('data:image/')) {
      console.error('Invalid image format');
      return new Response(
        JSON.stringify({ error: 'Invalid image format. Please provide a base64 encoded image.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Gemini API key is available
    if (!geminiApiKey) {
      console.log('Gemini API key not available, returning enhanced demo analysis');
      
      // Enhanced demo analyses with comprehensive structure
      const enhancedDemoAnalyses = [
        {
          disease_name: "Late Blight (Phytophthora infestans)",
          crop_type: crop_type || "Tomato",
          severity: "high",
          confidence_score: 0.87,
          affected_area_percentage: 45,
          primary_symptoms: ["Dark brown lesions", "Water-soaked spots", "White fuzzy growth", "Rapid lesion spread"],
          treatment_recommendations: enhanced_mode ? {
            immediate_action: "Apply copper hydroxide fungicide immediately. Remove all affected leaves and destroy them.",
            systemic_treatment: "Use systemic fungicides containing metalaxyl-M + mancozeb. Apply every 7-10 days.",
            cultural_practices: "Improve air circulation, avoid overhead watering, increase plant spacing to 3 feet apart.",
            organic_alternatives: "Spray with copper sulfate solution (2 tbsp per gallon) or baking soda solution (1 tsp per quart water).",
            prevention: "Use resistant varieties like 'Iron Lady' or 'Defiant PhR'. Practice 3-year crop rotation with non-solanaceous crops."
          } : "Apply copper hydroxide fungicide immediately. Remove affected leaves and improve air circulation. Avoid overhead watering and ensure proper plant spacing.",
          additional_notes: "Late blight spreads rapidly in cool, humid conditions. Monitor weather forecasts and apply preventive treatments before rain periods. This disease can destroy entire crops within days if left untreated.",
          analysis_method: "intelligent_demo",
          severity_explanation: "High severity due to rapid spread potential and significant yield impact if untreated.",
          disease_info: {
            scientific_name: "Phytophthora infestans",
            common_symptoms: ["Water-soaked lesions", "Dark brown borders", "White sporulation", "Rapid spread"],
            affected_crops: ["Tomato", "Potato", "Eggplant"]
          }
        },
        {
          disease_name: "Bacterial Leaf Blight (Xanthomonas oryzae)",
          crop_type: crop_type || "Rice", 
          severity: "medium",
          confidence_score: 0.79,
          affected_area_percentage: 25,
          primary_symptoms: ["Yellow-orange lesions", "Water-soaked margins", "Systemic yellowing", "Leaf tip burning"],
          treatment_recommendations: enhanced_mode ? {
            immediate_action: "Apply copper-based bactericide immediately. Reduce nitrogen fertilization.",
            systemic_treatment: "Use streptomycin sulfate (100-200 ppm) during early infection stages.",
            cultural_practices: "Ensure proper field drainage, avoid excessive nitrogen, maintain proper water levels.",
            organic_alternatives: "Apply neem oil spray (2-3%) or garlic extract solution twice weekly.",
            prevention: "Use resistant varieties like IR64, BR11. Practice clean seed treatment with hot water (52°C for 30 minutes)."
          } : "Apply copper-based bactericide and ensure proper field drainage. Reduce nitrogen fertilization and maintain proper water levels.",
          additional_notes: "This bacterial disease is favored by warm, humid conditions. Proper water management is crucial for prevention.",
          analysis_method: "intelligent_demo",
          severity_explanation: "Medium severity - manageable with proper treatment but requires immediate attention.",
          disease_info: {
            scientific_name: "Xanthomonas oryzae pv. oryzae",
            common_symptoms: ["Leaf yellowing", "Water-soaked lesions", "Systemic infection"],
            affected_crops: ["Rice", "Other grasses"]
          }
        },
        {
          disease_name: "Powdery Mildew (Erysiphe graminis)",
          crop_type: crop_type || "Wheat",
          severity: "low",
          confidence_score: 0.82,
          affected_area_percentage: 15,
          primary_symptoms: ["White powdery coating", "Yellowing leaves", "Stunted growth", "Reduced tillering"],
          treatment_recommendations: enhanced_mode ? {
            immediate_action: "Apply sulfur-based fungicide or potassium bicarbonate spray.",
            systemic_treatment: "Use triazole fungicides: propiconazole (0.1%) or tebuconazole (0.05%).",
            cultural_practices: "Increase air circulation, reduce plant density, avoid overhead irrigation.",
            organic_alternatives: "Mix milk with water (1:10 ratio) and spray weekly. Apply sulfur dust early morning.",
            prevention: "Plant resistant varieties, maintain proper spacing (6-8 inches), avoid excessive nitrogen."
          } : "Apply sulfur-based fungicide and improve air circulation. Reduce plant density and avoid overhead irrigation.",
          additional_notes: "Powdery mildew thrives in high humidity with moderate temperatures. Early detection and treatment are key.",
          analysis_method: "intelligent_demo",
          severity_explanation: "Low severity - caught early, easily manageable with proper fungicide application.",
          disease_info: {
            scientific_name: "Erysiphe graminis",
            common_symptoms: ["White powdery coating", "Leaf distortion", "Premature senescence"],
            affected_crops: ["Wheat", "Barley", "Oats"]
          }
        },
        {
          disease_name: "Healthy Crop",
          crop_type: crop_type || "Cotton",
          severity: "low", 
          confidence_score: 0.92,
          affected_area_percentage: 0,
          primary_symptoms: ["Vibrant green foliage", "Normal growth patterns", "No visible lesions", "Healthy leaf texture"],
          treatment_recommendations: enhanced_mode ? {
            immediate_action: "Continue current management practices. No treatment needed.",
            systemic_treatment: "Maintain preventive spray schedule during vulnerable growth stages.",
            cultural_practices: "Continue proper irrigation, fertilization, and pest monitoring protocols.",
            organic_alternatives: "Apply compost tea monthly and maintain beneficial insect habitats.",
            prevention: "Keep monitoring for early signs of stress or disease. Maintain soil health with organic matter."
          } : "Continue current management practices. Maintain preventive spray schedule and regular monitoring.",
          additional_notes: "Excellent crop health! Continue with current agricultural practices. Regular monitoring is recommended.",
          analysis_method: "intelligent_demo",
          severity_explanation: "No disease detected - crop shows excellent health indicators.",
          disease_info: {
            scientific_name: "Healthy specimen",
            common_symptoms: ["Vigorous growth", "Green foliage", "Normal development"],
            affected_crops: ["Any healthy crop"]
          }
        }
      ];

      // Select demo analysis based on crop type or random
      let selectedDemo;
      if (crop_type) {
        selectedDemo = enhancedDemoAnalyses.find(demo => 
          demo.crop_type.toLowerCase() === crop_type.toLowerCase()
        ) || enhancedDemoAnalyses[Math.floor(Math.random() * enhancedDemoAnalyses.length)];
      } else {
        selectedDemo = enhancedDemoAnalyses[Math.floor(Math.random() * enhancedDemoAnalyses.length)];
      }

      console.log('Returning enhanced demo analysis:', selectedDemo);
      
      return new Response(
        JSON.stringify({
          success: true,
          analysis: selectedDemo,
          fallback: true,
          note: enhanced_mode 
            ? "Enhanced AI analysis with comprehensive disease database (Demo Mode - AI service not available)" 
            : "Standard disease detection (Demo Mode - AI service not available)"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing crop image with Gemini Vision API...');

    // Determine language instruction
    const languageInstruction = language === 'kn' 
      ? 'Provide the response in Kannada language.' 
      : language === 'hi'
      ? 'Provide the response in Hindi language.'
      : 'Provide the response in English language.';

    // Capitalize crop type for better display
    const displayCropType = crop_type && crop_type !== 'unknown' 
      ? crop_type.charAt(0).toUpperCase() + crop_type.slice(1) 
      : null;

    // Prepare the prompt for Gemini
    const enhancedPrompt = displayCropType 
      ? `You are an expert agricultural pathologist with extensive training in plant disease identification. ${languageInstruction}

Analyze the provided ${displayCropType} crop image and provide a comprehensive disease analysis.

Crop Type: ${displayCropType}
Location: ${location || 'Unknown'}

Return ONLY valid JSON (no markdown, no code blocks) with these exact keys:
{
  "disease_name": "Name of the disease or 'Healthy Crop'",
  "crop_type": "${displayCropType}",
  "severity": "low/medium/high",
  "confidence_score": 0.85,
  "affected_area_percentage": 25,
  "primary_symptoms": ["symptom1", "symptom2", "symptom3"],
  "treatment_recommendations": {
    "immediate_action": "Immediate steps to take",
    "systemic_treatment": "Long-term treatment plan",
    "cultural_practices": "Best practices to follow",
    "organic_alternatives": "Natural treatment options",
    "prevention": "Prevention strategies for future"
  },
  "additional_notes": "Important information about the disease",
  "severity_explanation": "Why this severity level was assigned",
  "disease_info": {
    "scientific_name": "Scientific name of pathogen",
    "common_symptoms": ["symptom1", "symptom2"],
    "affected_crops": ["crop1", "crop2"]
  }
}`
      : `You are an expert agricultural pathologist with extensive training in plant disease identification. ${languageInstruction}

Analyze the provided crop image and provide a comprehensive disease analysis.

IMPORTANT: First identify what crop this is from the image, then analyze for diseases.

Location: ${location || 'Unknown'}

Return ONLY valid JSON (no markdown, no code blocks) with these exact keys:
{
  "disease_name": "Name of the disease or 'Healthy Crop'",
  "crop_type": "Identified crop name (e.g., Tomato, Rice, Wheat, Cotton, Potato, Corn)",
  "severity": "low/medium/high",
  "confidence_score": 0.85,
  "affected_area_percentage": 25,
  "primary_symptoms": ["symptom1", "symptom2", "symptom3"],
  "treatment_recommendations": {
    "immediate_action": "Immediate steps to take",
    "systemic_treatment": "Long-term treatment plan",
    "cultural_practices": "Best practices to follow",
    "organic_alternatives": "Natural treatment options",
    "prevention": "Prevention strategies for future"
  },
  "additional_notes": "Important information about the disease",
  "severity_explanation": "Why this severity level was assigned",
  "disease_info": {
    "scientific_name": "Scientific name of pathogen",
    "common_symptoms": ["symptom1", "symptom2"],
    "affected_crops": ["crop1", "crop2"]
  }
}`;

    const simplePrompt = displayCropType
      ? `You are an expert agricultural pathologist. ${languageInstruction}

Analyze this ${displayCropType} crop image for diseases.

Crop Type: ${displayCropType}

Return ONLY valid JSON with these keys:
{
  "disease_name": "Disease name or 'Healthy Crop'",
  "crop_type": "${displayCropType}",
  "severity": "low/medium/high",
  "confidence_score": 0.85,
  "treatment_recommendations": "Treatment advice here"
}`
      : `You are an expert agricultural pathologist. ${languageInstruction}

Analyze this crop image for diseases.

IMPORTANT: First identify what crop this is from the image.

Return ONLY valid JSON with these keys:
{
  "disease_name": "Disease name or 'Healthy Crop'",
  "crop_type": "Identified crop name (e.g., Tomato, Rice, Wheat)",
  "severity": "low/medium/high",
  "confidence_score": 0.85,
  "treatment_recommendations": "Treatment advice here"
}`;

    const prompt = enhanced_mode ? enhancedPrompt : simplePrompt;

    // Extract base64 data from the image
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(':')[1].split(';')[0];

    // Call Gemini Vision API
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: enhanced_mode ? 8000 : 4000
          }
        })
      });

      console.log('Gemini response status:', geminiResponse.status);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', geminiResponse.status, errorText);

        // Fallback demo analysis
        const fallbackAnalysis = {
          disease_name: "Bacterial Leaf Spot",
          crop_type: "Tomato",
          severity: "medium",
          confidence_score: 0.75,
          treatment_recommendations: "Apply copper-based bactericide spray. Remove affected leaves and ensure good air circulation."
        };

        console.log('Using fallback analysis due to API error:', fallbackAnalysis);
        return new Response(
          JSON.stringify({ success: true, analysis: fallbackAnalysis, fallback: true, note: "Using demo analysis - AI service temporarily unavailable" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const geminiData = await geminiResponse.json();
      console.log('Gemini response received, candidates:', geminiData.candidates?.length);

      const candidate = geminiData.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        console.error('No text in Gemini response. Full response:', JSON.stringify(geminiData));
        throw new Error('No analysis content returned from Gemini');
      }

      const analysisText = candidate.content.parts[0].text;
      console.log('Gemini analysis text preview:', analysisText.substring(0, 200));

      // Parse JSON response, strip markdown if present
      let analysisResult;
      try {
        const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysisResult = JSON.parse(cleanText);
        analysisResult.analysis_method = 'gemini-2.5-flash';
        console.log('Successfully parsed Gemini disease analysis');
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw text:', analysisText.substring(0, 500));
        
        // Fallback with the text as recommendations
        analysisResult = {
          disease_name: "Analysis completed",
          crop_type: crop_type || "Unknown",
          severity: "medium",
          confidence_score: 0.5,
          treatment_recommendations: analysisText,
          analysis_method: 'gemini-2.5-flash-text'
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          analysis: analysisResult,
          model: 'gemini-2.5-flash'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error in Gemini API call:', error);
      
      // Final fallback
      const finalFallback = {
        disease_name: "Unable to analyze",
        crop_type: crop_type || "Unknown",
        severity: "unknown",
        confidence_score: 0.0,
        treatment_recommendations: "Unable to process image. Please try again or consult a local agricultural expert.",
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis_method: 'error_fallback'
      };

      return new Response(
        JSON.stringify({
          success: false,
          analysis: finalFallback,
          fallback: true,
          note: "Image analysis failed. Please try again."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in detect-crop-disease function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});