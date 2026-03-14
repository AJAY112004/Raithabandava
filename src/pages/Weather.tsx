import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCcw, 
  MapPin, 
  Sprout, 
  Calendar, 
  TrendingUp,
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

// Karnataka agricultural locations
const karnatakaLocations = [
  { name: 'Bengaluru', district: 'Bengaluru Urban' },
  { name: 'Mysuru', district: 'Mysuru' },
  { name: 'Hubballi', district: 'Dharwad' },
  { name: 'Mangaluru', district: 'Dakshina Kannada' },
  { name: 'Belagavi', district: 'Belagavi' },
  { name: 'Davangere', district: 'Davangere' },
  { name: 'Ballari', district: 'Ballari' },
  { name: 'Vijayapura', district: 'Vijayapura' },
  { name: 'Shivamogga', district: 'Shivamogga' },
  { name: 'Tumakuru', district: 'Tumakuru' },
  { name: 'Raichur', district: 'Raichur' },
  { name: 'Hassan', district: 'Hassan' },
  { name: 'Mandya', district: 'Mandya' },
  { name: 'Kolar', district: 'Kolar' }
];

interface WeatherData {
  location: string;
  district: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    pressure: number;
    visibility: number;
    windSpeed: number;
    description: string;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    rain: number;
  }>;
  cropSuggestions?: Array<{
    crop: string;
    suitability: string;
    reason: string;
    action: string;
  }>;
  farmingTips?: Array<{
    title: string;
    tip: string;
    priority: string;
    validFor?: string;
  }>;
}

const Weather = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState('Bengaluru');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchWeatherData = async (location: string) => {
    try {
      setLoading(true);
      const res = await supabase.functions.invoke('weather-data', {
        body: JSON.stringify({ location })
      });

      // supabase.functions.invoke types can vary; guard safely
      const dataAny: any = (res as any).data ?? res;

      if (dataAny?.success && dataAny.data) {
        setWeatherData(dataAny.data as WeatherData);
        setLastUpdated(new Date().toLocaleString());
        toast({
          title: t('weather.toasts.updatedTitle'),
          description: t('weather.toasts.updatedDesc').replace('{location}', dataAny.data.location)
        });
      } else {
        throw new Error('Failed to fetch weather data');
      }
    } catch (error) {
      toast({
        title: t('weather.toasts.errorTitle'),
        description: t('weather.toasts.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = 'w-12 h-12';
    switch ((condition || '').toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'cloudy':
      case 'partly cloudy':
      case 'overcast':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case 'rainy':
      case 'light rain':
      case 'heavy rain':
      case 'showers':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCcw className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">{t('weather.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('weather.header')}</h1>
          <p className="text-lg text-muted-foreground">{t('weather.subtitle')}</p>
        </div>

        {/* Location Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={t('weather.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {karnatakaLocations.map((loc) => (
                    <SelectItem key={loc.name} value={loc.name}>
                      {loc.name} - {loc.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => fetchWeatherData(selectedLocation)}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('weather.refresh')}
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2 text-center">{t('weather.lastUpdated')}: {lastUpdated}</p>
          )}
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 shadow-medium hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                {t('weather.current.title')}
              </CardTitle>
              <CardDescription>
                {loading ? t('weather.loading') : `${weatherData?.location}, ${weatherData?.district}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : weatherData ? (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {getWeatherIcon(weatherData.current.condition)}
                      <div>
                        <h3 className="text-4xl font-bold text-foreground">{weatherData.current.temperature}°C</h3>
                        <p className="text-muted-foreground capitalize">{weatherData.current.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky" />
                        <span className="text-sm text-muted-foreground">{t('weather.labels.humidity')}</span>
                        <span className="font-medium">{weatherData.current.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-sky" />
                        <span className="text-sm text-muted-foreground">{t('weather.labels.wind')}</span>
                        <span className="font-medium">{weatherData.current.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-sky" />
                        <span className="text-sm text-muted-foreground">{t('weather.labels.pressure')}</span>
                        <span className="font-medium">{weatherData.current.pressure} hPa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky" />
                        <span className="text-sm text-muted-foreground">{t('weather.labels.visibility')}</span>
                        <span className="font-medium">{weatherData.current.visibility} km</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t('weather.noData')}</p>
              )}
            </CardContent>
          </Card>

          {/* Crop Recommendations */}
          <Card className="shadow-medium hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sprout className="w-6 h-6 text-green-600" />
                {t('weather.cropRecommendations.title')}
              </CardTitle>
              <CardDescription>{t('weather.cropRecommendations.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : weatherData?.cropSuggestions ? (
                <div className="space-y-4">
                  {weatherData.cropSuggestions.map((suggestion, index) => (
                    <div key={index} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{suggestion.crop}</h4>
                        <Badge
                          variant={suggestion.suitability === 'Excellent' ? 'default' : suggestion.suitability === 'Good' ? 'secondary' : 'outline'}
                        >
                          {suggestion.suitability}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{suggestion.reason}</p>
                      <p className="text-sm font-medium text-primary">{suggestion.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">{t('weather.noRecommendations')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 5-Day Forecast */}
        <Card className="mb-8 shadow-medium hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              {t('weather.forecast.title')}
            </CardTitle>
            <CardDescription>{t('weather.forecast.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : weatherData?.forecast ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">{day.day}</h4>
                    <div className="flex justify-center mb-3">{getWeatherIcon(day.condition)}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{day.high}°</span>
                        <span className="text-muted-foreground">{day.low}°</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-sky">
                        <Droplets className="w-3 h-3" />
                        <span>{Math.round(day.rain)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{day.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{t('weather.noForecast')}</p>
            )}
          </CardContent>
        </Card>

        {/* Farming Tips */}
        <Card className="shadow-medium hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              {t('weather.tips.title')}
            </CardTitle>
            <CardDescription>{t('weather.tips.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : weatherData?.farmingTips ? (
              <div className="space-y-4">
                {weatherData.farmingTips.map((tip, index) => (
                  <div key={index} className={`border-l-4 pl-4 py-2 ${getPriorityColor(tip.priority)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{tip.title}</h4>
                      <Badge variant="outline" className="text-xs">{tip.validFor}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tip.tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{t('weather.noTips')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;