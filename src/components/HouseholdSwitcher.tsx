import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHousehold } from '@/hooks/useHousehold';
import { useSubscription } from '@/hooks/useSubscription';
import { Home, Plus, Users, Crown, Mail, Check, X } from 'lucide-react';

interface HouseholdSwitcherProps {
  className?: string;
}

export function HouseholdSwitcher({ className }: HouseholdSwitcherProps) {
  const {
    currentHousehold,
    userHouseholds,
    householdMembers,
    pendingInvites,
    isOriginator,
    loading,
    switchHousehold,
    createHousehold,
    inviteMember,
    acceptInvite,
    declineInvite,
  } = useHousehold();
  const { subscribed } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    
    setIsCreating(true);
    const success = await createHousehold(newHouseholdName);
    if (success) {
      setNewHouseholdName('');
    }
    setIsCreating(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    const success = await inviteMember(inviteEmail);
    if (success) {
      setInviteEmail('');
    }
    setIsInviting(false);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Home className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Home className="h-4 w-4 mr-2" />
          {currentHousehold?.name || 'No Household'}
          {isOriginator && <Crown className="h-3 w-3 ml-1" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Household Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Household */}
          {currentHousehold && (
            <div>
              <h3 className="font-medium mb-2">Current Household</h3>
              <Card className="border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentHousehold.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {householdMembers.length} member{householdMembers.length !== 1 ? 's' : ''}
                        {isOriginator && ' • You are the owner'}
                      </p>
                    </div>
                    {isOriginator && <Crown className="h-4 w-4 text-amber-500" />}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Switch Household */}
          {userHouseholds.length > 1 && (
            <div>
              <h3 className="font-medium mb-2">Switch Household</h3>
              <Select
                value={currentHousehold?.id || ''}
                onValueChange={switchHousehold}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select household" />
                </SelectTrigger>
                <SelectContent>
                  {userHouseholds.map((household) => (
                    <SelectItem key={household.id} value={household.id}>
                      <div className="flex items-center gap-2">
                        <span>{household.name}</span>
                        {household.originator_id === currentHousehold?.originator_id && (
                          <Crown className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Create New Household */}
          <div>
            <h3 className="font-medium mb-2">Create New Household</h3>
            {!subscribed && userHouseholds.length >= 1 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-3">
                  <p className="text-sm text-amber-800">
                    Premium subscription required to create additional households.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Household name"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                />
                <Button
                  onClick={handleCreateHousehold}
                  disabled={!newHouseholdName.trim() || isCreating}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {isCreating ? 'Creating...' : 'Create Household'}
                </Button>
              </div>
            )}
          </div>

          {/* Invite Members */}
          {isOriginator && currentHousehold && (
            <div>
              <h3 className="font-medium mb-2">Invite Members</h3>
              {!subscribed ? (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-3">
                    <p className="text-sm text-amber-800">
                      Premium subscription required to invite members.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || isInviting}
                    className="w-full"
                    size="sm"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Pending Invitations</h3>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <Card key={invite.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                      <p className="text-sm mb-2">
                        Invited to household
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptInvite(invite.id)}
                          className="flex-1"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineInvite(invite.id)}
                          className="flex-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Household Members */}
          {householdMembers.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Members</h3>
              <div className="space-y-2">
                {householdMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">
                        {member.profiles?.first_name && member.profiles?.last_name
                          ? `${member.profiles.first_name} ${member.profiles.last_name}`
                          : member.profiles?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === 'originator' ? 'Owner' : 'Member'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {member.role === 'originator' && <Crown className="h-3 w-3 text-amber-500" />}
                      {member.can_edit && <Badge variant="secondary" className="text-xs">Edit</Badge>}
                      {member.can_view && <Badge variant="outline" className="text-xs">View</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}