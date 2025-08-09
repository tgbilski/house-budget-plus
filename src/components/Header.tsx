import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Monthly Budget', href: '/budget' },
    { name: 'Compare Vendors', href: '/compare-prices' },
    { name: 'Takeout', href: '/takeout' },
    { name: 'Vacation', href: '/vacation' },
    { name: 'Gifts', href: '/gifts' },
    { name: 'AI Insights', href: '/ai-insights' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <header className="w-full bg-muted border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between min-h-[64px]">
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

        {/* Mobile Navigation - Hamburger Menu */}
        {isMobile && (
          <div className="flex items-center space-x-2">
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link to="/auth">
                <Button size="sm" className="flex items-center">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-base font-medium transition-colors hover:text-primary p-2 rounded-md ${
                        isActive(item.href)
                          ? 'text-primary bg-muted'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Desktop Auth Button */}
        {!isMobile && (
          <div className="flex items-center">
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link to="/auth">
                <Button size="sm" className="flex items-center">
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;