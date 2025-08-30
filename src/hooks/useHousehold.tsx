import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Household {
  id: string;
  name: string;
  originator_id: string;
  created_at: string;
  updated_at: string;
}

interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'originator' | 'member';
  can_edit: boolean;
  can_view: boolean;
  joined_at: string;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface HouseholdInvite {
  id: string;
  household_id: string;
  invited_by: string;
  invited_email: string;
  invited_user_id?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
}

interface HouseholdContextType {
  currentHousehold: Household | null;
  userHouseholds: Household[];
  householdMembers: HouseholdMember[];
  pendingInvites: HouseholdInvite[];
  isOriginator: boolean;
  loading: boolean;
  switchHousehold: (householdId: string) => Promise<void>;
  createHousehold: (name: string) => Promise<boolean>;
  inviteMember: (email: string) => Promise<boolean>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  declineInvite: (inviteId: string) => Promise<boolean>;
  updateMemberPermissions: (memberId: string, canEdit: boolean, canView: boolean) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  leaveHousehold: () => Promise<boolean>;
  deleteHousehold: () => Promise<boolean>;
  refreshHouseholds: () => Promise<void>;
  updateHousehold: (householdId: string, newName: string) => Promise<boolean>; // Add the new function to the type
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<HouseholdInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { toast } = useToast();

  const isOriginator = currentHousehold?.originator_id === user?.id;

  useEffect(() => {
    if (user) {
      refreshHouseholds();
    }
  }, [user]);

  const refreshHouseholds = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's profile to find current household
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household_id')
        .eq('user_id', user.id)
        .single();

      // Get all households user belongs to
      const { data: memberData } = await supabase
        .from('household_members')
        .select(`
          household_id,
          households!inner(*)
        `)
        .eq('user_id', user.id);

      if (memberData) {
        const households = memberData.map(item => (item as any).households).filter(Boolean) as Household[];
        setUserHouseholds(households);

        // Set current household
        if (profile?.current_household_id) {
          const current = households.find(h => h.id === profile.current_household_id);
          if (current) {
            setCurrentHousehold(current);
            await loadHouseholdMembers(current.id);
          }
        } else if (households.length > 0) {
          setCurrentHousehold(households[0]);
          await loadHouseholdMembers(households[0].id);
        }
      }

      // Get pending invites
      const { data: invites } = await supabase
        .from('household_invites')
        .select('*')
        .or(`invited_email.eq.${user.email},invited_user_id.eq.${user.id}`)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      setPendingInvites(invites || []);
    } catch (error) {
      console.error('Error refreshing households:', error);
      toast({
        title: "Error",
        description: "Failed to load household data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHouseholdMembers = async (householdId: string) => {
    const { data } = await supabase
      .from('household_members')
      .select(`
        *,
        profiles!inner(email, first_name, last_name)
      `)
      .eq('household_id', householdId);

    setHouseholdMembers(data || []);
  };

  const switchHousehold = async (householdId: string) => {
    if (!user) return;

    try {
      // Update user's current household
      const { error } = await supabase
        .from('profiles')
        .update({ current_household_id: householdId })
        .eq('user_id', user.id);

      if (error) throw error;

      const household = userHouseholds.find(h => h.id === householdId);
      if (household) {
        setCurrentHousehold(household);
        await loadHouseholdMembers(householdId);
      }

      toast({
        title: "Household Switched",
        description: "Successfully switched to the selected household.",
      });
    } catch (error) {
      console.error('Error switching household:', error);
      toast({
        title: "Error",
        description: "Failed to switch household.",
        variant: "destructive",
      });
    }
  };

  const createHousehold = async (name: string): Promise<boolean> => {
    if (!user) return false;

    // Check if user is premium or if they have no households yet
    if (!subscribed && userHouseholds.length >= 1) {
      toast({
        title: "Premium Required",
        description: "You need a premium subscription to create additional households.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('households')
        .insert({
          name,
          originator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add user as originator member
      await supabase
        .from('household_members')
        .insert({
          household_id: data.id,
          user_id: user.id,
          role: 'originator',
        });

      await refreshHouseholds();
      
      toast({
        title: "Household Created",
        description: `Successfully created "${name}" household.`,
      });

      return true;
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: "Error",
        description: "Failed to create household.",
        variant: "destructive",
      });
      return false;
    }
  };

  const inviteMember = async (email: string): Promise<boolean> => {
    if (!user || !currentHousehold || !isOriginator) return false;

    if (!subscribed) {
      toast({
        title: "Premium Required",
        description: "You need a premium subscription to invite members.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('household_invites')
        .insert({
          household_id: currentHousehold.id,
          invited_by: user.id,
          invited_email: email,
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Successfully invited ${email} to your household.`,
      });

      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const acceptInvite = async (inviteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('accept_household_invite', {
        _invite_id: inviteId,
      });

      if (error) throw error;

      if (data) {
        await refreshHouseholds();
        toast({
          title: "Invitation Accepted",
          description: "Successfully joined the household.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid or expired invitation.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const declineInvite = async (inviteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
      
      toast({
        title: "Invitation Declined",
        description: "Invitation has been declined.",
      });

      return true;
    } catch (error) {
      console.error('Error declining invite:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateMemberPermissions = async (memberId: string, canEdit: boolean, canView: boolean): Promise<boolean> => {
    if (!isOriginator) return false;

    try {
      const { error } = await supabase
        .from('household_members')
        .update({ can_edit: canEdit, can_view: canView })
        .eq('id', memberId);

      if (error) throw error;

      if (currentHousehold) {
        await loadHouseholdMembers(currentHousehold.id);
      }

      toast({
        title: "Permissions Updated",
        description: "Member permissions have been updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    if (!isOriginator) return false;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      if (currentHousehold) {
        await loadHouseholdMembers(currentHousehold.id);
      }

      toast({
        title: "Member Removed",
        description: "Member has been removed from the household.",
      });

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveHousehold = async (): Promise<boolean> => {
    if (!user || !currentHousehold || isOriginator) return false;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', currentHousehold.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshHouseholds();

      toast({
        title: "Left Household",
        description: "You have left the household.",
      });

      return true;
    } catch (error) {
      console.error('Error leaving household:', error);
      toast({
        title: "Error",
        description: "Failed to leave household.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteHousehold = async (): Promise<boolean> => {
    if (!user || !currentHousehold || !isOriginator) return false;

    try {
      const { error } = await supabase
        .from('households')
        .delete()
        .eq('id', currentHousehold.id);

      if (error) throw error;

      await refreshHouseholds();

      toast({
        title: "Household Deleted",
        description: "Household has been deleted.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting household:', error);
      toast({
        title: "Error",
        description: "Failed to delete household.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateHousehold = useCallback(async (householdId: string, newName: string) => {
    if (!user || !isOriginator) {
      toast({
        title: "Permission Denied",
        description: "You must be the household owner to edit its name.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('households')
        .update({ name: newName })
        .eq('id', householdId)
        .select();

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setCurrentHousehold(data[0]);
        setUserHouseholds(prevHouseholds => 
          prevHouseholds.map(h => h.id === householdId ? { ...h, name: newName } : h)
        );
      }
      
      toast({
        title: "Household Updated",
        description: `Household name changed to "${newName}".`,
      });

      return true;
    } catch (error) {
      console.error('Error updating household:', error);
      toast({
        title: "Error",
        description: "Failed to update household name.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isOriginator, toast]);

  return (
    <HouseholdContext.Provider
      value={{
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
        updateMemberPermissions,
        removeMember,
        leaveHousehold,
        deleteHousehold,
        refreshHouseholds,
        updateHousehold, // <-- Return the new function here
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}
