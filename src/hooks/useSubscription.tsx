import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  aiQueriesCount: number;
  aiQueriesRemaining: number;
  aiQueriesResetDate: string | null;
  loading: boolean;
  checkoutLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (plan?: 'monthly' | 'annual') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [aiQueriesCount, setAiQueriesCount] = useState(0);
  const [aiQueriesRemaining, setAiQueriesRemaining] = useState(10);
  const [aiQueriesResetDate, setAiQueriesResetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || null);
      setSubscriptionEnd(data.subscription_end || null);
      setAiQueriesCount(data.ai_queries_count || 0);
      setAiQueriesRemaining(Math.max(0, 25 - (data.ai_queries_count || 0)));
      setAiQueriesResetDate(data.ai_queries_reset_date || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (plan: 'monthly' | 'annual' = 'monthly') => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckoutLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        setCheckoutLoading(false);
        throw error;
      }

      if (data.url) {
        // Keep loading state true as we redirect
        window.location.href = data.url;
      } else {
        setCheckoutLoading(false);
      }
    } catch (error) {
      setCheckoutLoading(false);
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Opening customer portal...', { 
        userId: user.id, 
        hasSession: !!session,
        hasToken: !!session.access_token 
      });
      
      const response = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Full response object:', response);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);

      if (response.error) {
        console.error('Portal invocation error:', {
          message: response.error.message,
          status: response.error.status,
          name: response.error.name,
          context: response.error.context
        });
        throw new Error(response.error.message || 'Failed to connect to subscription portal');
      }

      if (response.data?.url) {
        console.log('Redirecting to Stripe portal:', response.data.url);
        // Use window.open with _self to ensure redirect isn't blocked
        const redirected = window.open(response.data.url, '_self');
        if (!redirected) {
          // Fallback to location.href if window.open is blocked
          window.location.href = response.data.url;
        }
        return; // Exit function immediately after redirect
      } else {
        console.error('No URL in response data:', response.data);
        throw new Error('No portal URL returned from server');
      }
    } catch (error) {
      console.error('Caught error in openCustomerPortal:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        subscriptionTier,
        subscriptionEnd,
        aiQueriesCount,
        aiQueriesRemaining,
        aiQueriesResetDate,
        loading,
        checkoutLoading,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}