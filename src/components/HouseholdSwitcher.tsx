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
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Home,
  Plus,
  Crown,
  Check,
  X,
  Pencil,
  Loader2,
  Trash2,
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
    deleteHousehold,
  } = useHouseholdContext();

  const {
    pendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading: invitesLoading,
  } = useHouseholdInvites(user?.id);
  
  const [inviteError, setInviteError] = useState("");

  const {
    members: householdMembers,
    loading: membersLoading,
    refresh: refreshMembers,
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
  const [isDeleting, setIsDeleting] = useState(false);

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
    setInviteError("");
    
    const result = await sendInvite(inviteEmail.trim(), currentHousehold.id);
    
    if (result.success) {
      setInviteEmail("");
      setInviteError("");
    } else {
      setInviteError(result.error || "Failed to send invite");
    }
    
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

  const handleDeleteHousehold = async () => {
    if (!currentHousehold) return;
    setIsDeleting(true);
    const success = await deleteHousehold(currentHousehold.id);
    setIsDeleting(false);
    if (success) {
      window.location.reload();
    }
  };

  const anyLoading =
    householdLoading || invitesLoading || membersLoading || isCreating || isInviting || isRenaming || isDeleting;

  const handleRemoveMember = async (memberUserId: string) => {
    if (!currentHousehold?.id || !isOriginator) return;
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", currentHousehold.id)
        .eq("user_id", memberUserId);
      if (error) {
        console.error("Error removing household member:", error);
        return;
      }
      await refreshMembers();
    } catch (error) {
      console.error("Unexpected error removing household member:", error);
    }
  };

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
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={startRenaming}
                        aria-label="Rename household"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label="Delete household"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Household</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{currentHousehold.name}"? This will remove all members and cannot be undone. Your data associated with this household will also be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteHousehold}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={isDeleting}
                            >
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                  onValueChange={async (id) => {
                    await switchHousehold(id);
                    if (onOpenChange) onOpenChange(false);
                    else setIsOpen(false);
                    // Reload to refresh all data for the new household
                    window.location.reload();
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
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={e => {
                        setInviteEmail(e.target.value);
                        setInviteError("");
                      }}
                      disabled={isInviting}
                      type="email"
                    />
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                    >
                      {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Invited users are added immediately to this household and can view and edit shared data.
                  </p>
                  {inviteError && (
                    <p className="text-sm text-destructive">{inviteError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Household Members List */}
            {currentHousehold && (
              <div>
                <h3 className="font-medium mb-2">Household Members</h3>
                <Card className="border-muted">
                  <CardContent className="p-3 space-y-2">
                    {householdMembers.length === 0 && (
                      <p className="text-sm text-muted-foreground">No members yet.</p>
                    )}
                    {householdMembers.map((member) => {
                      const isCurrentUser = member.user_id === user?.id;
                      const displayName = member.profiles?.first_name || member.profiles?.last_name
                        ? `${member.profiles?.first_name ?? ""} ${member.profiles?.last_name ?? ""}`.trim()
                        : member.profiles?.email || "Member";

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {displayName} {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {member.role || "member"}
                            </span>
                          </div>
                          {isOriginator && !isCurrentUser && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive border-destructive/40 hover:bg-destructive/5"
                              onClick={() => handleRemoveMember(member.user_id)}
                              disabled={anyLoading}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pending Invites - Show prominently with alert styling */}
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-primary">New Household Invitations!</h3>
                <div className="space-y-2">
                  {pendingInvites.map(invite => (
                    <Card key={invite.id} className="border-primary bg-primary/5">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold mb-1">
                          You've been invited to join:
                        </p>
                        <p className="text-base font-bold mb-3">
                          "{(invite as any).households?.name || 'a household'}"
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptInvite(invite.id)}
                            disabled={invitesLoading}
                            className="flex-1"
                          >
                            {invitesLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => declineInvite(invite.id)}
                            disabled={invitesLoading}
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
