import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sprout, MapPin, Droplets, Target, Calendar, TrendingUp, User, Edit, Trash2, Plus, Brain, RefreshCcw, AlertTriangle } from 'lucide-react';

interface CropPlan {
  id: string;
  crop_type: string;
  soil_type: string | null;
  location: string | null;
  area: number | null;
  expected_yield: number | null;
  planting_date: string | null;
  harvest_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const CropPlanning = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CropPlan | null>(null);
  const [aiLoadingPlanId, setAiLoadingPlanId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, any>>({});
  const [recommendationErrors, setRecommendationErrors] = useState<Record<string, string>>({});

  const generateFallbackRecommendation = (plan: CropPlan) => {
    const cropType = plan.crop_type?.toLowerCase() || '';
    const soilType = plan.soil_type?.toLowerCase() || '';
    const location = plan.location?.toLowerCase() || '';
    const area = plan.area || 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = currentMonth >= 3 && currentMonth <= 6 ? 'summer' : 
                         currentMonth >= 7 && currentMonth <= 10 ? 'monsoon' : 'winter';

    // Comprehensive crop-specific recommendations
    const cropRecommendations = {
      rice: {
        varieties: ['Basmati 370', 'IR-64', 'Pusa Basmati 1121', 'Swarna'],
        soilRequirements: 'Clay loam or silty clay soil with pH 5.5-7.0',
        waterRequirements: '1200-1500mm annually, flooded conditions preferred',
        fertilizers: {
          basal: '120kg N, 60kg P2O5, 40kg K2O per hectare',
          top_dressing: 'Split nitrogen application at tillering and panicle initiation'
        },
        pestManagement: 'IPM for stem borer, leaf folder, brown planthopper',
        harvestTime: '110-140 days after transplanting',
        expectedYield: area > 0 ? `${(area * 4.5).toFixed(1)} tonnes` : '4.5 tonnes/hectare',
        marketPrice: '₹2,200-2,800 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 4.5 * 2500) - (area * 45000)).toLocaleString()}` : 'Profit margin: 25-30%'
      },
      wheat: {
        varieties: ['HD-2967', 'PBW-343', 'WH-147', 'DBW-17'],
        soilRequirements: 'Well-drained loamy soil with pH 6.0-7.5',
        waterRequirements: '450-650mm, 5-6 irrigations needed',
        fertilizers: {
          basal: '120kg N, 60kg P2O5, 40kg K2O per hectare',
          top_dressing: 'Nitrogen split at crown root initiation and tillering'
        },
        pestManagement: 'Control for aphids, termites, and rust diseases',
        harvestTime: '110-130 days after sowing',
        expectedYield: area > 0 ? `${(area * 4.2).toFixed(1)} tonnes` : '4.2 tonnes/hectare',
        marketPrice: '₹2,100-2,500 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 4.2 * 2300) - (area * 42000)).toLocaleString()}` : 'Profit margin: 20-25%'
      },
      maize: {
        varieties: ['NK-6240', 'DKC-9108', 'Pioneer-3396', 'Shaktiman-1'],
        soilRequirements: 'Well-drained fertile soil with pH 5.8-7.8',
        waterRequirements: '500-800mm, critical at tasseling and grain filling',
        fertilizers: {
          basal: '150kg N, 75kg P2O5, 50kg K2O per hectare',
          top_dressing: 'Side dress nitrogen at knee-high stage'
        },
        pestManagement: 'Fall armyworm, stem borer, and cutworm control',
        harvestTime: '90-110 days for grain, 65-80 days for fodder',
        expectedYield: area > 0 ? `${(area * 5.5).toFixed(1)} tonnes` : '5.5 tonnes/hectare',
        marketPrice: '₹1,800-2,200 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 5.5 * 2000) - (area * 38000)).toLocaleString()}` : 'Profit margin: 30-35%'
      },
      sugarcane: {
        varieties: ['Co-238', 'Co-0238', 'CoM-0265', 'Co-86032'],
        soilRequirements: 'Deep, well-drained fertile soil with pH 6.5-7.5',
        waterRequirements: '1500-2500mm, frequent irrigation needed',
        fertilizers: {
          basal: '280kg N, 90kg P2O5, 90kg K2O per hectare',
          top_dressing: 'Multiple nitrogen applications throughout growing period'
        },
        pestManagement: 'Shoot borer, top borer, and red rot disease control',
        harvestTime: '10-12 months after planting',
        expectedYield: area > 0 ? `${(area * 75).toFixed(1)} tonnes` : '75 tonnes/hectare',
        marketPrice: '₹350-400 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 75 * 375) - (area * 85000)).toLocaleString()}` : 'Profit margin: 40-50%'
      },
      cotton: {
        varieties: ['Bt-Cotton RCH-134', 'MRC-7031', 'Ankur-651', 'RCH-317'],
        soilRequirements: 'Black cotton soil or well-drained loamy soil, pH 5.8-8.0',
        waterRequirements: '700-1000mm, drip irrigation recommended',
        fertilizers: {
          basal: '100kg N, 50kg P2O5, 50kg K2O per hectare',
          top_dressing: 'Foliar application of micronutrients during flowering'
        },
        pestManagement: 'Bollworm, whitefly, and thrips control with IPM',
        harvestTime: '160-180 days, multiple pickings',
        expectedYield: area > 0 ? `${(area * 15).toFixed(1)} quintals` : '15 quintals/hectare',
        marketPrice: '₹5,500-6,500 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 15 * 6000) - (area * 55000)).toLocaleString()}` : 'Profit margin: 35-45%'
      },
      tomato: {
        varieties: ['Arka Rakshak', 'Pusa Ruby', 'Himsona', 'Naveen-2000+'],
        soilRequirements: 'Well-drained loamy soil with pH 6.0-7.0',
        waterRequirements: '600-800mm, drip irrigation preferred',
        fertilizers: {
          basal: '150kg N, 100kg P2O5, 75kg K2O per hectare',
          top_dressing: 'Weekly fertigation for hybrid varieties'
        },
        pestManagement: 'Late blight, early blight, fruit borer, and whitefly control',
        harvestTime: '75-90 days after transplanting, continuous harvesting',
        expectedYield: area > 0 ? `${(area * 25).toFixed(1)} tonnes` : '25 tonnes/hectare',
        marketPrice: '₹800-1,500 per quintal (seasonal variation)',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 25 * 1200) - (area * 75000)).toLocaleString()}` : 'Profit margin: 40-60%'
      },
      onion: {
        varieties: ['Nasik Red', 'Pusa Ratnar', 'Agrifound Dark Red', 'Super Star'],
        soilRequirements: 'Well-drained sandy loam soil with pH 6.0-7.5',
        waterRequirements: '350-550mm, avoid waterlogging',
        fertilizers: {
          basal: '100kg N, 75kg P2O5, 50kg K2O per hectare',
          top_dressing: 'Sulfur application important for bulb development'
        },
        pestManagement: 'Thrips, onion fly, and purple blotch disease control',
        harvestTime: '120-150 days after transplanting',
        expectedYield: area > 0 ? `${(area * 20).toFixed(1)} tonnes` : '20 tonnes/hectare',
        marketPrice: '₹500-2,000 per quintal (highly variable)',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 20 * 1200) - (area * 45000)).toLocaleString()}` : 'Profit margin: 30-50%'
      },
      potato: {
        varieties: ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Pukhraj', 'Atlantic'],
        soilRequirements: 'Well-drained sandy loam soil with pH 5.0-6.5',
        waterRequirements: '500-700mm, critical during tuber formation',
        fertilizers: {
          basal: '120kg N, 80kg P2O5, 100kg K2O per hectare',
          top_dressing: 'Earthing up with fertilizer application'
        },
        pestManagement: 'Late blight, cutworm, and potato tuber moth control',
        harvestTime: '90-120 days after planting',
        expectedYield: area > 0 ? `${(area * 22).toFixed(1)} tonnes` : '22 tonnes/hectare',
        marketPrice: '₹600-1,200 per quintal',
        profitAnalysis: area > 0 ? `Expected profit: ₹${((area * 22 * 900) - (area * 65000)).toLocaleString()}` : 'Profit margin: 25-35%'
      }
    };

    // Soil-specific modifications
    const soilModifications = {
      clay: {
        drainage: 'Install drainage systems, create raised beds',
        amendments: 'Add organic matter and sand to improve structure',
        irrigation: 'Reduce irrigation frequency, increase quantity per application'
      },
      sandy: {
        retention: 'Add compost and organic matter for water retention',
        nutrients: 'Increase fertilizer frequency due to leaching',
        irrigation: 'Frequent light irrigations, mulching recommended'
      },
      loam: {
        optimal: 'Ideal soil condition, follow standard practices',
        maintenance: 'Regular organic matter addition',
        irrigation: 'Standard irrigation schedule'
      },
      black: {
        cotton: 'Excellent for cotton and sugarcane',
        drainage: 'Ensure proper drainage during monsoon',
        nutrients: 'Rich in nutrients, reduce nitrogen application'
      }
    };

    // Seasonal recommendations
    const seasonalAdvice = {
      summer: {
        crops: 'Focus on heat-tolerant varieties and drought-resistant crops',
        irrigation: 'Early morning irrigation, mulching essential',
        protection: 'Shade nets for vegetables, heat stress management',
        disease: 'Monitor for heat stress',
        harvesting: 'Harvest early morning'
      },
      monsoon: {
        crops: 'Kharif crops, ensure good drainage',
        disease: 'Enhanced disease management due to humidity',
        harvesting: 'Plan for proper drying and storage',
        irrigation: 'Reduce irrigation, monitor rainfall',
        protection: 'Disease protection priority'
      },
      winter: {
        crops: 'Rabi crops, cold protection may be needed',
        irrigation: 'Reduced water requirements',
        growth: 'Slower growth, adjust fertilizer schedule',
        disease: 'Lower disease pressure',
        protection: 'Cold protection for sensitive crops'
      }
    };

    // Select appropriate crop data
    const selectedCrop = cropRecommendations[cropType] || cropRecommendations.rice;
    const soilAdvice = soilModifications[soilType] || soilModifications.loam;
    const seasonal = seasonalAdvice[currentSeason];

    return {
      cropVarieties: selectedCrop.varieties,
      soilManagement: {
        requirements: selectedCrop.soilRequirements,
        specificAdvice: soilAdvice
      },
      irrigationPlan: {
        waterRequirement: selectedCrop.waterRequirements,
        seasonalAdjustment: seasonal.irrigation
      },
      fertilizationSchedule: selectedCrop.fertilizers,
      pestDiseaseManagement: selectedCrop.pestManagement,
      harvestingGuidelines: selectedCrop.harvestTime,
      yieldProjection: selectedCrop.expectedYield,
      marketAnalysis: {
        currentPrice: selectedCrop.marketPrice,
        profitability: selectedCrop.profitAnalysis
      },
      seasonalConsiderations: {
        currentSeason: currentSeason,
        advice: seasonal.crops,
        additionalCare: seasonal.disease || seasonal.protection
      },
      recommendations: [
        `Recommended varieties for ${plan.crop_type}: ${selectedCrop.varieties.slice(0, 2).join(', ')}`,
        `Soil preparation: ${selectedCrop.soilRequirements}`,
        `Water management: ${selectedCrop.waterRequirements}`,
        `Expected yield: ${selectedCrop.expectedYield}`,
        `Market price range: ${selectedCrop.marketPrice}`,
        area > 0 ? `For your ${area} hectare area: ${selectedCrop.profitAnalysis}` : selectedCrop.profitAnalysis
      ],
      technicalDetails: {
        seedRate: cropType === 'rice' ? '25-30 kg/ha for transplanting' :
                 cropType === 'wheat' ? '100-125 kg/ha' :
                 cropType === 'maize' ? '20-25 kg/ha' :
                 cropType === 'cotton' ? '1.5-2.0 kg/ha for Bt varieties' :
                 '2-3 kg/ha for vegetables',
        spacing: cropType === 'rice' ? '20x15 cm for transplanting' :
                cropType === 'wheat' ? 'Line sowing at 20-22.5 cm' :
                cropType === 'maize' ? '60x20 cm or 75x20 cm' :
                cropType === 'cotton' ? '90x45 cm or 120x30 cm' :
                'Varies by vegetable type',
        duration: selectedCrop.harvestTime
      },
      riskFactors: [
        'Weather dependency - monitor weather forecasts',
        'Market price fluctuations - plan for storage if needed',
        'Pest and disease outbreaks - implement IPM practices',
        'Water availability - ensure reliable irrigation source'
      ],
      sustainabilityTips: [
        'Implement crop rotation to maintain soil health',
        'Use organic amendments to improve soil structure',
        'Practice integrated pest management (IPM)',
        'Consider drip irrigation for water conservation',
        'Maintain farm records for better planning'
      ]
    };
  };

  const fetchRecommendation = async (plan: CropPlan) => {
    try {
      setAiLoadingPlanId(plan.id);
      const payload = {
        crop_type: plan.crop_type,
        soil_type: plan.soil_type,
        location: plan.location,
        area: plan.area,
        planting_date: plan.planting_date,
        harvest_date: plan.harvest_date,
        notes: plan.notes,
        language: language || 'en' // Pass current language
      };
      const { data, error } = await supabase.functions.invoke('crop-recommendations', { body: JSON.stringify(payload) });
      if (error) {
        console.error('Edge function error object:', error);
        throw error;
      }
      if (data?.success === false) {
        const details = data.error_details || data.details || 'Unknown error';
        throw new Error(details);
      }
      
      if (data?.recommendation) {
        const recData = {
          ...data.recommendation,
          source: data.source || (data.fallback ? 'fallback' : 'ai'),
          model: data.model || 'unknown'
        };
        setRecommendations(prev => ({ ...prev, [plan.id]: recData }));
        setRecommendationErrors(prev => { const clone = { ...prev }; delete clone[plan.id]; return clone; });
        
        const title = data.fallback 
          ? '📋 Rule-Based Recommendation' 
          : data.source === 'openai' 
            ? '🤖 AI Recommendation (GPT-4)' 
            : data.source === 'gemini'
              ? '🤖 AI Recommendation (Gemini 2.5 Flash)'
              : '✅ Recommendation Ready';
        
        toast({ 
          title, 
          description: data.fallback 
            ? `Comprehensive agronomy guidance for ${plan.crop_type} based on agricultural best practices`
            : data.source === 'openai'
              ? `GPT-4 powered crop planning for ${plan.crop_type} generated successfully`
              : data.source === 'gemini'
                ? `Gemini AI powered crop planning for ${plan.crop_type} generated successfully`
                : `AI-powered crop planning for ${plan.crop_type} generated successfully`
        });
      } else {
        throw new Error('No recommendation data returned from server');
      }
    } catch (e: any) {
      console.error('AI recommendation error:', e);
      const errorMessage = e?.message || String(e);
      setRecommendationErrors(prev => ({ ...prev, [plan.id]: errorMessage }));
      
      toast({ 
        title: '❌ Recommendation Failed', 
        description: `Failed to generate recommendation: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setAiLoadingPlanId(null);
    }
  };

  const [formData, setFormData] = useState({
    cropType: '',
    soilType: '',
    location: '',
    area: '',
    expectedYield: '',
    plantingDate: '',
    harvestDate: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchCropPlans();
    }
  }, [user]);

  const fetchCropPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCropPlans(data || []);
    } catch (error) {
      console.error('Error fetching crop plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crop plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const planData = {
        user_id: user.id,
        crop_type: formData.cropType,
        soil_type: formData.soilType,
        location: formData.location || profile?.location || '',
        area: parseFloat(formData.area) || 0,
        expected_yield: parseFloat(formData.expectedYield) || 0,
        planting_date: formData.plantingDate,
        harvest_date: formData.harvestDate,
        notes: formData.notes
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('crop_plans')
          .update(planData)
          .eq('id', editingPlan.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Crop plan updated successfully" });
      } else {
        const { error } = await supabase
          .from('crop_plans')
          .insert([planData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Crop plan created successfully" });
      }

      setFormData({
        cropType: '', soilType: '', location: '', area: '', 
        expectedYield: '', plantingDate: '', harvestDate: '', notes: ''
      });
      setFormOpen(false);
      setEditingPlan(null);
      fetchCropPlans();
    } catch (error) {
      console.error('Error saving crop plan:', error);
      toast({
        title: "Error",
        description: "Failed to save crop plan",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plan: CropPlan) => {
    setEditingPlan(plan);
    setFormData({
      cropType: plan.crop_type,
      soilType: plan.soil_type || '',
      location: plan.location || '',
      area: plan.area?.toString() || '',
      expectedYield: plan.expected_yield?.toString() || '',
      plantingDate: plan.planting_date || '',
      harvestDate: plan.harvest_date || '',
      notes: plan.notes || ''
    });
    setFormOpen(true);
  };

  const handleDelete = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('crop_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      toast({ title: "Success", description: "Crop plan deleted successfully" });
      fetchCropPlans();
    } catch (error) {
      console.error('Error deleting crop plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete crop plan",
        variant: "destructive"
      });
    }
  };

  const updatePlanStatus = async (planId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('crop_plans')
        .update({ status })
        .eq('id', planId);
      
      if (error) throw error;
      toast({ title: "Success", description: "Plan status updated" });
      fetchCropPlans();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const cropTypes = [
    'Rice (ಅಕ್ಕಿ)', 'Wheat (ಗೋಧಿ)', 'Sugarcane (ಕಬ್ಬು)', 'Cotton (ಹತ್ತಿ)',
    'Maize (ಜೋಳ)', 'Groundnut (ಕಡಲೆಕಾಯಿ)', 'Sunflower (ಸೂರ್ಯಕಾಂತಿ)',
    'Tomato (ಟೊಮೇಟೊ)', 'Onion (ಈರುಳ್ಳಿ)', 'Potato (ಆಲೂಗಡ್ಡೆ)'
  ];

  const soilTypes = [
    'Red Soil (ಕೆಂಪು ಮಣ್ಣು)', 'Black Soil (ಕಪ್ಪು ಮಣ್ಣು)', 'Alluvial Soil (ಮೆಕ್ಕಲು ಮಣ್ಣು)',
    'Laterite Soil (ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು)', 'Sandy Soil (ಮರಳು ಮಣ್ಣು)', 'Clay Soil (ಜೇಡಿಮಣ್ಣು)'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-orange-100 text-orange-800';
      case 'planted': return 'bg-blue-100 text-blue-800';
      case 'growing': return 'bg-green-100 text-green-800';
      case 'harvested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Farmer Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User className="text-primary" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('cropPlanning.welcome')}, {profile?.name}
              </h1>
              <p className="text-muted-foreground">
                {t('common.role')}: {profile?.role} | {t('cropPlanning.location')}: {profile?.location || t('common.notSet')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="text-green-600" size={40} />
            <h2 className="text-2xl font-bold text-gray-900">{t('cropPlanning.title')}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('cropPlanning.description')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{cropPlans.length}</p>
                <p className="text-sm text-muted-foreground">{t('cropPlanning.totalPlans')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {cropPlans.filter(p => p.status === 'growing').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('cropPlanning.currentlyGrowing')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {cropPlans.filter(p => p.status === 'planned').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('cropPlanning.planned')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {cropPlans.filter(p => p.status === 'harvested').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('cropPlanning.harvested')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Plan Button */}
        <div className="mb-6">
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
                <Button className="mb-4" onClick={() => {
                  setEditingPlan(null);
                  setFormData({
                    cropType: '', soilType: '', location: '', area: '', 
                    expectedYield: '', plantingDate: '', harvestDate: '', notes: ''
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('cropPlanning.addNew')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? t('cropPlanning.edit') : t('cropPlanning.createNew')}
                  </DialogTitle>
                  <DialogDescription>
                    {t('cropPlanning.description')}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropType">{t('cropPlanning.cropType')}</Label>
                    <Select value={formData.cropType} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, cropType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropTypes.map(crop => (
                          <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                    <div>
                      <Label htmlFor="soilType">{t('cropPlanning.soilType')}</Label>
                      <Select value={formData.soilType} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, soilType: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          {soilTypes.map(soil => (
                            <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">{t('cropPlanning.location')}</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder={profile?.location || "Enter location"}
                      />
                    </div>

                    <div>
                      <Label htmlFor="area">{t('cropPlanning.area')}</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.1"
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="Enter area in acres"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expectedYield">{t('cropPlanning.expectedYield')}</Label>
                      <Input
                        id="expectedYield"
                        type="number"
                        step="0.1"
                        value={formData.expectedYield}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectedYield: e.target.value }))}
                        placeholder="Enter expected yield"
                      />
                    </div>

                    <div>
                      <Label htmlFor="plantingDate">{t('cropPlanning.plantingDate')}</Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={formData.plantingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="harvestDate">{t('cropPlanning.harvestDate')}</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('cropPlanning.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional notes or observations..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingPlan ? t('cropPlanning.update') : t('cropPlanning.create')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                      {t('cropPlanning.cancel')}
                    </Button>
                  </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Crop Plans List */}
        <div className="space-y-4">
          {cropPlans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Sprout className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('cropPlanning.noPlans')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('cropPlanning.createFirst')}
                </p>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('cropPlanning.createFirstButton')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            cropPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-600" />
                        {plan.crop_type}
                      </CardTitle>
                      <CardDescription>
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {plan.location} • {plan.area} acres
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                      <Select 
                        value={plan.status} 
                        onValueChange={(value) => updatePlanStatus(plan.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="planted">Planted</SelectItem>
                          <SelectItem value="growing">Growing</SelectItem>
                          <SelectItem value="harvested">Harvested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('cropPlanning.soilType')}</p>
                      <p className="font-medium">{plan.soil_type || t('common.notSpecified')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('cropPlanning.expectedYield')}</p>
                      <p className="font-medium">{plan.expected_yield} tons</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('cropPlanning.plantingDate')}</p>
                      <p className="font-medium">
                        {plan.planting_date ? new Date(plan.planting_date).toLocaleDateString() : t('common.notSet')}
                      </p>
                    </div>
                  </div>
                  
                  {plan.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">{t('cropPlanning.notes')}</p>
                      <p className="text-sm bg-muted p-2 rounded">{plan.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('cropPlanning.edit.button')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('cropPlanning.delete')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={aiLoadingPlanId === plan.id}
                      onClick={() => fetchRecommendation(plan)}
                    >
                      {aiLoadingPlanId === plan.id ? (
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2 text-purple-600" />
                      )}
                      {aiLoadingPlanId === plan.id ? 'Generating...' : 'AI Advice'}
                    </Button>
                  </div>
                  {/* AI Recommendation Display */}
                  {recommendations[plan.id] && (
                    <div className="mt-6 border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold">Agronomy Recommendation</h4>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {recommendations[plan.id].source === 'openai' && <span className="text-green-600">●</span>}
                          {recommendations[plan.id].source === 'gemini' && <span className="text-purple-600">●</span>}
                          {recommendations[plan.id].source === 'fallback' && <span className="text-blue-600">●</span>}
                          {!recommendations[plan.id].source && <span className="text-orange-600">●</span>}
                          {recommendations[plan.id].source === 'openai' ? `AI Generated (${recommendations[plan.id].model || 'GPT-4'})` : 
                           recommendations[plan.id].source === 'gemini' ? `AI Generated (${recommendations[plan.id].model || 'gemini-2.5-flash'})` :
                           recommendations[plan.id].source === 'fallback' ? 'Rule-Based Database' : 
                           recommendations[plan.id].source === 'expert_database' ? 'Expert Database' : 'Demo Mode'}
                        </div>
                      </div>

                      {/* Simplified Display */}
                      <div className="space-y-4">
                        {/* Summary Section */}
                        {recommendations[plan.id].summary && (
                          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                            <p className="text-sm leading-relaxed">{recommendations[plan.id].summary}</p>
                          </div>
                        )}

                        {/* Key Information Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Planting Window */}
                          {recommendations[plan.id].ideal_planting_window && (
                            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <p className="font-semibold text-purple-800">Best Planting Time</p>
                              </div>
                              <p className="text-sm">{recommendations[plan.id].ideal_planting_window}</p>
                            </div>
                          )}

                          {/* Expected Yield */}
                          {recommendations[plan.id].expected_yield_adjusted && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <p className="font-semibold text-green-800">Expected Yield</p>
                              </div>
                              <p className="text-sm">{recommendations[plan.id].expected_yield_adjusted} tons/acre</p>
                            </div>
                          )}

                          {/* Fertilizer Plan */}
                          {recommendations[plan.id].fertilizer_plan && (
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Sprout className="w-4 h-4 text-amber-600" />
                                <p className="font-semibold text-amber-800">Fertilizer Plan</p>
                              </div>
                              <p className="text-sm">{recommendations[plan.id].fertilizer_plan}</p>
                            </div>
                          )}

                          {/* Watering Advice */}
                          {recommendations[plan.id].watering_advice && (
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-4 h-4 text-blue-600" />
                                <p className="font-semibold text-blue-800">Watering Guide</p>
                              </div>
                              <p className="text-sm">{recommendations[plan.id].watering_advice}</p>
                            </div>
                          )}
                        </div>

                        {/* Key Risks */}
                        {recommendations[plan.id].key_risks && recommendations[plan.id].key_risks.length > 0 && (
                          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <p className="font-semibold text-red-800">Key Risks to Watch</p>
                            </div>
                            <ul className="space-y-2">
                              {recommendations[plan.id].key_risks.map((risk: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-red-500 mt-1">●</span>
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Top 3 Tips */}
                        {recommendations[plan.id].top_3_tips && recommendations[plan.id].top_3_tips.length > 0 && (
                          <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="w-4 h-4 text-emerald-600" />
                              <p className="font-semibold text-emerald-800">Top Farming Tips</p>
                            </div>
                            <ul className="space-y-2">
                              {recommendations[plan.id].top_3_tips.map((tip: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-emerald-500 mt-1">✓</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Confidence Score */}
                        {recommendations[plan.id].confidence_score && (
                          <div className="text-xs text-muted-foreground text-center">
                            Confidence: {Math.round(recommendations[plan.id].confidence_score * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {recommendationErrors[plan.id] && !recommendations[plan.id] && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {recommendationErrors[plan.id]}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CropPlanning;