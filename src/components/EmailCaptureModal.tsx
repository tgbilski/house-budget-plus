import React, { useState, useEffect } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/utils/analytics';

export const EmailCaptureModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) return;

    const dismissed = sessionStorage.getItem('email_capture_dismissed');
    const alreadyCaptured = localStorage.getItem('email_captured');
    if (dismissed || alreadyCaptured) return;

    // Show after 45 seconds or after scrolling 60% of page
    const timer = setTimeout(() => {
      setIsOpen(true);
      trackEvent('email_capture_shown', { trigger: 'timer' });
    }, 45000);

    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.6) {
        setIsOpen(true);
        trackEvent('email_capture_shown', { trigger: 'scroll' });
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('email_capture_dismissed', 'true');
    trackEvent('email_capture_dismissed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      // Store email in subscribers table (without subscription)
      const { error } = await supabase.from('subscribers').insert({
        email,
        subscribed: false,
      });

      if (error && !error.message.includes('duplicate')) throw error;

      setSubmitted(true);
      localStorage.setItem('email_captured', 'true');
      trackEvent('email_capture_submitted', { email_domain: email.split('@')[1] });
      toast({
        title: '🎉 You\'re in!',
        description: 'Check your inbox for your free budget template.',
      });
    } catch (err) {
      console.error('Email capture error:', err);
      toast({
        title: 'Oops!',
        description: 'Something went wrong. Try again?',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative bg-card border-[3px] border-stroke rounded-xl shadow-cartoon p-6 max-w-md w-full animate-fade-in z-10">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-foreground mb-2">You're awesome!</h3>
            <p className="text-sm text-muted-foreground">
              Your free budget template is on the way. In the meantime, why not create an account to save your budget?
            </p>
            <Button
              className="mt-4 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold"
              onClick={() => {
                handleDismiss();
                window.location.href = '/signup';
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Free Account
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  Free Budget Template 📊
                </h3>
                <p className="text-xs text-muted-foreground">
                  Used by 1,000+ families
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Get our plug-and-play monthly budget template — the same system our users love. Drop your email and it's yours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-border focus:border-primary"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-cartoon"
              >
                {loading ? 'Sending...' : 'Send Me the Template 🚀'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-3">
              No spam, ever. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
