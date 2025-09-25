import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHouseholdContext } from "../providers/HouseholdProvider";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { useHouseholdInvites } from "../hooks/useHouseholdInvites";
import { useHouseholdMembers } from "../hooks/useHouseholdMembers";
import {
  Home,
  Plus,
  Crown,
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

  const {
    currentHousehold,
    userHouseholds,
    isOriginator,
    loading: householdLoading,
    switchHousehold,
    createHousehold,
    renameHousehold,
  } = useHouseholdContext();

  const {
    pendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading: invitesLoading,
  } = useHouseholdInvites(user?.id);

  const {
    members: householdMembers,
    loading: membersLoading,
  } = useHouseholdMembers(currentHousehold?.id);

  const { subscribed } = useSubscription();

  const [isOpen, setIsOpen] = useState(open || false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    setIsCreating(true);
    try {
      const success = await createHousehold(newHouseholdName.trim());
      if (success) {
        setNewHouseholdName("");
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create household:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentHousehold?.id) return;
    setIsInviting(true);
    const ok = await sendInvite(inviteEmail.trim(), currentHousehold.id);
    if (ok) setInviteEmail("");
    setIsInviting(false);
  };

  const startRenaming = () => {
    setEditableName(currentHousehold?.name || "");
    setRenaming(true);
  };

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

  const anyLoading =
    householdLoading || invitesLoading || membersLoading || isCreating || isInviting || isRenaming;

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={onOpenChange || setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              <span>
                {householdLoading
                  ? "Loading..."
                  : currentHousehold?.name || "No Household"}
              </span>
              {isOriginator && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
            </div>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Household Management</DialogTitle>
        </DialogHeader>

        {anyLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        )}

        {!anyLoading && (
          <div className="space-y-6">
            {/* Always show Current Household card */}
            <div>
              <h3 className="font-medium mb-2">Current Household</h3>
              <Card className="border-primary/20">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    {!renaming ? (
                      <div className="flex items-center">
                        <span className="font-medium">
                          {currentHousehold?.name || "No Household selected"}
                        </span>
                        {isOriginator && currentHousehold && (
                          <Crown className="h-4 w-4 text-amber-500 ml-2" />
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editableName}
                          onChange={e => setEditableName(e.target.value)}
                          className="w-auto"
                          disabled={isRenaming || !currentHousehold}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={handleRename}
                          disabled={isRenaming || !currentHousehold}
                        >
                          {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRenaming(false)}
                          disabled={isRenaming}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {(householdMembers?.length ?? 0)} member
                      {(householdMembers?.length ?? 0) !== 1 ? "s" : ""}
                      {isOriginator && currentHousehold && " • You are the owner"}
                    </p>
                  </div>
                  {isOriginator && currentHousehold && !renaming && (
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

            {/* Switch Household */}
            {userHouseholds.length > 1 && (
              <div>
                <h3 className="font-medium mb-2">Switch Household</h3>
                <Select
                  value={currentHousehold?.id || ""}
                  onValueChange={id => {
                    switchHousehold(id);
                    if (onOpenChange) onOpenChange(false);
                    else setIsOpen(false);
                  }}
                  disabled={userHouseholds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select household" />
                  </SelectTrigger>
                  <SelectContent>
                    {userHouseholds.map(h => (
                      <SelectItem key={h.id} value={h.id} className="flex items-center">
                        <span>{h.name}</span>
                        {h.originator_id === user?.id && (
                          <Crown className="h-3 w-3 text-amber-500 ml-auto" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Invite Members */}
            {isOriginator && currentHousehold && subscribed && (
              <div>
                <h3 className="font-medium mb-2">Invite Member</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                    type="email"
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || isInviting}
                  >
                    {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                  </Button>
                </div>
              </div>
            )}

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Pending Invites</h3>
                <div className="space-y-2">
                  {pendingInvites.map(invite => (
                    <Card key={invite.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">
                          Invitation to join "{invite.household_name}"
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => acceptInvite(invite.id)}
                            disabled={invitesLoading}
                          >
                            {invitesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => declineInvite(invite.id)}
                            disabled={invitesLoading}
                          >
                            <X className="h-3 w-3" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="flex gap-2">
                  <Input
                    placeholder="New household name"
                    value={newHouseholdName}
                    onChange={e => setNewHouseholdName(e.target.value)}
                    disabled={isCreating}
                  />
                  <Button
                    onClick={handleCreateHousehold}
                    disabled={!newHouseholdName.trim() || isCreating}
                  >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
