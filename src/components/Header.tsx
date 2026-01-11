import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileDropdown from './ProfileDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-card border-b-[4px] border-stroke sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 md:px-6 py-1.5 md:py-2">
        <div className="flex items-center justify-between min-h-[40px] md:min-h-[48px]">
          {/* Brand with Logo */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-8 w-8" />
            )}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <h1 className="hidden sm:block text-lg md:text-xl font-semibold text-foreground">
                House Budget Calculator
              </h1>
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <ProfileDropdown />
            ) : (
              <Button asChild size="sm">
                <Link to="/auth?mode=signin" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;