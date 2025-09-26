import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Crown } from 'lucide-react';
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
          <Settings className="h-6 w-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
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
              <div>
                {subscribed ? (
                  <Badge variant="secondary">
                    Active: {subscriptionTier}
                    {subscriptionEnd && ` (expires ${new Date(subscriptionEnd).toLocaleDateString()})`}
                  </Badge>
                ) : (
                  <Badge variant="secondary">No active subscription</Badge>
                )}
              </div>
              {subscribed && (
                <Button variant="outline" size="sm" onClick={openCustomerPortal}>
                  Manage Subscription
                </Button>
              )}
            </div>
            {!subscribed && !loading && (
              <div className="mt-2">
                <PricingCards />
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* PDF Usage Info */}
        <Card>
          <CardHeader>
            <CardTitle>PDF Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You have processed <strong>{pdfCount}</strong> PDFs.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    </div>
  );
}
