// Gemini API integration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_VERSION = import.meta.env.VITE_GEMINI_API_VERSION || 'v1';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
function buildGeminiUrl(model: string, version: string) {
  const base = `https://generativelanguage.googleapis.com/${version}/models`;
  return `${base}/${model}:generateContent`;
}

// System prompt for agricultural assistant
const SYSTEM_PROMPT = `You are RaithaBandava, an expert agricultural AI assistant for Indian farmers, especially in Karnataka. 
Your role is to provide:
- Crop disease identification and treatment advice
- Fertilizer recommendations with specific dosages
- Weather-based farming advice
- Market pricing strategies
- Soil management tips
- Pest control solutions
- Irrigation best practices

Respond in a friendly, conversational manner. Keep answers concise (2-4 sentences) but actionable.
Use metric units (kg/ha, liters, etc.). Mention Karnataka-specific practices when relevant.
If you don't know something specific, acknowledge it and suggest consulting local agricultural experts.`;

async function callGemini(message: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const candidateVersions = Array.from(new Set([
    GEMINI_API_VERSION,
    'v1',
    'v1beta'
  ]));
  const candidateModels = Array.from(new Set([
    GEMINI_MODEL,
    GEMINI_MODEL.endsWith('-latest') ? GEMINI_MODEL : `${GEMINI_MODEL}-latest`,
    'gemini-2.5-flash',
    'gemini-2.5-flash-latest',
    'gemini-2.5-pro',
    'gemini-2.5-pro-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro'
  ]));

  let lastError: any = null;
  for (const version of candidateVersions) {
    for (const model of candidateModels) {
      const url = `${buildGeminiUrl(model, version)}?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `User question: ${message}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
      });

      if (!response.ok) {
        let status = response.status;
        let errMsg = '';
        try {
          const errJson = await response.json();
          errMsg = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
          errMsg = await response.text();
        }
        const combined = `Gemini API error: ${status} - ${errMsg}`;
        lastError = new Error(combined);
        // If model not found or not supported on this API version, try next candidate
        if (status === 404 && /not\s+found|not\s+supported/i.test(errMsg)) {
          console.warn(`Model ${model} unsupported for ${version}. Trying next...`);
          continue;
        }
        // For rate limit/429, break and surface error to caller (will fallback to mock)
        if (status === 429 || /RESOURCE_EXHAUSTED|rate[-\s]?limit/i.test(errMsg)) {
          break;
        }
        // Other errors: try next model too
        console.warn(`Model ${model} failed on ${version} (${status}). Trying next...`);
        continue;
      }

      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        lastError = new Error('No response from Gemini');
        continue;
      }
      const text = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error('Invalid response format from Gemini');
        continue;
      }
      console.log(`Gemini success using model: ${model} on ${version}`);
      return text.trim();
    }
  }

  // If we exhausted candidates, throw last error to trigger fallback
  throw lastError || new Error('Gemini request failed');
}

function classifyQuery(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('disease') || lowerMessage.includes('blight') || lowerMessage.includes('mildew') || 
      lowerMessage.includes('pest') || lowerMessage.includes('fungus') || lowerMessage.includes('infection')) {
    return 'disease';
  }
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('drought') || 
      lowerMessage.includes('frost') || lowerMessage.includes('temperature')) {
    return 'weather';
  }
  if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('sell') || 
      lowerMessage.includes('mandi') || lowerMessage.includes('buyer')) {
    return 'market';
  }
  if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nitrogen') || lowerMessage.includes('dosage') || 
      lowerMessage.includes('nutrient') || lowerMessage.includes('urea') || lowerMessage.includes('phosphorus')) {
    return 'fertilizer';
  }
  
  return 'general';
}

// Mock responses as fallback
const mockResponses: Record<string, { reply: string; classification: string }> = {
  disease: {
    reply: "For crop disease detection, please upload an image of the affected plant. Common diseases include early blight, powdery mildew, and leaf spot. Treatment typically involves removing infected parts, improving air circulation, and applying appropriate fungicides.",
    classification: "disease"
  },
  weather: {
    reply: "For weather information, check the Weather page in the app. Generally, ensure proper drainage during heavy rains, mulch during drought, and protect crops during frost.",
    classification: "weather"
  },
  market: {
    reply: "For market prices, visit the Market Prices page. Tips: Harvest at right maturity, grade your produce, check multiple markets for best prices, and pack neatly for buyers.",
    classification: "market"
  },
  fertilizer: {
    reply: "Fertilizer recommendations vary by crop. For Rice: N: 80 kg/ha (split application), P: 40 kg/ha (basal), K: 40 kg/ha (basal). For Tomato: N: 150 kg/ha, P: 80 kg/ha, K: 200 kg/ha (split during fruiting).",
    classification: "fertilizer"
  },
  default: {
    reply: "I'm here to help with crop diseases, weather advice, market prices, and fertilizer recommendations. You can also upload plant images for disease detection. What would you like to know?",
    classification: "general"
  }
};

