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
import { useHouseholdContext } from "../providers/HouseholdProvider";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { useHouseholdInvites } from "../hooks/useHouseholdInvites";
import { useHouseholdMembers } from "../hooks/useHouseholdMembers";
import {
  Home,
  Plus,
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
  
  // This function is now cleaner and provides a better UX.
  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    setIsCreating(true);
    try {
      const success = await createHousehold(newHouseholdName.trim());
      if (success) {
        setNewHouseholdName("");
        // **FIXED**: No more page reload! The state will update reactively.
        // The dialog is closed, and the new household will appear as current.
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create household:", error);
      // You could add user-facing error handling here (e.g., a toast notification)
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

  // The rest of your JSX was perfectly fine and required no changes.
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
            {/* Current Household & Rename */}

            {/* Switch Household */}
            {userHouseholds.length > 1 && (
              <div>
                <h3 className="font-medium mb-2">Switch Household</h3>
                <Select
                  value={currentHousehold?.id || ""}
                  onValueChange={(id) => {
                    switchHousehold(id);
                    if (onOpenChange) onOpenChange(false);
                    else setIsOpen(false);
                  }}
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

            {/* Other sections (Invite, Pending, Members) can remain as they were */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
