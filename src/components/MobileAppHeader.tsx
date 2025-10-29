import { HouseholdSwitcher } from './HouseholdSwitcher';
import { YearSelector } from './YearSelector';

export const MobileAppHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <HouseholdSwitcher />
        <YearSelector />
      </div>
    </header>
  );
};
