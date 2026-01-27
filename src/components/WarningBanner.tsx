import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export const WarningBanner: React.FC = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-card border-[3px] border-stroke shadow-cartoon">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-foreground font-medium">
            Bruh. Save your progress.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up for free to keep your data and access it from any device.
          </p>
        </div>
        <Link to="/auth">
          <Button className="gap-2 bg-teal hover:bg-teal/90 text-teal-foreground whitespace-nowrap">
            <UserPlus className="h-4 w-4" />
            Sign Up Free
          </Button>
        </Link>
      </div>
    </div>
  );
};
