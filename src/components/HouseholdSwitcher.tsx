import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Crown } from 'lucide-react';
import { useHousehold } from '@/hooks/useHousehold';

interface HouseholdSwitcherProps {
  className?: string;
  onClick: () => void;
}

export function HouseholdSwitcher({ className, onClick }: HouseholdSwitcherProps) {
  const {
    currentHousehold,
    isOriginator,
    loading,
  } = useHousehold();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Home className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" className={className} onClick={onClick}>
      <Home className="h-4 w-4 mr-2" />
      {currentHousehold?.name || 'No Household'}
      {isOriginator && <Crown className="h-3 w-3 ml-1" />}
    </Button>
  );
}
