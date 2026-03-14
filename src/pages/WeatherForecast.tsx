import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface WeatherCondition {
  en: string;
  kn: string;
  icon: string;
}

interface CropData {
  name: string;
  season: string;
  description: string;
  image: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed?: number;
  weatherCode: number;
  forecast?: {
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  surface_pressure: number;
}

interface DailyWeather {
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface WeatherAPIResponse {
  current: CurrentWeather;
  daily: DailyWeather;
}

type Language = 'en' | 'kn';
// type ContentSection = 'home-content' | 'features-content' | 'about-content';

const WeatherForecast: React.FC = () => {
  // State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [currentSection, setCurrentSection] = useState<ContentSection>('home-content');
  const [locationInput, setLocationInput] = useState<string>('');
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showWeather, setShowWeather] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Translations
  const translations = {
    kn: {
      'main-title': 'ರೈತ ಬಂಧವ - Raitha Bandhava',
      'subtitle': 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಮಾಹಿತಿ ವೇದಿಕೆ',
      'location-title': 'ನಿಮ್ಮ ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ',
      'location-description': 'ನಿಖರವಾದ ಹವಾಮಾನ ಮಾಹಿತಿಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳ ಪ್ರವೇಶ ಅನುಮತಿ ನೀಡಿ',
      'get-weather-btn': '📍 ನನ್ನ ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ',
      'manual-text': 'ಅಥವಾ ಸ್ಥಳದ ಹೆಸರು ನಮೂದಿಸಿ:',
      'manual-weather-btn': 'ಹವಾಮಾನ ಪಡೆಯಿರಿ',
      'details-title': 'ವಿವರಗಳು',
      'humidity-label': 'ತೇವಾಂಶ:',
      'wind-label': 'ಗಾಳಿಯ ವೇಗ:',
      'pressure-label': 'ವಾಯುಒತ್ತಡ:',
      'visibility-label': 'ಗೋಚರತೆ:',
      'forecast-title': '೭ ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ನೋಟ',
      'recommendations-title': 'ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ಸಲಹೆಗಳು',
      'loading-text': 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'error-text': 'ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'crops-title': 'ಈ ಪ್ರದೇಶಕ್ಕೆ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು',
      'home-btn': 'ಮುಖಪುಟ',
      'features-btn': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
      'about-btn': 'ನಮ್ಮ ಬಗ್ಗೆ',
      'features-title': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
      'about-title': 'ನಮ್ಮ ಬಗ್ಗೆ',
    },
    en: {
      'main-title': 'Raitha Bandhava - Farmer\'s Companion',
      'subtitle': 'Smart Agriculture Based Weather Forecasting Platform',
      'location-title': 'Detect Your Location',
      'location-description': 'Allow location access for accurate weather information',
      'get-weather-btn': '📍 Detect My Location',
      'manual-text': 'Or enter location name:',
      'manual-weather-btn': 'Get Weather',
      'details-title': 'Details',
      'humidity-label': 'Humidity:',
      'wind-label': 'Wind Speed:',
      'pressure-label': 'Pressure:',
      'visibility-label': 'Visibility:',
      'forecast-title': '7-Day Weather Forecast',
      'recommendations-title': 'Crop Recommendations & Advice',
      'loading-text': 'Loading weather information...',
      'error-text': 'Error fetching weather information. Please try again.',
      'crops-title': 'Best Suited Crops for This Region',
      'home-btn': 'Home',
      'features-btn': 'Features',
      'about-btn': 'About',
      'features-title': 'Features',
      'about-title': 'About Us',
    }
  };

  // Get recommended crops based on weather
  const getRecommendedCrops = (): CropData[] => {
    if (!currentWeatherData) return [];

    const { temperature, humidity, weatherCode } = currentWeatherData;
    const crops: CropData[] = [];

    // Rice - needs high humidity and moderate temperature
    if (temperature >= 20 && temperature <= 35 && humidity > 70) {
      crops.push(
        currentLanguage === 'kn' 
          ? { name: 'ಬತ್ತ', season: 'ಖರೀಫ್ ಮಾನ್ಸೂನ್', description: 'ಸಾರವಾಂತ ಮಣ್ಣು ಮತ್ತು ಹೆಚ್ಚಿನ ನೀರು ಅಗತ್ಯ. ಈ ಹವಾಮಾನ ಸೂಕ್ತ.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop' }
          : { name: 'Rice', season: 'Kharif Monsoon', description: 'Needs fertile soil and abundant water. Current conditions are suitable.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop' }
      );
    }

    // Ragi - drought resistant, suitable for dry conditions
    if (temperature >= 20 && temperature <= 32 && humidity >= 40) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ರಾಗಿ', season: 'ಖರೀಫ್', description: 'ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಬೆಳೆಯಬಲ್ಲದು. ಪೌಷ್ಟಿಕ ಧಾನ್ಯ.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' }
          : { name: 'Ragi (Finger Millet)', season: 'Kharif', description: 'Drought-resistant and highly nutritious. Good for current climate.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' }
      );
    }

