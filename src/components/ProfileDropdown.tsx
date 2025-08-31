import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Crown, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import ProfileSettings from './ProfileSettings';
import { HouseholdSwitcher } from './HouseholdSwitcher';

const ProfileDropdown: React.FC = () => {
  const { signOut } = useAuth();
  const { profile, getInitials, truncateEmail } = useProfile();
  const { subscribed, subscriptionTier } = useSubscription();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);

  const displayEmail = profile?.email || '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'My Account'
                }
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {truncateEmail(displayEmail)}
              </p>
              {/* Subscription Status Badge */}
              <div className="flex items-center gap-1">
                {subscribed ? (
                  <Badge variant="default" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    {subscriptionTier || 'Premium'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Free Plan
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setHouseholdOpen(true)}>
            <Home className="mr-2 h-4 w-4" />
            <span>Household Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ProfileSettings 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      
      <HouseholdSwitcher 
        open={householdOpen} 
        onOpenChange={setHouseholdOpen} 
      />
    </>
  );
};

export default ProfileDropdown;