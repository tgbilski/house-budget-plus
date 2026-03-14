import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileSignupBar: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);

  // Only show on mobile for guests
  if (!isMobile || user || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-fade-in">
      <div className="bg-primary border-t-2 border-primary-foreground/20 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between gap-2">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="font-bold text-sm h-9 flex-1 touch-manipulation"
          >
            <Link to="/signup">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Sign Up Free
            </Link>
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-primary-foreground/60 hover:text-primary-foreground p-1.5 touch-manipulation"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