    // Jowar - suitable for semi-arid regions
    if (temperature >= 22 && temperature <= 32 && humidity >= 30 && humidity <= 70) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಜೋಳ', season: 'ಖರೀಫ್ ಮತ್ತು ರಬಿ', description: 'ಶುಷ್ಕ ಪ್ರದೇಶಕ್ಕೆ ಅತ್ಯುತ್ತಮ. ಮಧ್ಯಮ ನೀರು ಅಗತ್ಯ.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop' }
          : { name: 'Jowar (Sorghum)', season: 'Kharif & Rabi', description: 'Excellent for semi-arid areas. Moderate water needs.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop' }
      );
    }

    // Maize - versatile crop
    if (temperature >= 21 && temperature <= 30) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಮೆಕ್ಕೆಜೋಳ', season: 'ವರ್ಷವಿಡೀ', description: 'ಬಹುಮುಖ ಬೆಳೆ. ಪ್ರಸ್ತುತ ತಾಪಮಾನ ಸೂಕ್ತ.', image: 'https://images.unsplash.com/photo-1603564372039-6e39cf76aca1?w=300&h=200&fit=crop' }
          : { name: 'Maize (Corn)', season: 'Year-round', description: 'Versatile crop. Current temperature is ideal.', image: 'https://images.unsplash.com/photo-1603564372039-6e39cf76aca1?w=300&h=200&fit=crop' }
      );
    }

    // Cotton - needs warm weather and moderate humidity
    if (temperature >= 21 && temperature <= 35 && humidity >= 50 && humidity <= 80) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಹತ್ತಿ', season: 'ಖರೀಫ್', description: 'ನಗದು ಬೆಳೆ. ಬೆಚ್ಚಗಿನ ಹವಾಮಾನ ಅಗತ್ಯ.', image: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=300&h=200&fit=crop' }
          : { name: 'Cotton', season: 'Kharif', description: 'Cash crop. Requires warm weather conditions.', image: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=300&h=200&fit=crop' }
      );
    }

    // Sugarcane - needs high humidity and warmth
    if (temperature >= 25 && temperature <= 35 && humidity > 75) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಕಬ್ಬು', season: 'ವರ್ಷವಿಡೀ', description: 'ಹೆಚ್ಚಿನ ಮೌಲ್ಯದ ಬೆಳೆ. ಹೆಚ್ಚು ನೀರು ಅಗತ್ಯ.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop' }
          : { name: 'Sugarcane', season: 'Year-round', description: 'High-value crop. Needs abundant water.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop' }
      );
    }

    // Pulses - for moderate conditions
    if (temperature >= 18 && temperature <= 30 && humidity >= 40 && humidity <= 70) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಕಾಳುಗಳು (ತೊಗರಿ, ಹೆಸರು)', season: 'ರಬಿ', description: 'ಪ್ರೋಟೀನ್ ಸಮೃದ್ಧ. ಮಧ್ಯಮ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತ.', image: 'https://images.unsplash.com/photo-1589927986089-35812378d5c5?w=300&h=200&fit=crop' }
          : { name: 'Pulses (Pigeon Pea, Gram)', season: 'Rabi', description: 'Protein-rich. Suitable for moderate climate.', image: 'https://images.unsplash.com/photo-1589927986089-35812378d5c5?w=300&h=200&fit=crop' }
      );
    }

    // Groundnut - needs moderate rainfall
    if (temperature >= 20 && temperature <= 30 && humidity >= 50 && humidity <= 75) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಕಡಲೆಕಾಯಿ', season: 'ಖರೀಫ್', description: 'ತೈಲ ಬೀಜ ಬೆಳೆ. ಮಧ್ಯಮ ಮಳೆ ಅಗತ್ಯ.', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=300&h=200&fit=crop' }
          : { name: 'Groundnut', season: 'Kharif', description: 'Oilseed crop. Needs moderate rainfall.', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=300&h=200&fit=crop' }
      );
    }

    // If no specific matches, provide general recommendations
    if (crops.length === 0) {
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ರಾಗಿ', season: 'ಖರೀಫ್', description: 'ಬಹುತೇಕ ಎಲ್ಲಾ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಬೆಳೆಯಬಲ್ಲದು.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' }
          : { name: 'Ragi (Finger Millet)', season: 'Kharif', description: 'Can grow in most conditions.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' }
      );
      crops.push(
        currentLanguage === 'kn'
          ? { name: 'ಜೋಳ', season: 'ಖರೀಫ್ ಮತ್ತು ರಬಿ', description: 'ಬಹುಮುಖ ಮತ್ತು ಸಹಿಷ್ಣು ಬೆಳೆ.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop' }
          : { name: 'Jowar (Sorghum)', season: 'Kharif & Rabi', description: 'Versatile and tolerant crop.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop' }
      );
    }

    return crops;
  };

  // Weather code mappings
  const getWeatherCondition = (weatherCode: number): WeatherCondition => {
    const weatherCodes: Record<number, WeatherCondition> = {
      0: { en: 'Clear Sky', kn: 'ಸ್ಪಷ್ಟ ಆಕಾಶ', icon: '☀️' },
      1: { en: 'Mainly Clear', kn: 'ಮುಖ್ಯವಾಗಿ ಸ್ಪಷ್ಟ', icon: '🌤️' },
      2: { en: 'Partly Cloudy', kn: 'ಭಾಗಶಃ ಮೋಡ', icon: '⛅' },
      3: { en: 'Overcast', kn: 'ಮೋಡ ಕವಿದ', icon: '☁️' },
      45: { en: 'Fog', kn: 'ಮಂಜು', icon: '🌫️' },
      48: { en: 'Depositing Rime Fog', kn: 'ಹಿಮ ಮಂಜು', icon: '🌫️' },
      51: { en: 'Light Drizzle', kn: 'ಸಣ್ಣ ಸಿಂಪರಣೆ', icon: '🌦️' },
      53: { en: 'Moderate Drizzle', kn: 'ಮಧ್ಯಮ ಸಿಂಪರಣೆ', icon: '🌦️' },
      55: { en: 'Dense Drizzle', kn: 'ಸಾಂದ್ರ ಸಿಂಪರಣೆ', icon: '🌦️' },
      61: { en: 'Slight Rain', kn: 'ಸಣ್ಣ ಮಳೆ', icon: '🌧️' },
      63: { en: 'Moderate Rain', kn: 'ಮಧ್ಯಮ ಮಳೆ', icon: '🌧️' },
      65: { en: 'Heavy Rain', kn: 'ಭಾರೀ ಮಳೆ', icon: '🌧️' },
      71: { en: 'Slight Snow', kn: 'ಸಣ್ಣ ಹಿಮ', icon: '🌨️' },
      73: { en: 'Moderate Snow', kn: 'ಮಧ್ಯಮ ಹಿಮ', icon: '🌨️' },
      75: { en: 'Heavy Snow', kn: 'ಭಾರೀ ಹಿಮ', icon: '🌨️' },
      80: { en: 'Rain Showers', kn: 'ಮಳೆ ಸುರಿತ', icon: '🌦️' },
      81: { en: 'Rain Showers', kn: 'ಮಳೆ ಸುರಿತ', icon: '🌦️' },
      82: { en: 'Heavy Rain Showers', kn: 'ಭಾರೀ ಮಳೆ ಸುರಿತ', icon: '🌧️' },
      95: { en: 'Thunderstorm', kn: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ', icon: '⛈️' },
      96: { en: 'Thunderstorm with Hail', kn: 'ಗುಡುಗು ಸಹಿತ ಆಲಿಕಲ್ಲು', icon: '⛈️' },
      99: { en: 'Thunderstorm with Heavy Hail', kn: 'ಗುಡುಗು ಸಹಿತ ಭಾರೀ ಆಲಿಕಲ್ಲು', icon: '⛈️' }
    };
    return weatherCodes[weatherCode] || { en: 'Unknown', kn: 'ಗೊತ್ತಿಲ್ಲದ', icon: '❓' };
  };

  // Location detection
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError(currentLanguage === 'kn' ? 'ಗಿಯೋಲೊಕೇಷನ್ ಸಪೋರ್ಟ್ ಇಲ್ಲ' : 'Geolocation not supported');
      setShowManualInput(true);
      return;
    }

    if (!(window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      setError(currentLanguage === 'kn' ? 'ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ ಅಗತ್ಯವಿದೆ. ಮ್ಯಾನುಅಲ್ ಆಗಿ ಸ್ಥಳ ನಮೂದಿಸಿ.' : 'Secure connection required for location access. Please enter location manually.');
      setShowManualInput(true);
      return;
    }

    setIsLoading(true);
    setLocationStatus(currentLanguage === 'kn' ? 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await getWeatherByCoords(lat, lon);
      },
      (error) => {
        setLocationStatus('');
        setIsLoading(false);
        let errorMsg;
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = currentLanguage === 'kn' ? 'ಸ್ಥಳ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ' : 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = currentLanguage === 'kn' ? 'ಸ್ಥಳ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ' : 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = currentLanguage === 'kn' ? 'ಸ್ಥಳ ಪತ್ತೆ ಸಮಯ ಮೀರಿದೆ' : 'Location request timeout';
            break;
          default:
            errorMsg = currentLanguage === 'kn' ? 'ಸ್ಥಳ ಪತ್ತೆಯಲ್ಲಿ ದೋಷ' : 'Error detecting location';
        }
        
        setError(errorMsg);
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Get weather by coordinates
  const getWeatherByCoords = async (lat: number, lon: number) => {
    setIsLoading(true);
    setError('');
    setShowWeather(false);
    
    try {
      // Get location name using reverse geocoding
      const reverseGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=${currentLanguage}`;
      let locationName = 'Your Location';
      
      try {
        const reverseGeoResponse = await fetch(reverseGeoUrl);
        const reverseGeoData = await reverseGeoResponse.json();
        if (reverseGeoData.results && reverseGeoData.results.length > 0) {
          locationName = reverseGeoData.results[0].name;
        }
      } catch (geoError) {
        locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      }
      
      // Get weather data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
      
      const weatherResponse = await fetch(weatherUrl);
      const weatherData: WeatherAPIResponse = await weatherResponse.json();
      
      setCurrentLocation(locationName);
      setCurrentWeatherData({
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        weatherCode: weatherData.current.weather_code,
        windSpeed: weatherData.current.wind_speed_10m,
        forecast: weatherData.daily
      });
      
      setLocationStatus('');
      setShowWeather(true);
      
    } catch (error) {
      setError(currentLanguage === 'kn' ? 'ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ' : 'Error fetching weather data');
      setIsLoading(false);
      setLocationStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual weather fetch
  const getWeatherManual = async () => {
    if (!locationInput.trim()) {
      setError(currentLanguage === 'kn' ? 'ದಯವಿಟ್ಟು ಸ್ಥಳದ ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter a location');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowWeather(false);

    try {
      // Get coordinates using geocoding
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationInput)}&count=1&language=${currentLanguage}`;
      
      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();
      
      if (!geocodingData.results || geocodingData.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const { latitude, longitude, name } = geocodingData.results[0];
      
      // Get weather data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
      
      const weatherResponse = await fetch(weatherUrl);
      const weatherData: WeatherAPIResponse = await weatherResponse.json();
      
      setCurrentLocation(name);
      setCurrentWeatherData({
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        weatherCode: weatherData.current.weather_code,
        windSpeed: weatherData.current.wind_speed_10m,
        forecast: weatherData.daily
      });
      
      setShowWeather(true);

    } catch (error) {
      setError(currentLanguage === 'kn' ? 'ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ' : 'Error fetching weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate recommendations
  const generateRecommendations = (): string[] => {
    if (!currentWeatherData) return [];

    const recommendations: string[] = [];
    const { temperature, humidity, weatherCode } = currentWeatherData;

    // Temperature-based recommendations
    if (temperature >= 20 && temperature <= 30) {
      recommendations.push(currentLanguage === 'kn' ? 
        '🌾 ಬತ್ತ ಬೆಳೆಗೆ ಆದರ್ಶ ತಾಪಮಾನ - ನೀರಾವರಿ ಮುಂದುವರಿಸಿ' : 
        '🌾 Ideal temperature for rice cultivation - continue irrigation');
    }
    
    if (temperature >= 21 && temperature <= 32) {
      recommendations.push(currentLanguage === 'kn' ? 
        '🌽 ಜೋಳ ಮತ್ತು ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಉತ್ತಮ ಪರಿಸ್ಥಿತಿ' : 
        '🌽 Good conditions for jowar and maize');
    }
    
    if (temperature > 35) {
      recommendations.push(currentLanguage === 'kn' ? 
        '🌡️ ಅತಿ ಬಿಸಿ - ಎಲ್ಲಾ ಬೆಳೆಗಳಿಗೆ ಹೆಚ್ಚುವರಿ ನೀರಾವರಿ ಮತ್ತು ನೆರಳು ಅಗತ್ಯ' : 
        '🌡️ Very Hot - All crops need extra irrigation and shade protection');
    }

    // Humidity-based recommendations  
    if (humidity > 80) {
      recommendations.push(currentLanguage === 'kn' ? 
        '💧 ಹೆಚ್ಚಿನ ತೇವಾಂಶ - ಶಿಲೀಂಧ್ರ ರೋಗಗಳಿಗೆ ಗಮನ ನೀಡಿ, ಒಳಚರಂಡಿ ಸುಧಾರಿಸಿ' : 
        '💧 High humidity - watch for fungal diseases, improve drainage');
    }

    // Weather condition recommendations
    if (weatherCode >= 61 && weatherCode <= 65) {
      recommendations.push(currentLanguage === 'kn' ? 
        '🌧️ ಮಳೆಯ ಹವಾಮಾನ - ನೀರಾವರಿ ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಮಣ್ಣಿನ ಒಳಚರಂಡಿ ಪರಿಶೀಲಿಸಿ' : 
        '🌧️ Rainy weather - reduce irrigation and check soil drainage');
    }

    return recommendations;
  };

  // Render forecast
  const renderForecast = () => {
    if (!currentWeatherData?.forecast) return null;

    const days = currentLanguage === 'kn' ? 
      ['ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ', 'ಭಾನು'] :
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
        {currentWeatherData.forecast.weather_code.slice(0, 7).map((code, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          const dayIndex = date.getDay();
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          
          const condition = getWeatherCondition(code);
          const maxTemp = Math.round(currentWeatherData.forecast!.temperature_2m_max[index]);
          const minTemp = Math.round(currentWeatherData.forecast!.temperature_2m_min[index]);
          
          return (
            <Card key={index} className="text-center p-2 hover:shadow-md transition-shadow">
              <div className="font-semibold text-green-700 mb-1">
                {days[adjustedIndex]}
              </div>
              <div className="text-2xl mb-1">{condition.icon}</div>
              <div className="text-sm text-gray-600">
                {maxTemp}°/{minTemp}°
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Crop cultivation tips (basic mock data)
  const getCropTips = (cropName: string): string[] => {
    const name = cropName.toLowerCase();
    const kn = currentLanguage === 'kn';
    if (name.includes('rice') || name.includes('ಬತ್ತ')) {
      return kn
        ? ['ಸಮತಟ್ಟಾದ ಹೊಲದಲ್ಲಿ ಉತ್ತಮ ನೀರಿನ ನಿರ್ವಹಣೆ', 'ಬಿತ್ತನೆಗೆ ಪ್ರಮಾಣಿತ ಬೀಜ ಬಳಸಿರಿ', 'ಮೊದಲ 40 ದಿನ ಕಳೆ ನಿಯಂತ್ರಣ ಮುಖ್ಯ', 'ಪೋಟಾಶ್ ಸಮತೋಲನದಿಂದ ಕೊಂಬೆ ಬೆಳವಣಿಗೆ ಸುಧಾರಣೆ', 'ಕೊನೆಯ ಹಂತದಲ್ಲಿ ನೀರಾವರಿ ನಿಧಾನವಾಗಿ ಕಡಿಮೆ ಮಾಡಿ']
        : ['Maintain consistent flooded field early', 'Use certified seeds for sowing', 'Weed control crucial first 40 days', 'Balanced potash improves tillering', 'Reduce irrigation gradually at maturity'];
    }
    if (name.includes('ragi') || name.includes('finger') || name.includes('ರಾಗಿ')) {
      return kn
        ? ['ಬಿತ್ತನೆಗೂ ಮುನ್ನ ಬೀಜ ಶೋಧನೆ', 'ಮಧ್ಯಮ ನೀರಾವರಿ — ನೀರಿನ ನಿಲುವು ತಪ್ಪಿಸಿ', 'ಬೇಸಲ್ ಡೋಸ್ ನಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್ ಸೇರಿಸಿ', 'ಎಲೆ ಕಲೆ ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ಸ್ಪ್ರೇ', 'ಪರಿಪಕ್ವವಾಗಿದಾಗ ತಲೆ ಕತ್ತರಿಸಿ ಒಣಗಲು ಬಿಡಿ']
        : ['Treat seeds before sowing', 'Moderate irrigation — avoid standing water', 'Add compost in basal dose', 'Spray promptly on leaf spot signs', 'Harvest heads and sun-dry thoroughly'];
    }
    if (name.includes('jowar') || name.includes('sorghum') || name.includes('ಜೋಳ')) {
      return kn
        ? ['ಒಣ ಮಣ್ಣಿನಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿದ ನಂತರ ಹಗುರ ನೀರಾವರಿ', 'ಬೆಳೆ ಆರಂಭದಲ್ಲಿ ಕಳೆ ತೆಗೆದುಹಾಕಿ', 'ಸ್ಟೆಮ್ ಬೋರರ್ ವಿರುದ್ಧ ಟ್ರಾಪ್ ಬಳಸಿ', 'ಸಾಲುಗಳ ನಡುವೆ ಗಾಳಿಯ ಸಂಚಲನ ಖಚಿತಪಡಿಸಿ', 'ಕಾಯೆಗಳ ಸುಕ್ಕುಗಟ್ಟುವಾಗಲೇ ಕೊಯ್ಲು']
        : ['Light irrigation after sowing in dry soil', 'Early weeding improves stand', 'Use traps for stem borer control', 'Ensure airflow between rows', 'Harvest when panicles dry'];
    }
    if (name.includes('maize') || name.includes('corn') || name.includes('ಮೆಕ್ಕೆ')) {
      return kn
        ? ['ಬಿತ್ತನೆ ಆಳ 4–5 ಸೆಂ.ಮೀ', 'ನೀರಾವರಿ ನಿರಂತರವಾಗಿ — ನೀರಿನ ನಿಲುವು ತಪ್ಪಿಸಿ', 'ನೈಟ್ರೋಜನ್ ವಿಭಜಿತ ಪ್ರಮಾಣದಲ್ಲಿ ನೀಡಿ', 'ಫಾಲ್ ಆರ್ಮಿ ವರ್ಮ್ ನಿಯಮಿತ ಪರಿಶೀಲನೆ', 'ಕೋಂಬೆಗಳು ಒಣ ನೇರಳೆ ಆಗುವಾಗ ಕೊಯ್ಲು']
        : ['Maintain 4–5 cm sowing depth', 'Consistent irrigation — avoid waterlogging', 'Split apply nitrogen doses', 'Scout regularly for fall armyworm', 'Harvest when husks dry and kernels hard'];
    }
    if (name.includes('cotton') || name.includes('ಹತ್ತಿ')) {
      return kn
        ? ['ಬಿತ್ತನೆಗೂ ಮುನ್ನ ಮಣ್ಣು ಪರೀಕ್ಷೆ', 'ಪಿಂಕ್ ಬೋಲ್ವಾಮ್ ಮಾನಿಟರಿಂಗ್ ಫೆರೋಮೋನ್ ಟ್ರಾಪ್', 'ನೀರಾವರಿ ಮಧ್ಯಮ — ಅತಿ ಹೆಚ್ಚು ತಪ್ಪಿಸಿ', 'ಪೋಟಾಶ್ ಕಡಿಮೆ ಇದ್ದರೆ ಎಲೆ ಹಳದಾಗುತ್ತದೆ', 'ಸಮಯಕ್ಕೆ ಬೋಲ್ ತೆರೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಕೊಯ್ಲು']
        : ['Soil test before sowing', 'Monitor pink bollworm with pheromone traps', 'Moderate irrigation — avoid excess', 'Watch for potassium deficiency (yellowing leaves)', 'Harvest before full boll opening'];
    }
    if (name.includes('sugarcane') || name.includes('ಕಬ್ಬು')) {
      return kn
        ? ['ಆರೋಗ್ಯಕರ ಸೆಟ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ', 'ಮುಂಜಾನೆ ಸೂರ್ಯದಲ್ಲಿ ನೆಡುವುದು ಉತ್ತಮ', 'ನೀರಾವರಿ ಸಮಯಪಾಲನೆ; ನೀರಿನ ನಿಲುವು ತಪ್ಪಿಸಿ', 'ಎಲೆ ಕತ್ತರಿಸುವುದು ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಹಾಯಕ', 'ಸेंद್ರೀಯ ವಸ್ತು ಸೇರಿಸಿ ಮಣ್ಣು ರಚನೆ ಸುಧಾರಣೆ']
        : ['Select healthy setts', 'Plant in cool morning hours', 'Timely irrigation; avoid stagnation', 'Trash mulching aids pest control', 'Add organic matter to improve soil structure'];
    }
    if (name.includes('groundnut') || name.includes('ಕಡಲೆ')) {
      return kn
        ? ['ಬಿತ್ತನೆಗೂ ಮುನ್ನ ಕ್ಯಾಲ್ಸಿಯಂ ಮೂಲ ಸೇರಿಸಿ', 'ಹೂ ಉತ್ಕರ್ಷ ಸಂದರ್ಭದಲ್ಲಿ ನೀರಾವರಿ', 'ಮಣ್ಣು ಸಾದುಸ್ತರದಲ್ಲಿರಲಿ — ಗಡ್ಡಾಗದಂತೆ', 'ಆಫಿಡ್ ಕಂಡಾಗ ನೈಸರ್ಗಿಕ ಕೀಟ ನಿಯಂತ್ರಣ', 'ಕೊಯ್ಲಿನ ಬಳಿಕ ಬೇರು ಕತ್ತರಿಸಿ ಒಣಗಿಸಿ']
        : ['Apply calcium source pre-sowing', 'Irrigate at peak flowering', 'Keep soil friable — avoid compaction', 'Use natural controls on aphids early', 'Lift plants and sun-dry pods after harvest'];
    }
    // Generic tips fallback
    return kn
      ? ['ಸಮತೋಲನ ಗೊಬ್ಬರ ಬಳಕೆ', 'ಪ್ರಾರಂಭಿಕ ಕಳೆ ನಿಯಂತ್ರಣ', 'ಸ್ವಚ್ಛ ನೀರಾವರಿ ಕಾಲುವೆಗಳು', 'ರೋಗ ಲಕ್ಷಣಗಳ ಮೇಲೆ ನಿಯಮಿತ ಪರಿಶೀಲನೆ', 'ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಲಹೆ ಅನುಸರಿಸಿ']
      : ['Use balanced fertilizers', 'Early weed control', 'Maintain clean irrigation channels', 'Scout regularly for disease symptoms', 'Follow local agri advisory'];
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="text-center mb-6">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-green-700 mb-2">
              {translations[currentLanguage]['main-title']}
            </CardTitle>
            <CardDescription className="text-lg text-green-600">
              {translations[currentLanguage]['subtitle']}
            </CardDescription>
            
            {/* Language Toggle */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant={currentLanguage === 'kn' ? 'default' : 'outline'}
                onClick={() => setCurrentLanguage('kn')}
                className="bg-green-600 hover:bg-green-700"
              >
                ಕನ್ನಡ
              </Button>
              <Button
                variant={currentLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => setCurrentLanguage('en')}
                className="bg-green-600 hover:bg-green-700"
              >
                English
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {/* <Button
                variant={currentSection === 'home-content' ? 'default' : 'outline'}
                onClick={() => setCurrentSection('home-content')}
                className="bg-slate-600 hover:bg-slate-700"
              >
                {translations[currentLanguage]['home-btn']}
              </Button> */}
              {/* <Button
                variant={currentSection === 'features-content' ? 'default' : 'outline'}
                onClick={() => setCurrentSection('features-content')}
                className="bg-slate-600 hover:bg-slate-700"
              >
                {translations[currentLanguage]['features-btn']}
              </Button> */}
              {/* <Button
                variant={currentSection === 'about-content' ? 'default' : 'outline'}
                onClick={() => setCurrentSection('about-content')}
                className="bg-slate-600 hover:bg-slate-700"
              >
                {translations[currentLanguage]['about-btn']}
              </Button> */}
            </div>
          </CardHeader>
        </Card>

        {/* Home Content */}
        {currentSection === 'home-content' && (
          <>
            {/* Location Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-green-700">
                  {translations[currentLanguage]['location-title']}
                </CardTitle>
                <CardDescription>
                  {translations[currentLanguage]['location-description']}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={requestLocation}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-4"
                  disabled={isLoading}
                >
                  {translations[currentLanguage]['get-weather-btn']}
                </Button>

                {locationStatus && (
                  <div className="bg-blue-50 p-4 rounded-lg text-center mb-4">
                    {locationStatus}
                  </div>
                )}

                {showManualInput && (
                  <div className="border-t pt-4">
                    <p className="text-gray-600 mb-3 text-center">
                      {translations[currentLanguage]['manual-text']}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder={currentLanguage === 'kn' ? 'ಸ್ಥಳದ ಹೆಸರು' : 'Location name'}
                        onKeyPress={(e) => e.key === 'Enter' && getWeatherManual()}
                      />
                      <Button 
                        onClick={getWeatherManual}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {translations[currentLanguage]['manual-weather-btn']}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && (
              <Card className="mb-6">
                <CardContent className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{translations[currentLanguage]['loading-text']}</p>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Weather Content */}
            {showWeather && currentWeatherData && (
              <>
                {/* Current Weather Dashboard */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Current Weather */}
                  <Card className="text-center">
                    <CardHeader>
                      <CardTitle className="text-2xl text-green-700">{currentLocation}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-5xl mb-2">
                        {getWeatherCondition(currentWeatherData.weatherCode).icon}
                      </div>
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {Math.round(currentWeatherData.temperature)}°C
                      </div>
                      <div className="text-lg text-gray-600">
                        {getWeatherCondition(currentWeatherData.weatherCode)[currentLanguage]}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-green-700">
                        {translations[currentLanguage]['details-title']}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span>{translations[currentLanguage]['humidity-label']}</span>
                        <span className="font-semibold">{currentWeatherData.humidity}%</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>{translations[currentLanguage]['wind-label']}</span>
                        <span className="font-semibold">{Math.round(currentWeatherData.windSpeed || 0)} km/h</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>{translations[currentLanguage]['pressure-label']}</span>
                        <span className="font-semibold">1013 hPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{translations[currentLanguage]['visibility-label']}</span>
                        <span className="font-semibold">10 km</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 7-Day Forecast */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-700">
                      {translations[currentLanguage]['forecast-title']}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderForecast()}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-700">
                      {translations[currentLanguage]['recommendations-title']}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generateRecommendations().map((rec, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Recommended Crops Section */}
            {showWeather && currentWeatherData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-green-700">
                    {translations[currentLanguage]['crops-title']}
                  </CardTitle>
                  <CardDescription>
                    {currentLanguage === 'kn' 
                      ? 'ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ತೆಗೆದು ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ'
                      : 'Images replaced with practical cultivation tips'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getRecommendedCrops().map((crop, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow border-green-200 flex flex-col">
                        <CardContent className="pt-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-green-700 text-lg mb-2">
                            {crop.name}
                          </h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 mb-3 self-start">
                            {crop.season}
                          </Badge>
                          <p className="text-gray-600 text-sm mb-3">
                            {crop.description}
                          </p>
                          <div className="space-y-1 text-xs text-green-800">
                            {getCropTips(crop.name).slice(0,5).map((tip, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span>🌱</span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Features Section */}
        {currentSection === 'features-content' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">
                {translations[currentLanguage]['features-title']}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <strong>Accurate Weather Forecasting:</strong> Real-time weather data and 7-day forecast with temperature, humidity, wind speed, and air pressure.
                </div>
                <div className="border-b pb-3">
                  <strong>Automated Location Detection:</strong> GPS-based location detection with manual entry fallback option.
                </div>
                <div className="border-b pb-3">
                  <strong>Weather-Based Crop Recommendations:</strong> AI-powered suggestions for crop management based on current weather conditions.
                </div>
                <div className="border-b pb-3">
                  <strong>Karnataka Crop Information:</strong> Comprehensive details about major crops grown in Karnataka.
                </div>
                <div>
                  <strong>Bilingual Support:</strong> Available in both Kannada and English for wider accessibility.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About Section */}
        {currentSection === 'about-content' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">
                {translations[currentLanguage]['about-title']}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-6xl">🚜</span>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Raitha Bandhava (which means Farmer's Companion in Kannada) is a smart agriculture platform designed to empower farmers with data-driven insights and AI-powered tools. The goal is to help farmers increase productivity, cut losses, and get fair market value for their produce.
                </p>
                <p className="mb-4">
                  <strong>Why is Weather Forecasting Helpful for Farmers?</strong>
                </p>
                <p className="mb-4">
                  Weather is the single most important factor in agricultural success. Unpredictable weather can cause significant damage to crops, leading to reduced yield and financial loss. By having access to advance weather forecasts, farmers can take proactive measures.
                </p>
                <p className="mb-4">
                  Weather forecasting also aids in crucial crop protection decisions and is critical for harvest and storage management. In essence, weather forecasting is an invaluable tool that helps mitigate risk and increase efficiency at every step of the agricultural value chain.
                </p>
                <div className="mt-8 pt-4 border-t text-center text-gray-600">
                  <p>Contact: +91 9876543210</p>
                  <p>Email: raithabandhava@gmail.com</p>
                  <p className="mt-2">Developers: Srinidhi N, Shashank M, Ajay HM, Manoj K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherForecast;