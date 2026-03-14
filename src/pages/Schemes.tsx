import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Search, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useState } from 'react';

// Comprehensive Karnataka and Central Government Schemes
const mockSchemes = [
  // Central Government Schemes
  {
    id: 1,
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    nameKn: "ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    description: "Direct income support of ₹6,000 per year to small and marginal farmers",
    descriptionKn: "ಸಣ್ಣ ಮತ್ತು ಕನಿಷ್ಠ ರೈತರಿಗೆ ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ಆದಾಯ ಬೆಂಬಲ",
    benefit: "₹6,000/year",
    category: "Income Support",
    status: "Active",
    eligibility: "Small & Marginal Farmers",
    deadline: "Ongoing",
    authority: "Ministry of Agriculture",
    link: "https://pmkisan.gov.in"
  },
  {
    id: 2,
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameKn: "ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ",
    description: "Crop insurance scheme providing financial support to farmers in case of crop failure",
    descriptionKn: "ಬೆಳೆ ವಿಫಲವಾದ ಸಂದರ್ಭದಲ್ಲಿ ರೈತರಿಗೆ ಆರ್ಥಿಕ ಬೆಂಬಲ ನೀಡುವ ಬೆಳೆ ವಿಮಾ ಯೋಜನೆ",
    benefit: "Up to 100% Sum Insured",
    category: "Insurance",
    status: "Active",
    eligibility: "All Farmers",
    deadline: "Seasonal",
    authority: "Ministry of Agriculture",
    link: "https://pmfby.gov.in"
  },
  {
    id: 3,
    name: "Kisan Credit Card (KCC)",
    nameKn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್",
    description: "Credit facility for farmers to purchase agricultural inputs and equipment",
    descriptionKn: "ಕೃಷಿ ಒಳಹರಿವುಗಳು ಮತ್ತು ಉಪಕರಣಗಳನ್ನು ಖರೀದಿಸಲು ರೈತರಿಗೆ ಸಾಲ ಸೌಲಭ್ಯ",
    benefit: "Credit up to ₹3 Lakh",
    category: "Credit",
    status: "Active",
    eligibility: "All Farmers",
    deadline: "Ongoing",
    authority: "Reserve Bank of India",
    link: "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=115"
  },
  
  // Karnataka State Schemes
  {
    id: 4,
    name: "Raitha Bandhu Scheme (Karnataka)",
    nameKn: "ರೈತ ಬಂಧು ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    description: "Karnataka state scheme providing investment support to farmers - ₹10,000 per acre per season",
    descriptionKn: "ರೈತರಿಗೆ ಪ್ರತಿ ಎಕರೆಗೆ ಪ್ರತಿ ಋತುವಿಗೆ ₹10,000 ಹೂಡಿಕೆ ಬೆಂಬಲ ನೀಡುವ ಕರ್ನಾಟಕ ರಾಜ್ಯ ಯೋಜನೆ",
    benefit: "₹10,000/acre/season",
    category: "State Scheme",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "Ongoing",
    authority: "Karnataka Government",
    link: "https://raitamitra.karnataka.gov.in/"
  },
  {
    id: 5,
    name: "Karnataka Raita Vidya Shakti Scheme",
    nameKn: "ಕರ್ನಾಟಕ ರೈತ ವಿದ್ಯಾ ಶಕ್ತಿ ಯೋಜನೆ",
    description: "Electricity subsidy for agricultural pump sets - Free electricity up to 7 HP",
    descriptionKn: "ಕೃಷಿ ಪಂಪ್ ಸೆಟ್‌ಗಳಿಗೆ ವಿದ್ಯುತ್ ಸಬ್ಸಿಡಿ - 7 HP ವರೆಗೆ ಉಚಿತ ವಿದ್ಯುತ್",
    benefit: "Free electricity up to 7 HP",
    category: "State Scheme",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "Ongoing",
    authority: "Karnataka Electricity Board",
    link: "https://bescom.karnataka.gov.in/"
  },
  {
    id: 6,
    name: "Krishi Bhagya Scheme (Karnataka)",
    nameKn: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    description: "Micro-irrigation scheme providing drip and sprinkler irrigation systems",
    descriptionKn: "ಡ್ರಿಪ್ ಮತ್ತು ಸ್ಪ್ರಿಂಕ್ಲರ್ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಗಳನ್ನು ಒದಗಿಸುವ ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಯೋಜನೆ",
    benefit: "90% subsidy on micro-irrigation",
    category: "State Scheme",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "Ongoing",
    authority: "Department of Horticulture, Karnataka",
    link: "https://horticulture.kar.nic.in/"
  },
  {
    id: 7,
    name: "Anna Bhagya Scheme (Karnataka)",
    nameKn: "ಅನ್ನ ಭಾಗ್ಯ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    description: "Free rice distribution to BPL families - 35 kg rice per month",
    descriptionKn: "BPL ಕುಟುಂಬಗಳಿಗೆ ಉಚಿತ ಅಕ್ಕಿ ವಿತರಣೆ - ತಿಂಗಳಿಗೆ 35 ಕೆಜಿ ಅಕ್ಕಿ",
    benefit: "35 kg free rice/month",
    category: "State Scheme",
    status: "Active",
    eligibility: "BPL Families in Karnataka",
    deadline: "Ongoing",
    authority: "Food & Civil Supplies Department, Karnataka",
    link: "https://ahara.kar.gov.in/"
  },
  {
    id: 8,
    name: "Karnataka Organic Farming Mission",
    nameKn: "ಕರ್ನಾಟಕ ಸಾವಯವ ಕೃಷಿ ಮಿಷನ್",
    description: "Promoting organic farming with financial assistance and certification support",
    descriptionKn: "ಆರ್ಥಿಕ ಸಹಾಯ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ ಬೆಂಬಲದೊಂದಿಗೆ ಸಾವಯವ ಕೃಷಿಯನ್ನು ಉತ್ತೇಜಿಸುವುದು",
    benefit: "₹25,000/ha + certification support",
    category: "Organic Farming",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "March 2025",
    authority: "Department of Agriculture, Karnataka",
    link: "https://raitamitra.karnataka.gov.in/info-4/Organic+Farming/en"
  },
  {
    id: 9,
    name: "Bhoochetana Scheme (Karnataka)",
    nameKn: "ಭೂಚೇತನ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    description: "Soil health improvement and productivity enhancement program",
    descriptionKn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಮತ್ತು ಉತ್ಪಾದಕತೆ ವೃದ್ಧಿ ಕಾರ್ಯಕ್ರಮ",
    benefit: "Free soil testing + nutrients",
    category: "Soil Health",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "Ongoing",
    authority: "University of Agricultural Sciences, Karnataka",
    link: "https://uasb.edu.in/"
  },
  {
    id: 10,
    name: "Sapthagiri Yojana (Karnataka)",
    nameKn: "ಸಪ್ತಗಿರಿ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    description: "Horticulture development program for hill areas in Karnataka",
    descriptionKn: "ಕರ್ನಾಟಕದ ಬೆಟ್ಟದ ಪ್ರದೇಶಗಳಿಗೆ ತೋಟಗಾರಿಕೆ ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಕ್ರಮ",
    benefit: "75% subsidy on plantation",
    category: "Horticulture",
    status: "Active",
    eligibility: "Hill Area Farmers",
    deadline: "December 2025",
    authority: "Karnataka State Horticulture Department",
    link: "https://horticulture.kar.nic.in/sapthagiri.html"
  },
  {
    id: 11,
    name: "Karnataka Watershed Development Project",
    nameKn: "ಕರ್ನಾಟಕ ಜಲಾನಯನ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆ",
    description: "Watershed development for sustainable agriculture and water conservation",
    descriptionKn: "ಸುಸ್ಥಿರ ಕೃಷಿ ಮತ್ತು ಜಲ ಸಂರಕ್ಷಣೆಗಾಗಿ ಜಲಾನಯನ ಅಭಿವೃದ್ಧಿ",
    benefit: "Complete watershed treatment",
    category: "Water Conservation",
    status: "Active",
    eligibility: "Farmers in watershed areas",
    deadline: "Ongoing",
    authority: "Watershed Development Department, Karnataka",
    link: "https://watershedkarnatakacloud.in/"
  },
  {
    id: 12,
    name: "Rashtriya Gokul Mission (Karnataka)",
    nameKn: "ರಾಷ್ಟ್ರೀಯ ಗೋಕುಲ್ ಮಿಷನ್ (ಕರ್ನಾಟಕ)",
    description: "Indigenous cattle breed development and dairy productivity enhancement",
    descriptionKn: "ದೇಶೀಯ ಗೋವಿನ ತಳಿ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಹೈನುಗಾರಿಕೆ ಉತ್ಪಾದಕತೆ ವೃದ್ಧಿ",
    benefit: "₹2 lakh per Gokul Gram",
    category: "Animal Husbandry",
    status: "Active",
    eligibility: "Dairy Farmers",
    deadline: "March 2026",
    authority: "Animal Husbandry Department, Karnataka",
    link: "https://ahvs.kar.nic.in/"
  },
  {
    id: 13,
    name: "Karnataka Fisheries Development Scheme",
    nameKn: "ಕರ್ನಾಟಕ ಮತ್ಸ್ಯಾಭಿವೃದ್ಧಿ ಯೋಜನೆ",
    description: "Financial assistance for fish farming and aquaculture development",
    descriptionKn: "ಮೀನು ಸಾಕಣೆ ಮತ್ತು ಜಲಕೃಷಿ ಅಭಿವೃದ್ಧಿಗೆ ಆರ್ಥಿಕ ಸಹಾಯ",
    benefit: "50-75% subsidy on pond construction",
    category: "Fisheries",
    status: "Active",
    eligibility: "Fish Farmers",
    deadline: "Ongoing",
    authority: "Department of Fisheries, Karnataka",
    link: "https://fisheries.kar.nic.in/"
  },
  {
    id: 14,
    name: "Karnataka Sericulture Development Scheme",
    nameKn: "ಕರ್ನಾಟಕ ರೇಷ್�ೆಕೀಟ ಸಾಕಣೆ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆ",
    description: "Support for sericulture farmers with mulberry cultivation and silk production",
    descriptionKn: "ಮಲ್ಬೆರಿ ಕೃಷಿ ಮತ್ತು ರೇಷ್ಮೆ ಉತ್ಪಾದನೆಯೊಂದಿಗೆ ರೇಷ್ಮೆಕೀಟ ಸಾಕಣೆ ರೈತರಿಗೆ ಬೆಂಬಲ",
    benefit: "₹25,000/ha for mulberry plantation",
    category: "Sericulture",
    status: "Active",
    eligibility: "Sericulture Farmers",
    deadline: "Ongoing",
    authority: "Department of Sericulture, Karnataka",
    link: "https://silk.kar.nic.in/"
  },
  {
    id: 15,
    name: "Karnataka Solar Pump Scheme",
    nameKn: "ಕರ್ನಾಟಕ ಸೌರ ಪಂಪ್ ಯೋಜನೆ",
    description: "Solar-powered irrigation pump sets with 95% government subsidy",
    descriptionKn: "95% ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಯೊಂದಿಗೆ ಸೌರಶಕ್ತಿ ಚಾಲಿತ ನೀರಾವರಿ ಪಂಪ್ ಸೆಟ್‌ಗಳು",
    benefit: "95% subsidy on solar pumps",
    category: "Solar Energy",
    status: "Active",
    eligibility: "Karnataka Farmers",
    deadline: "December 2025",
    authority: "Karnataka Renewable Energy Development Ltd.",
    link: "https://kredl.kar.gov.in/"
  }
];

