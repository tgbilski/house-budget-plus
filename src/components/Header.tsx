import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Monthly Budget', href: '/' },
    { name: 'Compare Vendors', href: '/compare-prices' },
    { name: 'Takeout', href: '/takeout' },
    { name: 'Vacation', href: '/vacation' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <header className="w-full bg-muted/30 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/5377daa4-3f84-4748-a91b-081403394030.png" 
            alt="House Budget Calculator"
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-xs font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name.split(' ')[0]}
            </Link>
          ))}
        </nav>

        {/* Auth Button */}
        <div className="flex items-center">
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link to="/auth">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;