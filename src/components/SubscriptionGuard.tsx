import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { isNativeApp } from '@/utils/capacitor';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const isMobileApp = isNativeApp();

  useEffect(() => {
    // Only enforce subscription check for mobile app
    if (!isMobileApp) return;
    
    // If not loading and not authenticated, redirect to auth
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // If not loading and not subscribed, redirect to auth with message
    if (!authLoading && !subLoading && user && !subscribed) {
      navigate('/auth');
    }
  }, [user, subscribed, authLoading, subLoading, navigate, isMobileApp]);

  // Show loading while checking auth and subscription
  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render children if mobile app and not subscribed
  if (isMobileApp && (!user || !subscribed)) {
    return null;
  }

  return <>{children}</>;
};
