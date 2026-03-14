import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useMarkPageReady } from '@/hooks/usePageReady';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isNativeApp } from '@/utils/capacitor';
import { ArrowLeft, Sparkles, Shield, Save, CheckCircle2, CreditCard, Lock } from 'lucide-react';
import mascotIcon from '@/assets/calculator-mascot.png';

const Auth: React.FC = () => {
  const location = useLocation();
  const isSignUpRoute = location.pathname === '/signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpRoute);
  const [signUpStep, setSignUpStep] = useState(1); // Step 1 = why, Step 2 = form
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
  
  useMarkPageReady();

  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
    setSignUpStep(1);
  }, [location.pathname]);

  useEffect(() => {
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
      navigate(isMobileApp ? '/budget' : '/budget');
    }
  }, [user, navigate, isResettingPassword, isMobileApp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResettingPassword) {
        if (newPassword !== confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Password updated", description: "Your password has been successfully updated." });
          setIsResettingPassword(false);
          navigate('/');
        }
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email", description: "We've sent you a password reset link." });
          setIsForgotPassword(false);
        }
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/budget` }
        });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data?.user?.identities?.length === 0) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          navigate('/login');
        } else {
          setVerificationSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate('/budget');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (isSignUp) {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  // Single-step signup: benefits + form together
  const renderSignUpForm = () => (
    <div className="w-full max-w-md mx-auto">
      {/* Back to home */}
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 mx-auto lg:mx-0">
        <ArrowLeft className="w-4 h-4" />
        Back to calculators
      </button>

      <div className="text-center">
        <img src={mascotIcon} alt="Budget mascot" className="w-16 h-16 mx-auto mb-3 drop-shadow-lg" />

        <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 mb-4 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4" />
          100% Free — No credit card
        </div>

        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-1 leading-tight">
          Create your free account
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Save your budgets, sync across devices, and track your savings.
        </p>
      </div>

      {/* Google signup — fastest path */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-semibold border-2 border-border hover:border-primary/40 hover:bg-primary/5 mb-4"
        onClick={async () => {
          setLoading(true);
          await signInWithGoogle();
          setLoading(false);
        }}
        disabled={loading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">or with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="6+ characters" minLength={6} className="h-12" />
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          disabled={loading}
        >
          {loading ? 'Please wait...' : "Create Free Account 🚀"}
        </Button>
      </form>

      {/* Compact benefit highlights */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2.5">
          <Save className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs font-medium text-foreground">Save data</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <Shield className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs font-medium text-foreground">Sync devices</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <Sparkles className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs font-medium text-foreground">AI insights</p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      {/* Back button — only on login/reset views (signup steps have their own nav) */}
      {(!isSignUp || verificationSent) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-20 text-foreground hover:bg-foreground/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      )}

      {verificationSent ? (
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-black text-foreground">LFG! 🔥</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Just verify your email and you're in.<br />Check your inbox for the link.
          </p>
          <Button variant="outline" onClick={() => navigate('/login')} className="mt-4">
            Go to Sign In
          </Button>
        </div>
      ) : isSignUp && signUpStep === 1 ? (
        renderSignUpStep1()
      ) : isSignUp && signUpStep === 2 ? (
        renderSignUpStep2()
      ) : (
        /* Login / Forgot Password / Reset Password */
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <img src={mascotIcon} alt="Budget mascot" className="w-12 h-12 object-contain" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">House Budget+</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-1 text-center">
            {isResettingPassword ? 'Set New Password' : isForgotPassword ? 'Reset Password' : 'Welcome back 👋'}
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            {isResettingPassword
              ? 'Enter your new password below'
              : isForgotPassword
                ? 'Enter your email to receive a reset link'
                : 'Sign in to pick up where you left off'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isResettingPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter your new password" minLength={6} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm your new password" minLength={6} className="h-12" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="h-12" />
                </div>
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="6+ characters" minLength={6} className="h-12" />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (
                isResettingPassword ? 'Update Password'
                  : isForgotPassword ? 'Send Reset Link'
                    : 'Sign In'
              )}
            </Button>

            {!isForgotPassword && !isResettingPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-border hover:border-primary/40 hover:bg-primary/5"
                  onClick={async () => {
                    setLoading(true);
                    await signInWithGoogle();
                    setLoading(false);
                  }}
                  disabled={loading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}
          </form>

          <div className="text-center mt-6 space-y-2">
            {!isForgotPassword && !isResettingPassword && (
              <Button variant="link" onClick={toggleMode} className="text-sm text-muted-foreground hover:text-foreground">
                Don't have an account? Sign Up
              </Button>
            )}
            {!isResettingPassword && (
              <Button
                variant="link"
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="text-sm block w-full text-muted-foreground hover:text-foreground"
              >
                {isForgotPassword ? 'Back to Sign In' : 'Forgot your password?'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