function getMockResponse(message: string): { reply: string; classification: string } {
  const classification = classifyQuery(message);
  return mockResponses[classification] || mockResponses.default;
}

export async function callChatbot(message: string, lang = 'en') {
  const base = import.meta.env.VITE_CHATBOT_URL || '/api/chatbot';
  
  console.log('=== Chatbot Debug Info ===');
  console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
  console.log('GEMINI_MODEL:', GEMINI_MODEL);
  console.log('GEMINI_API_VERSION:', GEMINI_API_VERSION);
  console.log('GEMINI_API_KEY length:', GEMINI_API_KEY?.length);
  console.log('Message:', message);
  
  // Try Gemini API first if API key is configured
  if (GEMINI_API_KEY) {
    try {
      console.log('✅ Using Gemini API for chatbot');
      const reply = await callGemini(message);
      console.log('✅ Gemini response received:', reply.substring(0, 100) + '...');
      const classification = classifyQuery(message);
      return { reply, classification, raw: reply };
    } catch (error: any) {
      console.error('❌ Gemini API failed:', error);
      console.error('Error details:', error.message);
      // Fall through to mock responses
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
  }
  
  // Check if we should use mock responses (when API endpoint is not configured)
  if (base === '/api/chatbot') {
    console.log('📝 Using mock responses (no API configured)');
    // Return mock response after a short delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return getMockResponse(message);
  }
  
  // Try real API call to custom endpoint
  try {
    const res = await fetch(base, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ message, lang }) 
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.warn(`API error: ${res.status}. Falling back to mock response.`);
      return getMockResponse(message);
    }
    
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.warn('Empty response from server. Falling back to mock response.');
      return getMockResponse(message);
    }
    
    try {
      const parsed = JSON.parse(text);
      // If server bubbled up an error (e.g., Gemini quota 429), use mock instead of surfacing raw error
      if (parsed && parsed.error) {
        const errStr = String(parsed.error);
        const quotaHit = /quota|429|RESOURCE_EXHAUSTED|rate[-\s]?limit/i.test(errStr);
        if (quotaHit) {
          console.warn('Upstream quota/429 error detected. Falling back to mock response.');
          return getMockResponse(message);
        }
      }
      return parsed;
    } catch (e) {
      console.warn(`Invalid JSON response. Falling back to mock response.`);
      return getMockResponse(message);
    }
  } catch (error) {
    console.warn('Network error. Using mock response:', error);
    return getMockResponse(message);
  }
}

async function callGeminiVision(imageBase64: string, prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const GEMINI_VISION_MODEL = import.meta.env.VITE_GEMINI_VISION_MODEL || GEMINI_MODEL || 'gemini-2.5-flash';
  const visionVersionCandidates = Array.from(new Set([
    GEMINI_API_VERSION,
    'v1',
    'v1beta'
  ]));
  const visionCandidates = Array.from(new Set([
    GEMINI_VISION_MODEL,
    GEMINI_VISION_MODEL.endsWith('-latest') ? GEMINI_VISION_MODEL : `${GEMINI_VISION_MODEL}-latest`,
    'gemini-2.5-flash',
    'gemini-2.5-flash-latest',
    'gemini-2.5-pro',
    'gemini-2.5-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro-vision'
  ]));

  let lastError: any = null;
  for (const version of visionVersionCandidates) {
    for (const model of visionCandidates) {
      const GEMINI_VISION_URL = buildGeminiUrl(model, version);
      const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    })
      });

      if (!response.ok) {
        let status = response.status;
        let errMsg = '';
        try {
          const errJson = await response.json();
          errMsg = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
          errMsg = await response.text();
        }
        const combined = `Gemini Vision API error: ${status} - ${errMsg}`;
        lastError = new Error(combined);
        if (status === 404 && /not\s+found|not\s+supported/i.test(errMsg)) {
          console.warn(`Vision model ${model} unsupported for ${version}. Trying next...`);
          continue;
        }
        if (status === 429 || /RESOURCE_EXHAUSTED|rate[-\s]?limit/i.test(errMsg)) {
          break;
        }
        console.warn(`Vision model ${model} failed on ${version} (${status}). Trying next...`);
        continue;
      }

      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        lastError = new Error('No response from Gemini Vision');
        continue;
      }
      const text = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error('Invalid response format from Gemini Vision');
        continue;
      }
      console.log(`Gemini Vision success using model: ${model} on ${version}`);
      return text.trim();
    }
  }
  throw lastError || new Error('Gemini Vision request failed');
}

