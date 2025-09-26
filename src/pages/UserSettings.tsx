import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Settings, Crown, Edit2, Save, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PricingCards } from '@/components/PricingCards';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const { toast } = useToast();
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    openCustomerPortal,
    loading
  } = useSubscription();
  const [pdfCount, setPdfCount] = useState<number>(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

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

  const handleSaveName = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: user.email
        });

      if (error) throw error;

      await refetchProfile();
      setIsEditingName(false);
      toast({
        title: "Success",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(profile?.first_name || '');
    setLastName(profile?.last_name || '');
    setIsEditingName(false);
  };

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
            <CardTitle className="flex items-center justify-between">
              Profile Information
              {!isEditingName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                {isEditingName ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={isSaving}
                        className="h-8"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="h-8"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Not provided'
                    }
                  </p>
                )}
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
