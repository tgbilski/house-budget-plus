import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Crown, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PricingCards } from '@/components/PricingCards';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    openCustomerPortal,
    loading 
  } = useSubscription();
  const [pdfCount, setPdfCount] = useState<number>(0);

  useEffect(() => {
    const fetchPdfCount = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('pdf_processing_logs')
          .select('id')
          .eq('user_id', user.id);
        
        if (!error) {
          setPdfCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching PDF count:', error);
      }
    };

    fetchPdfCount();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Please sign in to access settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-foreground">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'Not provided'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={subscribed ? "default" : "secondary"}>
                  {subscribed ? "Premium Active" : "Free Plan"}
                </Badge>
                {subscriptionTier && (
                  <span className="text-sm text-muted-foreground">
                    {subscriptionTier}
                  </span>
                )}
              </div>
              {subscribed && subscriptionEnd && (
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Renews {new Date(subscriptionEnd).toLocaleDateString()}
                </div>
              )}
            </div>

            {subscribed ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
                  <div className="space-y-2">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Unlimited AI Budget Insights
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Personalized financial recommendations
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Smart spending analysis
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={openCustomerPortal}
                    disabled={loading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        Need to Cancel?
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        Click "Manage Subscription" above to cancel or modify your plan. You'll keep access until your current billing period ends.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🤖 Upgrade to Premium for unlimited AI Budget Insights and personalized financial recommendations!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Choose Your Plan</h3>
                  <PricingCards />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}