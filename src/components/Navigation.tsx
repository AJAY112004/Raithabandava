import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import NotificationBell from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, loading } = useAuth();

  const menuItems = [
    { 
      path: '/', 
      label: { en: 'Home', kn: 'ಮುಖ್ಯ ಪುಟ' }
    },
    { 
      path: '/crop-planning', 
      label: { en: 'Crop Planning', kn: 'ಬೆಳೆ ಯೋಜನೆ' }
    },
    { 
      path: '/weather', 
      label: { en: 'Weather', kn: 'ಹವಾಮಾನ' }
    },
    { 
      path: '/market-prices', 
      label: { en: 'Market Prices', kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು' }
    },
    { 
      path: '/schemes', 
      label: { en: 'Gov Schemes', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' }
    },
    { 
      path: '/marketplace', 
      label: { en: 'Marketplace', kn: 'ಮಾರುಕಟ್ಟೆ' }
    },
    { 
      path: '/supply-chain', 
      label: { en: 'Supply Chain', kn: 'ಪೂರೈಕೆ ಸರಪಳಿ' }
    },
    { 
      path: '/finance-tracker', 
      label: { en: 'Finance Tracker', kn: 'ಹಣಕಾಸು ಟ್ರ್ಯಾಕರ್' }
    },
    { 
      path: '/disease-detection', 
      label: { en: 'Disease Detection', kn: 'ರೋಗ ಪತ್ತೆ' }
    },
    { 
      path: '/community', 
      label: { en: 'Community', kn: 'ಸಮುದಾಯ' }
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary font-poppins">
                Raitha Bandhava
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                {language === 'en' ? "Farmer's Companion" : "ರೈತ ಬಂಧವ"}
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-smooth hover:bg-primary/10",
                  isActive(item.path) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:text-primary"
                )}
              >
                {item.label[language]}
              </Link>
            ))}
          </div>

          {/* Language Toggle, Auth & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="hidden sm:flex"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </Button>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Auth Section - Desktop */}
            <div className="hidden md:flex">
              {loading ? (
                <Button variant="outline" size="sm" disabled>
                  <User className="h-4 w-4 mr-2" />
                  Loading...
                </Button>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">
                        {profile?.name || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {profile?.role || 'user'}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link to="/Auth">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-primary/10 py-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
                  isActive(item.path) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {item.label[language]}
              </Link>
            ))}
            <div className="pt-2 border-t border-primary/10 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
                className="w-full justify-start"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Switch to ಕನ್ನಡ' : 'Switch to English'}
              </Button>
              
              {/* Mobile Auth Section */}
              {loading ? (
                <Button variant="ghost" size="sm" className="w-full justify-start" disabled>
                  <User className="w-4 h-4 mr-2" />
                  Loading...
                </Button>
              ) : user ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      {profile?.name || user?.email?.split('@')[0] || 'User'} ({profile?.role || 'user'})
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full justify-start text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link to="/Auth" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;