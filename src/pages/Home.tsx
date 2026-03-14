import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import farmingHero from '@/assets/farming-hero.jpg';
import farmingTech from '@/assets/farming-tech.jpg';
import { 
  Sprout, 
  CloudRain, 
  TrendingUp, 
  Package, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle,ReceiptIndianRupee,Leaf
} from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const features = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Smart Crop Planning",
      titleKn: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಯೋಜನೆ",
      description: "Optimize your crop selection based on soil analysis, weather patterns, and market demand forecasts.",
      descriptionKn: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ, ಹವಾಮಾನ ಮಾದರಿಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮುನ್ನೋಟಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಬೆಳೆ ಆಯ್ಕೆಯನ್ನು ಅತ್ಯುತ್ತಮಗೊಳಿಸಿ.",
      link: "/crop-planning"
    },
    {
      icon: <CloudRain className="w-8 h-8" />,
      title: "Weather Insights",
      titleKn: "ಹವಾಮಾನ ಒಳನೋಟಗಳು",
      description: "Get accurate weather forecasts and agricultural alerts to protect your crops and plan farming activities.",
      descriptionKn: "ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಕೃಷಿ ಚಟುವಟಿಕೆಗಳನ್ನು ಯೋಜಿಸಲು ನಿಖರವಾದ ಹವಾಮಾನ ಮುನ್ನೋಟಗಳು ಮತ್ತು ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
      link: "/weather"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Market Intelligence",
      titleKn: "ಮಾರುಕಟ್ಟೆ ಬುದ್ಧಿವಂತಿಕೆ",
      description: "Access real-time market prices and trends to make informed decisions about when and where to sell.",
      descriptionKn: "ಯಾವಾಗ ಮತ್ತು ಎಲ್ಲಿ ಮಾರಾಟ ಮಾಡಬೇಕು ಎಂಬುದರ ಕುರಿತು ತಿಳುವಳಿಕೆಯುಳ್ಳ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ನೈಜ ಸಮಯದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ಪ್ರವೃತ್ತಿಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.",
      link: "/market-prices"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Supply Chain Tracking",
      titleKn: "ಪೂರೈಕೆ ಸರಪಳಿ ಟ್ರ್ಯಾಕಿಂಗ್",
      description: "Track your products from farm to market with complete visibility and transparency.",
      descriptionKn: "ಸಂಪೂರ್ಣ ಗೋಚರಿಸುವಿಕೆ ಮತ್ತು ಪಾರದರ್ಶಕತೆಯೊಂದಿಗೆ ಫಾರ್ಮ್‌ನಿಂದ ಮಾರುಕಟ್ಟೆಗೆ ನಿಮ್ಮ ಉತ್ಪಾದನೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
      link: "/supply-chain"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Government Schemes",
      titleKn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      description: "Stay updated with the latest agricultural schemes and subsidies available from the government.",
      descriptionKn: "ಸರ್ಕಾರದಿಂದ ಲಭ್ಯವಿರುವ ಇತ್ತೀಚಿನ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳೊಂದಿಗೆ ನವೀಕರಿಸಿ.",
      link: "/schemes"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Farmer Marketplace",
      titleKn: "ರೈತ ಮಾರುಕಟ್ಟೆ",
      description: "Connect with other farmers, buy and sell equipment, seeds, and fertilizers in our marketplace.",
      descriptionKn: "ಇತರ ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ನಮ್ಮ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉಪಕರಣಗಳು, ಬೀಜಗಳು ಮತ್ತು ರಸಗೊಬ್ಬರಗಳನ್ನು ಖರೀದಿ ಮತ್ತು ಮಾರಾಟ ಮಾಡಿ.",
      link: "/marketplace"
    },
    {
    icon: <ReceiptIndianRupee className="w-8 h-8" />,
    title: "Revenue & Expense Tracker",
    titleKn: "ಆದಾಯ ಮತ್ತು ವೆಚ್ಚ ಟ್ರ್ಯಾಕರ್",
    description: "Easily track your farm income and expenses to manage your finances better.",
    descriptionKn: "ನಿಮ್ಮ ಕೃಷಿ ಆದಾಯ ಮತ್ತು ವೆಚ್ಚಗಳನ್ನು ಸುಲಭವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಹಣಕಾಸಿನ ನಿರ್ವಹಣೆಯನ್ನು ಉತ್ತಮಗೊಳಿಸಿ.",
    link: "/finance-tracker"
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Crop Disease Detector",
    titleKn: "ಬೆಳೆ ರೋಗ ಪತ್ತೆಗಾರ",
    description: "Identify crop diseases early to protect your harvest and maximize yield.",
    descriptionKn: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಉತ್ಪಾದನೆಯನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ಬೆಳೆಯ ರೋಗಗಳನ್ನು ಆರಂಭಿಕವಾಗಿ ಗುರುತಿಸಿ.",
    link: "/disease-detection"
  }
  ];

  const benefits = [
    "Increase crop yield by up to 30%",
    "Reduce farming costs through better planning",
    "Access to government subsidies and schemes",
    "Real-time market price alerts",
    "Weather-based farming recommendations",
    "Direct connection to buyers and suppliers"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${farmingHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8 fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight font-poppins">
              {t('hero.title')}
              <span className="block text-2xl md:text-3xl font-normal mt-4 text-white/90">
                ರೈತಬಾಂಧವ - Farmer's Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {user && profile ? (
                <Button asChild variant="hero" size="lg" className="text-lg px-8 py-4">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="lg" className="text-lg px-8 py-4">
                  <Link to="/auth">
                    {t('cta.getStarted')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                {t('cta.learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-poppins">
              {t('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools and insights to help you make better farming decisions 
              and increase your agricultural productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="block">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  variant={index === 0 ? 'highlighted' : 'default'}
                  className="slide-up hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {/* <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground font-poppins">
                Why Choose
                <span className="block text-primary">Raitha Bandhava?</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of farmers who have transformed their agricultural practices 
                with our comprehensive farming management platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button variant="nature" size="lg" className="text-lg px-8 py-4">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="slide-up">
              <img
                src={farmingTech}
                alt="Modern farming technology"
                className="rounded-2xl shadow-strong hover-lift"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-white slide-up">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl leading-relaxed opacity-90">
              Join the agricultural revolution with Raitha Bandhava. 
              Get started today and experience smarter farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="ghost" size="lg" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-primary">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;