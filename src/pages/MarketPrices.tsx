import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search, 
  MapPin,
  Calendar,
  BarChart3,
  Filter,
  Bell,
  Plus,
  User,
  Star,
  Trash2,
  RefreshCcw
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  crop_name: string;
  target_price: number;
  market_location: string;
  alert_enabled: boolean;
  created_at: string;
}

const MarketPrices = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [addAlertOpen, setAddAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
    crop_name: '',
    target_price: '',
    market_location: ''
  });
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchWatchlist();
      fetchMarketPrices();
    }
  }, [user]);

  const fetchMarketPrices = async () => {
    try {
      setLoading(true);
      // Use mock data instead of Supabase
      const data = getFallbackData();
      setMarketData(data);
      setLastUpdated(new Date().toISOString());
      setDataSource('Mock Data');
      toast({ 
        title: t('marketPrices.title'), 
        description: `Loaded ${data.length} market prices`
      });
    } catch (error) {
      console.error('Error fetching market prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market prices.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = () => {
    const karnatakaCrops = [
      { name: "Rice (ಅಕ್ಕಿ)", basePrice: 2850 },
      { name: "Ragi (ರಾಗಿ)", basePrice: 3200 },
      { name: "Jowar (ಜೋಳ)", basePrice: 1950 },
      { name: "Wheat (ಗೋಧಿ)", basePrice: 2100 },
      { name: "Bajra (ಸಜ್ಜೆ)", basePrice: 1850 },
      { name: "Cotton (ಹತ್ತಿ)", basePrice: 5900 },
      { name: "Sugarcane (ಕಬ್ಬು)", basePrice: 280 },
      { name: "Groundnut (ಕಡಲೆಕಾಯಿ)", basePrice: 5300 },
      { name: "Sunflower (ಸೂರ್ಯಕಾಂತಿ)", basePrice: 6200 },
      { name: "Soybean (ಸೋಯಾಬೀನ್)", basePrice: 4200 },
      { name: "Onion (ಈರುಳ್ಳಿ)", basePrice: 3100 },
      { name: "Tomato (ಟೊಮೇಟೊ)", basePrice: 2600 },
      { name: "Potato (ಆಲೂಗಡ್ಡೆ)", basePrice: 2200 },
      { name: "Cabbage (ಎಲೆಕೋಸು)", basePrice: 1800 },
      { name: "Cauliflower (ಹೂಕೋಸು)", basePrice: 2400 },
      { name: "Carrot (ಕ್ಯಾರೆಟ್)", basePrice: 2800 },
      { name: "Beans (ಬೀನ್ಸ್)", basePrice: 3200 },
      { name: "Chili (ಮೆಣಸಿನಕಾಯಿ)", basePrice: 8200 },
      { name: "Turmeric (ಅರಿಶಿನ)", basePrice: 7500 },
      { name: "Coriander (ಕೊತ್ತಂಬರಿ)", basePrice: 6800 },
      { name: "Coffee (ಕಾಫಿ)", basePrice: 8500 },
      { name: "Arecanut (ಅಡಿಕೆ)", basePrice: 15000 },
      { name: "Coconut (ತೆಂಗಿನಕಾಯಿ)", basePrice: 1200 },
      { name: "Banana (ಬಾಳೆಹಣ್ಣು)", basePrice: 2500 },
      { name: "Mango (ಮಾವಿನಹಣ್ಣು)", basePrice: 4500 },
      { name: "Papaya (ಪಪ್ಪಾಯಿ)", basePrice: 2000 },
      { name: "Grapes (ದ್ರಾಕ್ಷಿ)", basePrice: 5500 }
    ];

    const karnatakaAPMCs = [
      "Bangalore APMC", "Mysore APMC", "Hubli-Dharwad APMC",
      "Davangere APMC", "Shimoga APMC", "Mandya APMC",
      "Tumkur APMC", "Belgaum APMC", "Hassan APMC"
    ];
    
    const qualities = ["FAQ", "Grade A", "Premium", "Super Fine"];
    const demands = ["Very High", "High", "Medium", "Low"];

    // Generate ALL crops for ALL markets
    return karnatakaCrops.flatMap(crop => {
      return karnatakaAPMCs.map(market => {
        const variation = (Math.random() - 0.5) * 0.18;
        const currentPrice = Math.round(crop.basePrice * (1 + variation));
        const previousPrice = Math.round(currentPrice * (0.90 + Math.random() * 0.18));
        const change = ((currentPrice - previousPrice) / previousPrice * 100);
        
        return {
          crop: crop.name,
          currentPrice,
          previousPrice,
          market,
          unit: 'per quintal',
          trend: change > 1.5 ? 'up' : change < -1.5 ? 'down' : 'stable',
          change: Math.round(change * 100) / 100,
          demand: demands[Math.floor(Math.random() * demands.length)],
          quality: qualities[Math.floor(Math.random() * qualities.length)]
        };
      });
    });
  };

  const fetchWatchlist = async () => {
    // Mock watchlist - use localStorage
    const stored = localStorage.getItem('market_watchlist');
    if (stored) {
      setWatchlist(JSON.parse(stored));
    } else {
      setWatchlist([]);
    }
  };

  const addToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        crop_name: alertForm.crop_name,
        target_price: parseFloat(alertForm.target_price),
        market_location: alertForm.market_location,
        alert_enabled: true,
        created_at: new Date().toISOString()
      };

      const current = JSON.parse(localStorage.getItem('market_watchlist') || '[]');
      current.push(newItem);
      localStorage.setItem('market_watchlist', JSON.stringify(current));
      
      toast({ title: "Success", description: "Added to watchlist successfully" });
      setAlertForm({ crop_name: '', target_price: '', market_location: '' });
      setAddAlertOpen(false);
      fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive"
      });
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const current = JSON.parse(localStorage.getItem('market_watchlist') || '[]');
      const filtered = current.filter((item: WatchlistItem) => item.id !== id);
      localStorage.setItem('market_watchlist', JSON.stringify(filtered));
      toast({ title: "Success", description: "Removed from watchlist" });
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  // Extract unique markets and crops from marketData
  const uniqueMarkets = Array.from(new Set(marketData.map(item => item.market))).sort();
  const uniqueCrops = Array.from(new Set(marketData.map(item => item.crop))).sort();

  const filteredData = marketData.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = selectedMarket === 'all' || item.market === selectedMarket;
    const matchesCrop = selectedCrop === 'all' || item.crop === selectedCrop;
    
    return matchesSearch && matchesMarket && matchesCrop;
  });

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Farmer Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User className="text-primary" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {profile?.name}
              </h1>
              <p className="text-muted-foreground">
                Track market prices for your crops • Location: {profile?.location || 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="text-blue-600" size={40} />
            <h2 className="text-2xl font-bold text-gray-900">{t('marketPrices.header')}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with real-time market prices, trends, and demand analysis across Karnataka's major agricultural markets.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="outline" onClick={fetchMarketPrices} disabled={loading}>
              {loading ? (
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-2" />
              )}
              {loading ? t('marketPrices.loading') : t('marketPrices.refresh')}
            </Button>
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()} ({dataSource})
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Summary */}
        {watchlist.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Watchlist ({watchlist.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {watchlist.slice(0, 5).map((item) => (
                  <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
                    {item.crop_name} 
                    <span className="text-xs">₹{item.target_price}</span>
                  </Badge>
                ))}
                {watchlist.length > 5 && (
                  <Badge variant="outline">+{watchlist.length - 5} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder={t('marketPrices.searchPlaceholder')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Refresh Button */}
          <Button 
            onClick={fetchMarketPrices} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </Button>
          
          <Dialog open={addAlertOpen} onOpenChange={setAddAlertOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                {t('marketPrices.addAlert')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('marketPrices.addAlertTitle')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={addToWatchlist} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('marketPrices.alert.cropName')}</label>
                  <Input
                    value={alertForm.crop_name}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, crop_name: e.target.value }))}
                    placeholder="e.g., Rice, Wheat"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('marketPrices.alert.targetPrice')}</label>
                  <Input
                    type="number"
                    value={alertForm.target_price}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, target_price: e.target.value }))}
                    placeholder="Enter target price"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('marketPrices.alert.marketLocation')}</label>
                  <Input
                    value={alertForm.market_location}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, market_location: e.target.value }))}
                    placeholder="e.g., Bengaluru APMC"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">{t('marketPrices.addAlertButton')}</Button>
                  <Button type="button" variant="outline" onClick={() => setAddAlertOpen(false)}>{t('marketPrices.cancel')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={watchlistOpen} onOpenChange={setWatchlistOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Watchlist ({watchlist.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your Price Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {watchlist.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items in watchlist</p>
                ) : (
                  watchlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.crop_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Target: ₹{item.target_price} • {item.market_location}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWatchlist(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {uniqueMarkets.map(market => (
                <SelectItem key={market} value={market}>{market}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {uniqueCrops.map(crop => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Market Price Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Fetching live market prices...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredData.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">{item.crop}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {item.market}
                    </CardDescription>
                  </div>
                  <Badge className={getDemandColor(item.demand)} variant="secondary">
                    {item.demand} demand
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold text-primary">₹{item.currentPrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{item.unit}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                      <span className="font-medium">{Math.abs(item.change)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Previous Price</p>
                      <p className="font-medium">₹{item.previousPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quality</p>
                      <p className="font-medium">{item.quality}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setAlertForm(prev => ({ 
                          ...prev, 
                          crop_name: item.crop,
                          market_location: item.market 
                        }));
                        setAddAlertOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No market data found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}

        {/* Market Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Market Insights for {profile?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-green-600">Rising Prices</h3>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.trend === 'up').length}</p>
                <p className="text-sm text-muted-foreground">Crops trending up</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-red-600">Falling Prices</h3>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.trend === 'down').length}</p>
                <p className="text-sm text-muted-foreground">Crops trending down</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-blue-600">High Demand</h3>
                <p className="text-2xl font-bold">{filteredData.filter(item => item.demand === 'high').length}</p>
                <p className="text-sm text-muted-foreground">Crops in high demand</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketPrices;