import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isNativeApp } from '@/utils/capacitor';
import { ArrowLeft } from 'lucide-react';
import mascotIcon from '@/assets/calculator-mascot.png';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobileApp = isNativeApp();

  // Check for password reset token and redirect if already authenticated
  useEffect(() => {
    // Check if this is a password reset callback
    const checkPasswordReset = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        setIsResettingPassword(true);
        setIsForgotPassword(false);
        setIsSignUp(false);
        return;
      }
    };

    checkPasswordReset();

    if (user && !isResettingPassword) {
      // Mobile app users always redirect to expenses page after login
      // The subscription check will happen in the Expenses page
      navigate(isMobileApp ? '/expenses' : '/features');
    }
  }, [user, navigate, isResettingPassword, isMobileApp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResettingPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (newPassword.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password updated",
            description: "Your password has been successfully updated."
          });
          setIsResettingPassword(false);
          navigate('/');
        }
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link."
          });
          setIsForgotPassword(false);
        }
      } else if (isSignUp) {
        // Redirect to features page after email verification
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/features`
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setVerificationSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          // Redirect to expenses for mobile app, features for web
          navigate(isMobileApp ? '/expenses' : '/features');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-foreground hover:bg-foreground/10"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <img 
        src={mascotIcon} 
        alt="Budget Mascot" 
        className="absolute top-4 right-4 w-16 h-16 object-contain"
      />
      
      <Card className="w-full max-w-md bg-transparent border-0 shadow-none">
        {verificationSent ? (
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-foreground mb-4">
              This is exciting!
            </CardTitle>
            <CardDescription className="text-foreground/80 text-lg">
              Please verify your email to get started. Check your inbox for the verification link.
            </CardDescription>
          </CardHeader>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">
                {isResettingPassword ? 'Set New Password' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In'))}
              </CardTitle>
              <CardDescription className="text-foreground/80">
                {isResettingPassword
                  ? 'Enter your new password below'
                  : (isForgotPassword 
                    ? 'Enter your email to receive a password reset link'
                    : (isSignUp
                      ? 'Create an account to save your budget data'
                      : 'Sign in to access your saved budget data'
                    )
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isResettingPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter your new password"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your new password"
                    minLength={6}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      minLength={6}
                    />
                  </div>
                )}
              </>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Please wait...' : (
                isResettingPassword ? 'Update Password' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Verify Email' : 'Sign In'))
              )}
            </Button>
            
            {!isForgotPassword && !isResettingPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-sage px-2 text-foreground/70">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5"
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
              </>
            )}
            
            {isSignUp && (
              <p className="text-sm text-foreground/70 text-center mt-2">
                To save your data, sign in
              </p>
            )}
          </form>
          
          <div className="text-center mt-4 space-y-2">
            {!isForgotPassword && !isResettingPassword && (
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-foreground hover:text-foreground/80"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"
                }
              </Button>
            )}
            
            {!isSignUp && !isResettingPassword && (
              <Button
                variant="link"
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="text-sm block w-full text-foreground hover:text-foreground/80"
              >
                {isForgotPassword ? 'Back to Sign In' : 'Forgot your password?'}
              </Button>
            )}
          </div>
        </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;