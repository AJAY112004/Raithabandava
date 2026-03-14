// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Karnataka major agricultural districts and cities
const karnatakaLocations = [
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, district: 'Bengaluru Urban' },
  { name: 'Mysuru', lat: 12.2958, lon: 76.6394, district: 'Mysuru' },
  { name: 'Hubballi', lat: 15.3647, lon: 75.1240, district: 'Dharwad' },
  { name: 'Mangaluru', lat: 12.9141, lon: 74.8560, district: 'Dakshina Kannada' },
  { name: 'Belagavi', lat: 15.8497, lon: 74.4977, district: 'Belagavi' },
  { name: 'Davangere', lat: 14.4644, lon: 75.9932, district: 'Davangere' },
  { name: 'Ballari', lat: 15.1394, lon: 76.9214, district: 'Ballari' },
  { name: 'Vijayapura', lat: 16.8302, lon: 75.7100, district: 'Vijayapura' },
  { name: 'Shivamogga', lat: 13.9299, lon: 75.5681, district: 'Shivamogga' },
  { name: 'Tumakuru', lat: 13.3379, lon: 77.1170, district: 'Tumakuru' },
  { name: 'Raichur', lat: 16.2120, lon: 77.3439, district: 'Raichur' },
  { name: 'Hassan', lat: 13.0072, lon: 76.1004, district: 'Hassan' },
  { name: 'Mandya', lat: 12.5214, lon: 76.8958, district: 'Mandya' },
  { name: 'Kolar', lat: 13.1373, lon: 78.1297, district: 'Kolar' }
];

