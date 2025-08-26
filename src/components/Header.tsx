import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileDropdown from './ProfileDropdown';
const logoIcon = '/lovable-uploads/f2d56e66-518b-4a91-8172-551b1a54ef32.png';

const Header: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-muted border-b border-border sticky top-0 z-50">
      <div className="w-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between min-h-[48px] md:min-h-[56px]">
        {/* Brand with Logo and Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src={logoIcon} 
              alt="House Budget Calculator"
              className="h-7 w-7 md:h-8 md:w-8 rounded"
            />
            {!isMobile && (
              <h1 className="text-xl font-semibold text-primary">
                House Budget Calculator
              </h1>
            )}
          </Link>
          {isMobile && <SidebarTrigger />}
        </div>

        {/* Auth Button */}
        <div className="flex items-center">
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link to="/auth">
              <Button size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;