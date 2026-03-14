import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Camera, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Share2, 
  Brain,
  Microscope,
  Leaf,
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  BookOpen,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EnhancedDetection {
  id: string;
  image_url: string;
  crop_type: string;
  disease_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  affected_area_percentage: number;
  primary_symptoms: string[];
  treatment_recommendations: {
    immediate_action: string;
    systemic_treatment: string;
    cultural_practices: string;
    organic_alternatives: string;
    prevention: string;
  };
  additional_notes: string;
  detection_date: string;
  location?: string;
  analysis_method: 'ai_powered' | 'intelligent_demo';
}

interface AnalysisResult {
  disease_name: string;
  crop_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  affected_area_percentage: number;
  primary_symptoms: string[];
  treatment_recommendations: {
    immediate_action: string;
    systemic_treatment: string;
    cultural_practices: string;
    organic_alternatives: string;
    prevention: string;
  };
  additional_notes: string;
  enhanced_treatment?: any;
  severity_explanation?: string;
  disease_info?: {
    scientific_name: string;
    common_symptoms: string[];
    affected_crops: string[];
  };
}

const DiseaseDetection = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  // Fallback translation function
  const getText = (key: string, fallback: string) => {
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [detections, setDetections] = useState<EnhancedDetection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [cropType, setCropType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<'enhanced' | 'standard'>('enhanced');
  // Analysis runs via backend Supabase Edge Function using GEMINI_API_KEY; no local server required

  useEffect(() => {
    if (user) {
      fetchDetectionHistory();
    }
  }, [user]);

  const fetchDetectionHistory = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching detection history');
      setLoadingHistory(false);
      return;
    }
    
    try {
      console.log('Fetching detection history for user:', user.id);
      
      const { data, error } = await supabase
        .from('crop_disease_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('detection_date', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching detection history:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Detection history fetched:', data?.length || 0, 'records');
      
      // Map the data to match EnhancedDetection interface
      const mappedData: EnhancedDetection[] = (data || []).map(item => ({
        id: item.id,
        image_url: item.image_url,
        crop_type: item.crop_type,
        disease_name: item.disease_name,
        severity: item.severity as 'low' | 'medium' | 'high' | 'critical',
        confidence_score: item.confidence_score,
        affected_area_percentage: 0,
        primary_symptoms: [],
        treatment_recommendations: {
          immediate_action: item.treatment_recommendations || '',
          systemic_treatment: '',
          cultural_practices: '',
          organic_alternatives: '',
          prevention: ''
        },
        additional_notes: item.expert_notes || '',
        detection_date: item.detection_date,
        location: '',
        analysis_method: 'ai_powered' as const
      }));
      
      setDetections(mappedData);
      console.log('Detection history state updated with', mappedData.length, 'items');
    } catch (error: any) {
      console.error('Error in fetchDetectionHistory:', error);
      toast({
        title: 'Error loading history',
        description: error.message || 'Could not load detection history',
        variant: 'destructive'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreview(URL.createObjectURL(blob));
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Starting image upload for user:', user?.id);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      console.log('Upload successful, getting public URL');
      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  // Fallback demo analysis function
  const getDemoAnalysis = (): any => {
    const demoAnalyses = [
      {
        crop_type: "Tomato",
        disease_name: "Late Blight",
        severity: "high",
        confidence_score: 0.87,
        treatment_recommendations: "Apply copper-based fungicide immediately. Remove affected leaves and improve air circulation. Avoid overhead watering and ensure proper plant spacing."
      },
      {
        crop_type: "Rice",
        disease_name: "Bacterial Leaf Blight",
        severity: "medium",
        confidence_score: 0.79,
        treatment_recommendations: "Use resistant varieties if replanting. Apply copper-based bactericide during early stages. Ensure proper field drainage and avoid excessive nitrogen fertilization."
      },
      {
        crop_type: "Wheat",
        disease_name: "Powdery Mildew",
        severity: "low",
        confidence_score: 0.72,
        treatment_recommendations: "Apply sulfur-based fungicide. Improve air circulation between plants. Remove infected plant parts and maintain proper plant spacing."
      },
      {
        crop_type: "Cotton",
        disease_name: "Healthy",
        severity: "low",
        confidence_score: 0.92,
        treatment_recommendations: "Your crop appears healthy! Continue with regular monitoring, maintain proper irrigation schedule, and apply preventive pest management practices."
      }
    ];
    
    return demoAnalyses[Math.floor(Math.random() * demoAnalyses.length)];
  };

  const analyzeImage = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Error",
        description: "Please select an image and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAnalysisProgress(0);
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const base64 = await fileToBase64(selectedFile);
      
      // Call backend Supabase Edge Function (detect-crop-disease) which uses GEMINI_API_KEY
      const { data: functionData, error: functionError } = await supabase.functions.invoke('detect-crop-disease', {
        body: JSON.stringify({
          image: base64,
          crop_type: cropType || 'unknown',
          location: location,
          user_id: user.id,
          enhanced_mode: analysisMethod === 'enhanced',
          language: language || 'en' // Pass current language
        })
      });

      setAnalysisProgress(100);

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(`Analysis service error: ${functionError.message || 'Unknown error'}`);
      }

      const data = functionData || {};

      if (data && (data.success || data.disease_name)) {
        const analysisResult = data.analysis || data;
        setAnalysis(analysisResult);
        
        // Debug: Log where the results are coming from
        console.log('Analysis result received:', {
          source: data.fallback ? 'Backend Demo' : 'Real AI Analysis',
          method: analysisResult.analysis_method || 'backend_ai',
          note: data.note,
          disease: analysisResult.disease_name,
          confidence: analysisResult.confidence_score
        });

        const confidencePercent = Math.round((analysisResult.confidence_score || 0.5) * 100);
        const sourceMessage = `${data.fallback ? 'Demo' : 'AI'} Analysis: ${analysisResult.disease_name} detected with ${confidencePercent}% confidence`;

        toast({
          title: data.fallback ? 'Demo Analysis' : 'AI Analysis Complete',
          description: sourceMessage,
          variant: 'default'
        });
        
        try {
          console.log('Starting to save detection to database...');
          
          // Upload image to storage
          console.log('Uploading image to storage...');
          const imageUrl = await uploadImage(selectedFile);
          console.log('Image uploaded successfully:', imageUrl);
          
          // Extract treatment recommendations
          const rec = analysisResult.treatment_recommendations || {};
          const isObjectRec = typeof rec === 'object' && !Array.isArray(rec);
          
          // Format treatment recommendations as text (for backward compatibility)
          let treatmentText = '';
          if (typeof rec === 'string') {
            treatmentText = rec;
          } else if (isObjectRec) {
            treatmentText = `Immediate Action: ${rec.immediate_action || 'N/A'}\n\nSystemic Treatment: ${rec.systemic_treatment || 'N/A'}\n\nCultural Practices: ${rec.cultural_practices || 'N/A'}\n\nOrganic Alternatives: ${rec.organic_alternatives || 'N/A'}\n\nPrevention: ${rec.prevention || 'N/A'}`;
          } else {
            treatmentText = 'No recommendations available';
          }
          
          // Save complete enhanced detection to database with all AI-generated fields
          const detectionData = {
            user_id: user.id,
            image_url: imageUrl,
            crop_type: analysisResult.crop_type || cropType || 'Unknown',
            disease_name: analysisResult.disease_name || 'Unknown',
            severity: analysisResult.severity || 'medium',
            confidence_score: analysisResult.confidence_score || 0.5,
            treatment_recommendations: treatmentText,
            // New enhanced fields
            affected_area_percentage: analysisResult.affected_area_percentage || 0,
            primary_symptoms: analysisResult.primary_symptoms || [],
            immediate_action: isObjectRec ? rec.immediate_action : null,
            systemic_treatment: isObjectRec ? rec.systemic_treatment : null,
            cultural_practices: isObjectRec ? rec.cultural_practices : null,
            organic_alternatives: isObjectRec ? rec.organic_alternatives : null,
            prevention_measures: isObjectRec ? rec.prevention : null,
            additional_notes: analysisResult.additional_notes || '',
            analysis_method: analysisResult.analysis_method || (data.fallback ? 'demo' : 'ai_powered'),
            location: location || null,
            disease_scientific_name: analysisResult.disease_info?.scientific_name || null,
            disease_common_symptoms: analysisResult.disease_info?.common_symptoms || [],
            affected_crops: analysisResult.disease_info?.affected_crops || [],
            severity_explanation: analysisResult.severity_explanation || null
          };

          console.log('Attempting to insert complete detection data:', detectionData);

          const { data: insertData, error: insertError } = await supabase
            .from('crop_disease_detections')
            .insert([detectionData])
            .select();

          if (insertError) {
            console.error('Database insert error:', insertError);
            console.error('Error details:', JSON.stringify(insertError, null, 2));
            toast({
              title: 'Warning',
              description: `Detection successful but could not save to history: ${insertError.message}`,
              variant: 'destructive'
            });
          } else {
            console.log('Detection saved successfully:', insertData);
            toast({
              title: 'Success',
              description: 'Detection saved to history',
              variant: 'default'
            });
            // Refresh detection history
            await fetchDetectionHistory();
          }
        } catch (storageError: any) {
          console.error('Storage/Database error:', storageError);
          console.error('Error details:', storageError.message || storageError);
          toast({
            title: 'Error',
            description: `Could not save detection: ${storageError.message || 'Unknown error'}`,
            variant: 'destructive'
          });
        }
      } else {
        throw new Error(data?.error || 'Analysis failed - no results returned');
      }
    } catch (error) {
      console.error('Error with local AI analysis:', error);
      
      // Check if it's a connection error to local server
      if (error.message.includes('fetch') || error.message.includes('connection') || error.message.includes('Failed to fetch')) {
        toast({
          title: "Analysis Service Unavailable",
          description: "Backend analysis is temporarily unavailable. Using demo analysis for now.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Error",
          description: `Analysis failed: ${error.message}. Using demo analysis.`,
          variant: "destructive"
        });
      }
      
      // Provide demo analysis as fallback
      const demoAnalysis = getDemoAnalysis();
      setAnalysis(demoAnalysis);
      
      // Try to save demo result to history
      try {
        console.log('Attempting to save demo result to history...');
        const imageUrl = await uploadImage(selectedFile);
        console.log('Demo image uploaded:', imageUrl);
        
        // Format demo treatment recommendations
        let demoTreatmentText = '';
        if (typeof demoAnalysis.treatment_recommendations === 'string') {
          demoTreatmentText = demoAnalysis.treatment_recommendations;
        } else if (demoAnalysis.treatment_recommendations) {
          const rec = demoAnalysis.treatment_recommendations;
          demoTreatmentText = `Immediate Action: ${rec.immediate_action || 'N/A'}\n\nSystemic Treatment: ${rec.systemic_treatment || 'N/A'}\n\nCultural Practices: ${rec.cultural_practices || 'N/A'}\n\nOrganic Alternatives: ${rec.organic_alternatives || 'N/A'}\n\nPrevention: ${rec.prevention || 'N/A'}`;
        }
        
        const rec = demoAnalysis.treatment_recommendations || {};
        const isObjectRec = typeof rec === 'object' && !Array.isArray(rec);
        
        const demoData = {
          user_id: user.id,
          image_url: imageUrl,
          crop_type: demoAnalysis.crop_type,
          disease_name: demoAnalysis.disease_name,
          severity: demoAnalysis.severity,
          confidence_score: demoAnalysis.confidence_score,
          treatment_recommendations: demoTreatmentText || demoAnalysis.treatment_recommendations,
          // Enhanced fields for demo
          affected_area_percentage: demoAnalysis.affected_area_percentage || 0,
          primary_symptoms: demoAnalysis.primary_symptoms || [],
          immediate_action: isObjectRec ? rec.immediate_action : null,
          systemic_treatment: isObjectRec ? rec.systemic_treatment : null,
          cultural_practices: isObjectRec ? rec.cultural_practices : null,
          organic_alternatives: isObjectRec ? rec.organic_alternatives : null,
          prevention_measures: isObjectRec ? rec.prevention : null,
          additional_notes: demoAnalysis.additional_notes || '',
          analysis_method: 'intelligent_demo',
          location: location || null,
          disease_scientific_name: demoAnalysis.disease_info?.scientific_name || null,
          disease_common_symptoms: demoAnalysis.disease_info?.common_symptoms || [],
          affected_crops: demoAnalysis.disease_info?.affected_crops || [],
          severity_explanation: demoAnalysis.severity_explanation || null
        };
        
        console.log('Inserting demo detection:', demoData);
        
        const { data: insertData, error: insertError } = await supabase
          .from('crop_disease_detections')
          .insert([demoData])
          .select();
          
        if (insertError) {
          console.error('Could not save demo result to history:', insertError);
          console.error('Insert error details:', JSON.stringify(insertError, null, 2));
          toast({
            title: 'Warning',
            description: `Demo detection could not be saved: ${insertError.message}`,
            variant: 'destructive'
          });
        } else {
          console.log('Demo result saved successfully:', insertData);
          await fetchDetectionHistory();
        }
      } catch (storageError: any) {
        console.error('Storage error while saving demo result:', storageError);
        console.error('Storage error details:', storageError.message || storageError);
        toast({
          title: 'Warning',
          description: `Could not save demo detection: ${storageError.message || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {getText('diseaseDetection.title', 'Crop Disease Detection')}
          </h1>
          <p className="text-muted-foreground">
            {getText('diseaseDetection.subtitle', 'Upload crop images to detect diseases and get treatment recommendations using AI-powered analysis')}
          </p>
          
        </div>

        <Tabs defaultValue="detection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {getText('diseaseDetection.uploadTitle', 'AI-Powered Disease Detection')}
                  </CardTitle>
                  <CardDescription>
                    {getText('diseaseDetection.uploadDescription', 'Advanced image analysis with comprehensive disease database')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-w-full h-48 object-contain mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview('');
                            setAnalysis(null);
                          }}
                          className="w-full"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload an image of your crop
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Analysis Progress */}
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-medium">Analyzing image...</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        {analysisProgress < 30 ? 'Processing image...' :
                         analysisProgress < 60 ? 'Analyzing patterns...' :
                         analysisProgress < 90 ? 'Identifying disease...' :
                         'Generating recommendations...'}
                      </p>
                    </div>
                  )}

                  {/* Analyze Button */}
                  {selectedFile && !loading && (
                    <Button
                      onClick={analyzeImage}
                      className="w-full"
                      size="lg"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {analysisMethod === 'enhanced' ? 'Enhanced Analysis' : 'Analyze Image'}
                    </Button>
                  )}

                  {/* Tips */}
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>📸 Photography Tips</AlertTitle>
                    <AlertDescription>
                      • Use natural lighting when possible<br/>
                      • Focus on affected plant areas<br/>
                      • Include healthy parts for comparison<br/>
                      • Take multiple angles if unclear<br/>
                      • Maximum file size: 5MB
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>{getText('diseaseDetection.analysisResults', 'Analysis Results')}</CardTitle>
              <CardDescription>
                {getText('diseaseDetection.aiPowered', 'AI-powered disease detection and treatment recommendations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{getText('diseaseDetection.cropType', 'Crop Type')}</Label>
                      <p className="text-lg font-semibold">{analysis.crop_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{getText('diseaseDetection.disease', 'Disease')}</Label>
                      <p className="text-lg font-semibold">{analysis.disease_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{getText('diseaseDetection.severity', 'Severity')}</Label>
                      <Badge className={`${getSeverityColor(analysis.severity)} mt-1`}>
                        {getSeverityIcon(analysis.severity)}
                        <span className="ml-1 capitalize">{analysis.severity}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{getText('diseaseDetection.confidence', 'Confidence')}</Label>
                      <p className="text-lg font-semibold">
                        {(analysis.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">{getText('diseaseDetection.treatment', 'Treatment Recommendations')}</Label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      {typeof analysis.treatment_recommendations === 'string' ? (
                        <p className="text-sm whitespace-pre-wrap">
                          {analysis.treatment_recommendations}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {analysis.treatment_recommendations.immediate_action && (
                            <div>
                              <h4 className="font-medium text-red-700 mb-1">🚨 Immediate Action</h4>
                              <p className="text-sm">{analysis.treatment_recommendations.immediate_action}</p>
                            </div>
                          )}
                          {analysis.treatment_recommendations.systemic_treatment && (
                            <div>
                              <h4 className="font-medium text-blue-700 mb-1">💊 Systemic Treatment</h4>
                              <p className="text-sm">{analysis.treatment_recommendations.systemic_treatment}</p>
                            </div>
                          )}
                          {analysis.treatment_recommendations.cultural_practices && (
                            <div>
                              <h4 className="font-medium text-green-700 mb-1">🌱 Cultural Practices</h4>
                              <p className="text-sm">{analysis.treatment_recommendations.cultural_practices}</p>
                            </div>
                          )}
                          {analysis.treatment_recommendations.organic_alternatives && (
                            <div>
                              <h4 className="font-medium text-amber-700 mb-1">🍃 Organic Alternatives</h4>
                              <p className="text-sm">{analysis.treatment_recommendations.organic_alternatives}</p>
                            </div>
                          )}
                          {analysis.treatment_recommendations.prevention && (
                            <div>
                              <h4 className="font-medium text-purple-700 mb-1">🛡️ Prevention</h4>
                              <p className="text-sm">{analysis.treatment_recommendations.prevention}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    {getText('diseaseDetection.shareExpert', 'Share with Expert')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    {getText('diseaseDetection.uploadToSee', 'Upload an image to see analysis results')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* History Tab */}
      <TabsContent value="history" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {getText('diseaseDetection.history', 'Detection History')}
            </CardTitle>
            <CardDescription>
              {getText('diseaseDetection.previousDetections', 'Your previous crop disease detections')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  {getText('diseaseDetection.loadingHistory', 'Loading history...')}
                </p>
              </div>
            ) : detections.length > 0 ? (
              <div className="space-y-3">
                {detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      toast({
                        title: "Detection Details",
                        description: `${detection.disease_name} detected in ${detection.crop_type}`,
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getSeverityColor(detection.severity)}>
                          {detection.severity?.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {((detection.confidence_score || 0.5) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{detection.disease_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {detection.crop_type} • {new Date(detection.detection_date).toLocaleDateString()}
                      </p>
                      {detection.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {detection.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  {getText('diseaseDetection.noHistory', 'No detection history yet. Upload your first crop image to get started!')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</div>
  );
};

export default DiseaseDetection;