interface WeatherData {
  location: string;
  district: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    description: string;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    rain: number;
    humidity: number;
    windSpeed: number;
  }>;
  cropSuggestions: Array<{
    crop: string;
    suitability: string;
    reason: string;
    action: string;
    priority: string;
  }>;
  farmingTips: Array<{
    title: string;
    tip: string;
    priority: string;
    validFor: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json().catch(() => ({ location: 'Bengaluru' }));
    
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!weatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    // Find the location in Karnataka locations
    const selectedLocation = karnatakaLocations.find(loc => 
      loc.name.toLowerCase().includes(location.toLowerCase())
    ) || karnatakaLocations[0]; // Default to Bengaluru

    console.log(`Fetching weather for ${selectedLocation.name}, Karnataka`);

    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&appid=${weatherApiKey}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error(`Weather API failed: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&appid=${weatherApiKey}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API failed: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Process the data
    const weatherInfo: WeatherData = {
      location: selectedLocation.name,
      district: selectedLocation.district,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind?.speed * 3.6), // Convert m/s to km/h
        pressure: currentData.main.pressure,
        visibility: Math.round((currentData.visibility || 10000) / 1000), // Convert to km
        uvIndex: 5, // UV index not available in basic plan
        description: currentData.weather[0].description
      },
      forecast: processForecastData(forecastData),
      cropSuggestions: generateCropSuggestions(currentData, forecastData),
      farmingTips: generateFarmingTips(currentData, forecastData)
    };

    return new Response(
      JSON.stringify({ success: true, data: weatherInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weather function error:', error);
    
    // Return fallback data for the requested location
    const fallbackData = generateFallbackWeatherData(req.location || 'Bengaluru');
    return new Response(
      JSON.stringify({ success: true, data: fallbackData, fallback: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processForecastData(forecastData: any) {
  const dailyForecasts = [];
  const processedDates = new Set();
  
  for (const item of forecastData.list.slice(0, 40)) { // Next 5 days
    const date = new Date(item.dt * 1000);
    const dateStr = date.toDateString();
    
    if (!processedDates.has(dateStr) && dailyForecasts.length < 5) {
      processedDates.add(dateStr);
      
      const dayName = dailyForecasts.length === 0 ? 'Today' : 
                     dailyForecasts.length === 1 ? 'Tomorrow' : 
                     date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dailyForecasts.push({
        day: dayName,
        date: date.toISOString().split('T')[0],
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather[0].main,
        rain: item.pop * 100, // Probability of precipitation
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6)
      });
    }
  }
  
  return dailyForecasts;
}

function generateCropSuggestions(currentData: any, forecastData: any) {
  const temp = currentData.main.temp;
  const humidity = currentData.main.humidity;
  const condition = currentData.weather[0].main.toLowerCase();
  
  const suggestions = [];
  
  // Rice suggestions
  if (temp >= 20 && temp <= 35 && humidity >= 60) {
    suggestions.push({
      crop: 'Rice (ಅಕ್ಕಿ)',
      suitability: 'Excellent',
      reason: `Perfect temperature (${Math.round(temp)}°C) and humidity (${humidity}%) for rice cultivation`,
      action: 'Ideal time for transplanting or field preparation',
      priority: 'high'
    });
  }
  
  // Sugarcane suggestions
  if (temp >= 20 && temp <= 30 && humidity >= 50) {
    suggestions.push({
      crop: 'Sugarcane (ಕಬ್ಬು)',
      suitability: 'Good',
      reason: `Suitable conditions with ${Math.round(temp)}°C temperature`,
      action: 'Good time for planting or irrigation',
      priority: 'medium'
    });
  }
  
  // Cotton suggestions
  if (temp >= 18 && temp <= 32 && humidity <= 70) {
    suggestions.push({
      crop: 'Cotton (ಹತ್ತಿ)',
      suitability: temp <= 28 ? 'Excellent' : 'Good',
      reason: `Temperature ${Math.round(temp)}°C is suitable for cotton growth`,
      action: temp <= 25 ? 'Ideal for sowing' : 'Good for vegetative growth',
      priority: 'high'
    });
  }
  
  // Tomato suggestions
  if (temp >= 15 && temp <= 30) {
    suggestions.push({
      crop: 'Tomato (ಟೊಮೇಟೊ)',
      suitability: temp <= 25 ? 'Excellent' : 'Good',
      reason: `Optimal temperature range for tomato cultivation`,
      action: condition.includes('rain') ? 'Provide drainage' : 'Continue normal care',
      priority: 'medium'
    });
  }
  
  // Maize suggestions
  if (temp >= 18 && temp <= 27) {
    suggestions.push({
      crop: 'Maize (ಜೋಳ)',
      suitability: 'Good',
      reason: `Good temperature conditions for maize growth`,
      action: humidity > 70 ? 'Monitor for fungal diseases' : 'Proceed with normal cultivation',
      priority: 'medium'
    });
  }
  
  return suggestions.slice(0, 4); // Return top 4 suggestions
}

function generateFarmingTips(currentData: any, forecastData: any) {
  const tips = [];
  const temp = currentData.main.temp;
  const humidity = currentData.main.humidity;
  const condition = currentData.weather[0].main.toLowerCase();
  
  // Check forecast for rain
  const rainExpected = forecastData.list.slice(0, 8).some(item => item.weather[0].main.toLowerCase().includes('rain'));
  
  if (rainExpected) {
    tips.push({
      title: 'Rainfall Alert',
      tip: 'Heavy rainfall expected in next 24-48 hours. Postpone spraying activities and ensure proper drainage.',
      priority: 'high',
      validFor: '48 hours'
    });
  }
  
  if (humidity > 80) {
    tips.push({
      title: 'High Humidity Warning',
      tip: `Humidity at ${humidity}% increases fungal disease risk. Apply preventive fungicides and ensure good air circulation.`,
      priority: 'high',
      validFor: '24 hours'
    });
  }
  
  if (temp > 35) {
    tips.push({
      title: 'Heat Stress Alert',
      tip: `Temperature ${Math.round(temp)}°C can cause heat stress. Increase irrigation frequency and provide shade if possible.`,
      priority: 'high',
      validFor: '24 hours'
    });
  } else if (temp >= 25 && temp <= 30 && humidity >= 50 && humidity <= 70) {
    tips.push({
      title: 'Optimal Growing Conditions',
      tip: 'Perfect weather conditions for most crops. Good time for field activities and crop monitoring.',
      priority: 'medium',
      validFor: '24 hours'
    });
  }
  
  // Irrigation tips based on weather
  if (!condition.includes('rain') && humidity < 60) {
    tips.push({
      title: 'Irrigation Recommendation',
      tip: 'Low humidity and no rain expected. Increase irrigation schedule, especially for water-sensitive crops.',
      priority: 'medium',
      validFor: '24 hours'
    });
  }
  
  return tips;
}

function generateFallbackWeatherData(location: string): WeatherData {
  const selectedLoc = karnatakaLocations.find(loc => 
    loc.name.toLowerCase().includes(location.toLowerCase())
  ) || karnatakaLocations[0];

  return {
    location: selectedLoc.name,
    district: selectedLoc.district,
    current: {
      temperature: 26 + Math.round(Math.random() * 8), // 26-34°C
      condition: 'Partly Cloudy',
      humidity: 60 + Math.round(Math.random() * 20), // 60-80%
      windSpeed: 8 + Math.round(Math.random() * 8), // 8-16 km/h
      pressure: 1010 + Math.round(Math.random() * 10),
      visibility: 8,
      uvIndex: 5,
      description: 'partly cloudy'
    },
    forecast: [
      { day: 'Today', date: new Date().toISOString().split('T')[0], high: 32, low: 22, condition: 'Partly Cloudy', rain: 20, humidity: 65, windSpeed: 12 },
      { day: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], high: 30, low: 20, condition: 'Light Rain', rain: 70, humidity: 75, windSpeed: 10 },
      { day: 'Day 3', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], high: 28, low: 19, condition: 'Rain', rain: 85, humidity: 80, windSpeed: 15 },
      { day: 'Day 4', date: new Date(Date.now() + 259200000).toISOString().split('T')[0], high: 31, low: 21, condition: 'Cloudy', rain: 30, humidity: 70, windSpeed: 8 },
      { day: 'Day 5', date: new Date(Date.now() + 345600000).toISOString().split('T')[0], high: 33, low: 23, condition: 'Sunny', rain: 10, humidity: 55, windSpeed: 12 }
    ],
    cropSuggestions: [
      { crop: 'Rice (ಅಕ್ಕಿ)', suitability: 'Good', reason: 'Moderate temperature and humidity suitable for rice', action: 'Continue normal cultivation', priority: 'medium' },
      { crop: 'Cotton (ಹತ್ತಿ)', suitability: 'Excellent', reason: 'Ideal temperature range for cotton growth', action: 'Good time for sowing/monitoring', priority: 'high' }
    ],
    farmingTips: [
      { title: 'Weather Advisory', tip: 'API not available. Using simulated data for demonstration.', priority: 'info', validFor: '24 hours' }
    ]
  };
}