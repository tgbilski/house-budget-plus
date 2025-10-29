import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, Calculator, Target, Store, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Mic, label: 'Expenses', path: '/expenses' },
  { icon: Calculator, label: 'Budget', path: '/monthly-budget' },
  { icon: Target, label: 'Goals', path: '/savings' },
  { icon: Store, label: 'Vendors', path: '/compare-vendors' },
  { icon: Bot, label: 'AI Chat', path: '/ai-insights' },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
