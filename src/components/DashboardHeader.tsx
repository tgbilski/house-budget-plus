import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';
import calculatorMascot from '@/assets/calculator-mascot.png';

const DashboardHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-primary border-b-[3px] border-stroke sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 py-2">
        <div className="flex items-center justify-between min-h-[40px]">
          <Link
            to="/"
            className="flex items-center gap-2 touch-manipulation transition-opacity [@media(hover:hover)]:hover:opacity-80"
          >
            <img 
              src={calculatorMascot} 
              alt="House Budget Calculator" 
              className="h-8 w-8 object-contain drop-shadow-[2px_2px_0px_hsl(var(--stroke))]"
            />
            <span className="hidden sm:block text-lg font-bold text-primary-foreground tracking-wide">
              House Budget Calculator
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <ProfileDropdown />
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/login" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
