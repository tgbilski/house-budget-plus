import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, Sparkles } from 'lucide-react';

interface InlineSignUpFormProps {
  className?: string;
}

const InlineSignUpForm: React.FC<InlineSignUpFormProps> = ({ className = '' }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/budget`
        }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Check your inbox for the verification link."
        });
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/budget`
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else if (data?.user?.identities?.length === 0) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          setIsSignUp(false);
        } else {
          setVerificationSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <Card className={`border-[3px] border-stroke shadow-cartoon ${className}`}>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
            <Check className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-xl text-foreground">Check Your Email!</CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>. Click it to start saving your budget data.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center mb-3">
            Didn't receive the email? Check your spam folder or resend it.
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendVerification}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-[3px] border-primary shadow-cartoon ring-4 ring-primary/20 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-foreground">
            {isSignUp ? "Don't Lose Your Stuff" : "You're back!"}
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-sm">
          {isSignUp 
            ? 'Join the adulting squad 💪'
            : 'Your budgets are waiting for you'
          }
        </CardDescription>
        {isSignUp && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-foreground">Free forever — unlimited budget calculators</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-foreground">Save & sync your data across devices</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Premium: AI insights & daily expense tracking</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="inline-email" className="text-sm">Email</Label>
            <Input
              id="inline-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inline-password" className="text-sm">Password</Label>
            <Input
              id="inline-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 6 characters"
              minLength={6}
              className="h-9"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'One sec...' : (isSignUp ? "Let's Go 🚀" : 'Sign In')}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={async () => {
              setLoading(true);
              await signInWithGoogle();
              setLoading(false);
            }}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
        
        <div className="text-center mt-3">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineSignUpForm;
