import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileLanding: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth');
  };
  
  const handleVisitWebsite = () => {
    window.open('https://housebudgetcalculator.com', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sage/20 to-teal/10">
      <div className="max-w-md w-full space-y-8">
        {/* App Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-3xl shadow-2xl overflow-hidden bg-white p-2">
              <img 
                src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
                alt="House Budget Calculator mascot - friendly budget planning assistant" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Welcome!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              House Budget Calculator
            </p>
          </div>
        </div>

        {/* Subscriber Section */}
        <Card className="border-2 border-primary/20 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Are you a subscriber?
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to streamline your experience and access all premium features!
              </p>
            </div>
            <Button 
              onClick={handleSignIn}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-lg"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </CardContent>
        </Card>

        {/* Non-Subscriber Section */}
        <Card className="border-2 border-border/40 shadow-lg bg-white/60 backdrop-blur-sm">
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
