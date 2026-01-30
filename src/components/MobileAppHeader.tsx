import { HouseholdSwitcher } from './HouseholdSwitcher';
import { YearSelector } from './YearSelector';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MobileAppHeader = () => {
  const { signOut } = useAuth();

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <HouseholdSwitcher />
        <div className="flex items-center gap-2">
          <YearSelector />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
            className="h-9 w-9 touch-manipulation"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
