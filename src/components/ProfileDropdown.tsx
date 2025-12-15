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
import { useHouseholdInvites } from '@/hooks/useHouseholdInvites';
import { Badge } from '@/components/ui/badge';
import ProfileSettings from './ProfileSettings';
import { HouseholdSwitcher } from './HouseholdSwitcher';

const ProfileDropdown: React.FC = () => {
  const { signOut, user } = useAuth();
  const { profile, getInitials, truncateEmail } = useProfile();
  const { subscribed, subscriptionTier } = useSubscription();
  const { hasPendingInvites, pendingInvites, acceptInvite, declineInvite, loading: invitesLoading } = useHouseholdInvites(user?.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);

  const displayEmail = profile?.email || '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {hasPendingInvites && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-background animate-pulse" />
              )}
            </div>
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
          {pendingInvites && pendingInvites.length > 0 && (
            <>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default focus:bg-transparent">
                <span className="text-xs font-semibold text-primary">New household invitations</span>
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="w-full rounded-md border border-primary/30 bg-primary/5 px-2 py-2 text-xs flex flex-col gap-1">
                    <span className="font-medium">
                      You've been invited to join "{(invite as any).households?.name || 'a household'}"
                    </span>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        className="h-7 px-2 flex-1 text-xs"
                        onClick={() => acceptInvite(invite.id)}
                        disabled={invitesLoading}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 flex-1 text-xs"
                        onClick={() => declineInvite(invite.id)}
                        disabled={invitesLoading}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setHouseholdOpen(true)}>
            <Home className="mr-2 h-4 w-4" />
            <span>Household Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center w-full">
              <div className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </div>
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