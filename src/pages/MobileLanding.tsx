import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExternalLink, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isNativeApp } from '@/utils/capacitor';
import { useMarkPageReady } from '@/hooks/usePageReady';

export const MobileLanding: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mark page as ready on mount
  useMarkPageReady();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/expenses');
      }
    });
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully!');
      navigate('/expenses');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/expenses`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };
  
  const handleVisitWebsite = () => {
    window.open('https://housebudgetcalculator.com', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background" style={{ paddingTop: '50px' }}>
      <div className="max-w-md w-full space-y-8">
        {/* App Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center" style={{ paddingTop: '30px' }}>
            <img 
              src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
              alt="House Budget Calculator mascot - friendly budget planning assistant" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Welcome!
            </h1>
            <p className="text-lg text-primary mt-2">
              House Budget Calculator
            </p>
          </div>
        </div>

        {/* Authentication Section */}
        <Card className="border-2 border-primary/20 shadow-xl bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Sign In
              </h2>
              <p className="text-sm text-muted-foreground">
                Welcome back! Sign in to continue.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-lg"
                size="lg"
              >
                {isLoading ? 'Loading...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-12 text-base"
              size="lg"
            >
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        {/* Non-Subscriber Section */}
        <Card className="border-2 border-border/40 shadow-lg bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Not subscribed yet?
              </h2>
              <p className="text-sm text-muted-foreground">
                Visit our website to explore plans and sign up for premium features.
              </p>
            </div>
            <Button 
              onClick={handleVisitWebsite}
              variant="outline"
              className="w-full h-12 text-base border-2 hover:bg-muted/50"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Visit Website
            </Button>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground">
          Manage your household finances with ease
        </p>
      </div>
    </div>
  );
};

export default MobileLanding;