const Schemes = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredSchemes = mockSchemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.nameKn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || scheme.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success/20 text-success border-success/30';
      case 'upcoming':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'expired':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Income Support':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'Insurance':
        return 'bg-sky/20 text-sky border-sky/30';
      case 'Credit':
        return 'bg-success/20 text-success border-success/30';
      case 'State Scheme':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-primary/5 to-sky/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-sky rounded-xl flex items-center justify-center shadow-medium">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-poppins">
            Government Schemes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover and apply for agricultural schemes, subsidies, and support programs 
            available from central and state governments.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Schemes</p>
                  <p className="text-2xl font-bold text-foreground">42</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Schemes</p>
                  <p className="text-2xl font-bold text-success">38</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiaries</p>
                  <p className="text-2xl font-bold text-foreground">2.5L+</p>
                </div>
                <Users className="w-8 h-8 text-sky" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Benefits</p>
                  <p className="text-2xl font-bold text-foreground">₹850Cr</p>
                </div>
                <DollarSign className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-medium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-primary" />
              Filter Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Schemes</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schemes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Income Support">Income Support</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="State Scheme">State Scheme</SelectItem>
                    <SelectItem value="Advisory">Advisory</SelectItem>
                    <SelectItem value="Organic Farming">Organic Farming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="shadow-medium hover-lift transition-spring">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-poppins mb-2">
                      {scheme.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium mb-3">
                      {scheme.nameKn}
                    </p>
                  </div>
                  <Badge className={getStatusColor(scheme.status)}>
                    {scheme.status}
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {scheme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Benefit Amount</p>
                    <p className="font-semibold text-success">{scheme.benefit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Eligibility</p>
                    <p className="font-medium text-sm">{scheme.eligibility}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getCategoryColor(scheme.category)}>
                    {scheme.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    Deadline: {scheme.deadline}
                  </div>
                </div>

                <div className="pt-4 border-t border-muted">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Authority: {scheme.authority}
                    </p>
                    <Button 
                      variant="nature" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (scheme.link) {
                          window.open(scheme.link, '_blank', 'noopener,noreferrer');
                          toast({
                            title: "Redirecting to Application",
                            description: `Opening ${scheme.name} application portal`,
                          });
                        } else {
                          toast({
                            title: "Link Not Available",
                            description: "Application link is currently unavailable. Please contact the authority directly.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Apply Now
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* <Card className="shadow-medium border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Need Help Applying?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <h4 className="font-semibold text-primary mb-2">📞 Helpline Support</h4>
                <p className="text-sm text-foreground mb-2">
                  Call our dedicated helpline for scheme assistance
                </p>
                <p className="font-mono text-primary">1800-180-1551</p>
              </div>
              
              <div className="p-4 bg-sky/10 rounded-xl">
                <h4 className="font-semibold text-sky mb-2">🏢 Visit Agriculture Office</h4>
                <p className="text-sm text-foreground">
                  Get assistance from your local agriculture extension officer
                </p>
              </div>
              
              <Button variant="outline" className="w-full">
                Find Nearest Office
              </Button>
            </CardContent>
          </Card> */}

          {/* <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Track your scheme applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">PM-KISAN Application</span>
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Application ID: PMK2024001234
                  </p>
                </div>
                
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Raitha Bandhu Application</span>
                    <Badge className="bg-warning/20 text-warning border-warning/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Processing
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Application ID: RB2024005678
                  </p>
                </div>
                
                <Button variant="nature" className="w-full">
                  Check Application Status
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default Schemes;