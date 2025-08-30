import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useHousehold } from '@/hooks/useHousehold';
import { useSubscription } from '@/hooks/useSubscription';
import { Edit, Mail, Plus, Check, X, Crown, Users } from 'lucide-react';

interface HouseholdSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HouseholdSettings: React.FC<HouseholdSettingsProps> = ({ open, onOpenChange }) => {
  const { 
    currentHousehold, 
    householdMembers, 
    pendingInvites, 
    isOriginator, 
    updateHousehold, 
    inviteMember, 
    acceptInvite, 
    declineInvite 
  } = useHousehold();
  const { subscribed } = useSubscription();

  const [newHouseholdName, setNewHouseholdName] = useState(currentHousehold?.name || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleUpdateHousehold = async () => {
    if (!newHouseholdName.trim() || !currentHousehold) return;
    setIsUpdating(true);
    await updateHousehold(currentHousehold.id, newHouseholdName);
    setIsUpdating(false);
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

  // Keep the dialog open on switch to avoid closing it
  const handleDialogChange = (newOpenState: boolean) => {
    if (!isUpdating && !isInviting) {
      onOpenChange(newOpenState);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Household Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Edit Household Name */}
          <div className="space-y-2">
            <Label htmlFor="household-name">Household Name</Label>
            <div className="flex space-x-2">
              <Input
                id="household-name"
                value={newHouseholdName}
                onChange={(e) => setNewHouseholdName(e.target.value)}
                disabled={!isOriginator}
              />
              {isOriginator && (
                <Button
                  onClick={handleUpdateHousehold}
                  disabled={!newHouseholdName.trim() || isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Invite Members */}
          <div className="space-y-2">
            <Label>Invite Members</Label>
            {!isOriginator || !subscribed ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-3">
                  <p className="text-sm text-amber-800">
                    {isOriginator ? 'Premium subscription is required to invite members.' : 'Only the household owner can invite members.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={handleInviteMember} disabled={!inviteEmail.trim() || isInviting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isInviting ? 'Sending...' : 'Invite'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Pending Invitations</h3>
              {pendingInvites.map((invite) => (
                <Card key={invite.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <p className="text-sm">Invited to household</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptInvite(invite.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => declineInvite(invite.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Household Members */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Household Members</h3>
            {householdMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <p>{member.profiles?.first_name || 'Unknown User'}</p>
                {member.role === 'originator' && <Crown className="h-4 w-4 text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
