import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileDropdown from './ProfileDropdown';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';


const Header: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-gradient-to-r from-white via-blue-50/30 to-emerald-50/30 border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm">
      <div className="w-full px-4 md:px-6 py-1.5 md:py-2">
        <div className="flex items-center justify-between min-h-[40px] md:min-h-[48px]">
          {/* Brand with Logo and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <SidebarTrigger className="md:inline-flex" />
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              {!isMobile && (
                <h1 className="text-xl font-semibold text-gray-900">
                  House Budget Calculator
                </h1>
              )}
            </Link>
          </div>

          {/* Search and Auth */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
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