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
import { ArrowLeft, Sparkles, Shield, Zap, PiggyBank, TrendingUp, Gift } from 'lucide-react';
import mascotIcon from '@/assets/calculator-mascot.png';

const Auth: React.FC = () => {
  const location = useLocation();
  const isSignUpRoute = location.pathname === '/signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpRoute);
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

  const valueProps = [
    { icon: PiggyBank, label: 'Unlimited budget calculators', highlight: 'Free forever' },
    { icon: TrendingUp, label: 'Savings goals with visual tracking', highlight: null },
    { icon: Gift, label: 'Gift list planner & expense tracker', highlight: null },
    { icon: Sparkles, label: 'AI-powered money insights', highlight: 'Premium' },
    { icon: Shield, label: 'Your data synced & secure', highlight: null },
    { icon: Zap, label: 'Vacation & vendor comparison tools', highlight: null },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 text-foreground hover:bg-foreground/10"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Left / Top section — Value prop hero */}
      {isSignUp && !verificationSent && (
        <div className="relative lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground p-6 pt-16 pb-8 lg:p-12 lg:flex lg:flex-col lg:justify-center overflow-hidden">
          {/* Decorative swoosh shapes */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="absolute -bottom-10 -left-10 w-80 h-80" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="100" fill="white" />
            </svg>
            <svg className="absolute -top-20 -right-20 w-96 h-96" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="100" fill="white" />
            </svg>
          </div>

          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <img src={mascotIcon} alt="Budget mascot" className="w-12 h-12 lg:w-16 lg:h-16 object-contain drop-shadow-lg" />
              <span className="text-xs lg:text-sm font-bold uppercase tracking-widest opacity-80">House Budget+</span>
            </div>
            
            <h1 className="text-2xl lg:text-4xl font-black leading-tight mb-2 lg:mb-4">
              Adulting your money<br className="hidden lg:block" /> doesn't have to suck 💸
            </h1>
            <p className="text-sm lg:text-base opacity-90 mb-6 lg:mb-8 leading-relaxed">
              Join 189+ households already crushing their budgets. It's free, it's fast, and your wallet will thank you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {valueProps.map((prop, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-4">
                  <prop.icon className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-90" />
                  <div>
                    <p className="text-sm font-medium leading-tight">{prop.label}</p>
                    {prop.highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5 mt-1 inline-block">
                        {prop.highlight}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right / Bottom section — Auth form */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 ${isSignUp && !verificationSent ? '' : 'mx-auto max-w-lg'}`}>
        <div className="w-full max-w-md">
          {verificationSent ? (
            <div className="text-center space-y-4">
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
          ) : (
            <>
              {/* Login-only mascot */}
              {!isSignUp && (
                <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                  <img src={mascotIcon} alt="Budget mascot" className="w-12 h-12 object-contain" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">House Budget+</span>
                </div>
              )}

              <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-1">
                {isResettingPassword
                  ? 'Set New Password'
                  : isForgotPassword
                    ? 'Reset Password'
                    : isSignUp
                      ? "Let's get you set up"
                      : 'Welcome back 👋'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isResettingPassword
                  ? 'Enter your new password below'
                  : isForgotPassword
                    ? 'Enter your email to receive a reset link'
                    : isSignUp
                      ? 'Takes 30 seconds. No credit card needed.'
                      : 'Sign in to pick up where you left off'}
              </p>

              {/* Google button first for signup (higher conversion) */}
              {!isForgotPassword && !isResettingPassword && isSignUp && (
                <>
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
                </>
              )}

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
                        : isSignUp ? "Let's Go 🚀"
                          : 'Sign In'
                  )}
                </Button>

                {/* Google button for login (after form) */}
                {!isForgotPassword && !isResettingPassword && !isSignUp && (
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
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Sign Up"}
                  </Button>
                )}
                {!isSignUp && !isResettingPassword && (
                  <Button
                    variant="link"
                    onClick={() => setIsForgotPassword(!isForgotPassword)}
                    className="text-sm block w-full text-muted-foreground hover:text-foreground"
                  >
                    {isForgotPassword ? 'Back to Sign In' : 'Forgot your password?'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