export async function callImageInfer(imageBase64: string, fileName?: string, lang = 'en') {
  const base = import.meta.env.VITE_IMAGE_INFER_URL || '/api/image-infer';
  
  // Try Gemini Vision API first if API key is configured
  if (GEMINI_API_KEY) {
    try {
      console.log('Using Gemini Vision API for disease detection');
      const prompt = `You are an expert agricultural pathologist specializing in crop diseases in India, particularly Karnataka.

Analyze this plant image carefully and provide:

1. **Disease Identification**: Name the specific disease or pest problem (e.g., "Early Blight", "Powdery Mildew", "Aphid Infestation")
2. **Confidence Level**: Your confidence in this diagnosis (High/Medium/Low)
3. **Symptoms Observed**: What symptoms you see that led to this diagnosis
4. **Treatment Recommendations**: 
   - Immediate actions (remove infected parts, etc.)
   - Organic treatment options
   - Chemical treatment options (with specific product names available in India)
   - Dosage and application method
5. **Prevention**: How to prevent this in future
6. **Urgency**: How quickly action needs to be taken (Immediate/Within 3 days/Within a week)

Format your response clearly with these sections. If the image doesn't show a plant disease clearly, mention what you see instead and ask for a clearer image of affected parts.`;

      const analysisText = await callGeminiVision(imageBase64, prompt);
      
      // Parse the response to extract disease name
      const lines = analysisText.split('\n');
      let diseaseName = 'Plant Analysis Result';
      
      // Try to extract disease name from the first few lines
      for (const line of lines.slice(0, 5)) {
        if (line.includes('Disease') || line.includes('Identification') || line.includes('**1')) {
          const match = line.match(/[:：]\s*(.+?)(?:\s*\*\*|$)/);
          if (match && match[1]) {
            diseaseName = match[1].trim();
            break;
          }
        }
      }
      
      return {
        disease: diseaseName,
        recommendation: analysisText,
        confidence: analysisText.toLowerCase().includes('high confidence') ? 0.9 : 
                   analysisText.toLowerCase().includes('medium confidence') ? 0.7 : 0.5,
        raw: analysisText
      };
    } catch (error) {
      console.warn('Gemini Vision API failed, falling back to mock:', error);
      // Fall through to mock responses
    }
  }
  
  // Check if we should use mock responses (when API endpoint is not configured)
  if (base === '/api/image-infer') {
    console.log('Using mock image detection (no API configured)');
    // Return mock response after a short delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      disease: "Early Blight (Mock Detection)",
      recommendation: "This is a mock response. To enable real disease detection, please configure VITE_GEMINI_API_KEY in your .env.local file.\n\nMock recommendation:\n- Remove infected leaves immediately\n- Apply copper-based fungicide (Kocide 2000 @ 2g/L)\n- Improve air circulation between plants\n- Avoid overhead watering\n- Apply fungicide every 7-10 days for 3 weeks\n- Practice crop rotation next season",
      confidence: 0.85
    };
  }
  
  // Try real API call to custom endpoint
  try {
    const res = await fetch(base, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ imageBase64, fileName, lang }) 
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.warn(`API error: ${res.status}. Falling back to mock response.`);
      return {
        disease: "Disease Detection Unavailable",
        recommendation: "The disease detection service is currently unavailable. Please try again later or consult with a local agricultural expert.",
        confidence: 0
      };
    }
    
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.warn('Empty response from server. Falling back to mock response.');
      return {
        disease: "Disease Detection Unavailable",
        recommendation: "No response from disease detection service. Please try again.",
        confidence: 0
      };
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn(`Invalid JSON response. Falling back to mock response.`);
      return {
        disease: "Disease Detection Error",
        recommendation: "Unable to process the image. Please try with a clearer image.",
        confidence: 0
      };
    }
  } catch (error) {
    console.warn('Network error. Using mock response:', error);
    return {
      disease: "Mock Disease Detection",
      recommendation: "Network error occurred. This is a mock response. For real detection, please configure the API endpoints.",
      confidence: 0
    };
  }
}
