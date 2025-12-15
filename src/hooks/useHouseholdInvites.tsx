import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Invite = {
  id: string;
  invited_email: string;
  status: string;
  household_id: string;
  household_name?: string;
  invited_by: string;
  invited_user_id?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export function useHouseholdInvites(userId?: string) {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPendingInvites, setHasPendingInvites] = useState(false);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    
    // Get user's email first
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    
    console.log("Refreshing invites for userId:", userId, "email:", userEmail);
    
    // Show invites sent to this user's email or user_id
    const { data, error } = await supabase
      .from("household_invites")
      .select(`
        *,
        households!inner(name)
      `)
      .eq("status", "pending")
      .or(`invited_user_id.eq.${userId},invited_email.eq.${userEmail}`);
    
    console.log("Invites query result:", { data, error });
    setPendingInvites(data || []);
    setHasPendingInvites((data || []).length > 0);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [userId]);

  const sendInvite = async (email: string, household_id: string) => {
    if (!userId) return { success: false, error: "No user logged in" };
    setLoading(true);
    
    // First check if the email exists in profiles and get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("email", email)
      .single();
    
    if (profileError || !profileData) {
      setLoading(false);
      return { success: false, error: "This email does not exist in our records. Please ask them to sign up first." };
    }

    // Auto-accept: directly add the user as a household member
    const { error: memberError } = await supabase
      .from("household_members")
      .upsert(
        {
          household_id,
          user_id: profileData.user_id,
          role: "member",
          can_edit: true,
          can_view: true,
        },
        { onConflict: "household_id,user_id" }
      );

    setLoading(false);

    if (memberError) {
      console.error("Error adding household member:", memberError);
      return { success: false, error: "Failed to share household. This user may already have access." };
    }
    
    return { success: true };
  };

  const acceptInvite = async (inviteId: string) => {
    if (!userId) return false;
    setLoading(true);
    
    // Use the accept_household_invite function instead
    const { data, error } = await supabase
      .rpc('accept_household_invite', { _invite_id: inviteId });
    
    console.log("Accept invite result:", { data, error });
    
    if (!error) {
      await refresh();
      // Refresh the page to reload household context
      window.location.reload();
    }
    
    setLoading(false);
    return !error;
  };

  const declineInvite = async (inviteId: string) => {
    if (!userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .update({ status: "declined" })
      .eq("id", inviteId);
    await refresh();
    setLoading(false);
    return !error;
  };

  return {
    pendingInvites,
    loading,
    hasPendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
  };
}
