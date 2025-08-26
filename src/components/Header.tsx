import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-muted border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between min-h-[64px]">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/5377daa4-3f84-4748-a91b-081403394030.png" 
              alt="House Budget Calculator"
              className="h-8 w-auto cursor-pointer"
            />
          </Link>
        </div>

        {/* Auth Button */}
        <div className="flex items-center">
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link to="/auth">
              <Button size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;