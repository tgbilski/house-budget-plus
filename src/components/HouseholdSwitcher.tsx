import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHouseholdContext } from "@/providers/HouseholdProvider";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useHouseholdInvites } from "@/hooks/useHouseholdInvites";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import {
  Home,
  Plus,
  Users,
  Crown,
  Mail,
  Check,
  X,
  Pencil,
  Loader2,
} from "lucide-react";

interface HouseholdSwitcherProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HouseholdSwitcher({ className, open, onOpenChange }: HouseholdSwitcherProps) {
  const { user } = useAuth();
  
  // Household switching, listing, creating, renaming
  const {
    currentHousehold,
    userHouseholds,
    isOriginator,
    loading: householdLoading,
    switchHousehold,
    createHousehold,
    renameHousehold,
  } = useHouseholdContext();

  // Invites
  const {
    pendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading: invitesLoading,
  } = useHouseholdInvites(user?.id);

  // Members
  const {
    members: householdMembers,
    loading: membersLoading,
  } = useHouseholdMembers(currentHousehold?.id);

  // Subscription
  const { subscribed } = useSubscription();

  // UI State
  const [isOpen, setIsOpen] = useState(open || false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Handle household creation
  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    setIsCreating(true);
    const ok = await createHousehold(newHouseholdName.trim());
    if (ok) {
      setNewHouseholdName("");
      // Close the dialog
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
    }
    setIsCreating(false);
  };

  // Handle member invite
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentHousehold?.id) return;
    setIsInviting(true);
    const ok = await sendInvite(inviteEmail.trim(), currentHousehold.id);
    if (ok) setInviteEmail("");
    setIsInviting(false);
  };

  // Handle start renaming
  const startRenaming = () => {
    setEditableName(currentHousehold?.name || "");
    setRenaming(true);
  };

  // Handle save rename
  const handleRename = async () => {
    if (
      !editableName.trim() ||
      editableName.trim() === currentHousehold?.name
    ) {
      setRenaming(false);
      return;
    }
    setIsRenaming(true);
    const ok = await renameHousehold(editableName.trim());
    setIsRenaming(false);
    if (ok) {
      setRenaming(false);
    }
  };

  // Loading handling
  const anyLoading =
    householdLoading || invitesLoading || membersLoading || isCreating || isInviting || isRenaming;

  // Dialog stays open if explicitly open, not on focus loss
  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={onOpenChange || setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              <span>{currentHousehold?.name || "No Household"}</span>
              {isOriginator && <Crown className="h-3 w-3 ml-1" />}
            </div>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Household Management</DialogTitle>
        </DialogHeader>

        {/* Loading spinner */}
        {anyLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        )}

        {!anyLoading && (
          <div className="space-y-6">
            {/* Current Household & Rename */}
            {currentHousehold && (
              <div>
                <h3 className="font-medium mb-2">Current Household</h3>
                <Card className="border-primary/20">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      {!renaming ? (
                        <div className="flex items-center">
                          <span className="font-medium">{currentHousehold.name}</span>
                          {isOriginator && (
                            <Crown className="h-4 w-4 text-amber-500 ml-2" />
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editableName}
                            onChange={e => setEditableName(e.target.value)}
                            className="w-auto"
                            disabled={isRenaming}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRename}
                            disabled={isRenaming}
                          >
                            {isRenaming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRenaming(false)}
                            disabled={isRenaming}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {householdMembers.length} member
                        {householdMembers.length !== 1 ? "s" : ""}
                        {isOriginator && " • You are the owner"}
                      </p>
                    </div>
                    {isOriginator && !renaming && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2"
                        onClick={startRenaming}
                        aria-label="Rename household"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Switch Household */}
            {userHouseholds.length > 1 && (
              <div>
                <h3 className="font-medium mb-2">Switch Household</h3>
                <Select
                  value={currentHousehold?.id || ""}
                  onValueChange={switchHousehold}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select household" />
                  </SelectTrigger>
                  <SelectContent>
                    {userHouseholds.map(h => (
                      <SelectItem key={h.id} value={h.id}>
                       <span>{h.name}</span>
                        {h.originator_id === user?.id && (
                          <Crown className="h-3 w-3 text-amber-500 ml-1" />
                        )}
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
                    onChange={e => setNewHouseholdName(e.target.value)}
                    disabled={isCreating}
                  />
                  <Button
                    onClick={handleCreateHousehold}
                    disabled={!newHouseholdName.trim() || isCreating}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {isCreating ? "Creating..." : "Create Household"}
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
                      onChange={e => setInviteEmail(e.target.value)}
                      disabled={isInviting}
                    />
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                      className="w-full"
                      size="sm"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {isInviting ? "Sending..." : "Send Invite"}
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
                  {pendingInvites.map(invite => (
                    <Card key={invite.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-3">
                        <p className="text-sm mb-2">
                          Invited to household <span className="font-semibold">{(invite as any).households?.name || 'Unknown Household'}</span>
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
                  {householdMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {member.profiles?.first_name && member.profiles?.last_name
                            ? `${member.profiles.first_name} ${member.profiles.last_name}`
                            : member.profiles?.email || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.role === "originator" ? "Owner" : "Member"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {member.role === "originator" && (
                          <Crown className="h-3 w-3 text-amber-500" />
                        )}
                        {member.can_edit && (
                          <Badge variant="secondary" className="text-xs">
                            Edit
                          </Badge>
                        )}
                        {member.can_view && (
                          <Badge variant="outline" className="text-xs">
                            View
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
