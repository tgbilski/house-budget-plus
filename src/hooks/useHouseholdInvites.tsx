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

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    // Show invites sent to this user's email; you may need to fetch the email from the user's profile
    const { data, error } = await supabase
      .from("household_invites")
      .select(`
        *,
        households!inner(name)
      `)
      .eq("status", "pending")
      .eq("invited_user_id", userId);
    setPendingInvites(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [userId]);

  const sendInvite = async (email: string, household_id: string) => {
    if (!userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .insert([{ 
        invited_email: email, 
        household_id, 
        status: "pending",
        invited_by: userId
      }]);
    await refresh();
    setLoading(false);
    return !error;
  };

  const acceptInvite = async (inviteId: string) => {
    if (!userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);
    await refresh();
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
    sendInvite,
    acceptInvite,
    declineInvite,
  };
}
