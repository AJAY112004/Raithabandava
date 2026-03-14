import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Phone, CreditCard, Sprout } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'distributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('cropPlanning.welcome')}, {profile.name}!
            </h1>
            <p className="text-muted-foreground">
              Your personalized farming dashboard
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Overview */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile.name}</span>
                </div>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.aadhaar_number || 'Not provided'}</span>
                </div>
                <div className="col-span-full flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{profile.address || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                {profile.role === 'farmer' ? 'Farming Info' : 'Activity'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.role === 'farmer' ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{profile.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Crops Grown</p>
                    {profile.crops_grown && profile.crops_grown.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.crops_grown.map((crop, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No crops specified</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'admin' 
                    ? 'You have administrative access to the platform.'
                    : 'You can connect with farmers and manage distribution.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/weather">View Weather</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/market-prices">Market Prices</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/crop-planning">Crop Planning</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/schemes">Government Schemes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;