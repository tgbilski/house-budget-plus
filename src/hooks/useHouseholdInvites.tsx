import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Invite = {
  id: string;
  email: string;
  status: string;
  household_id: string;
  // ...other fields
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
      .select("*")
      .eq("status", "pending")
      .eq("user_id", userId); // or .eq("email", userEmail)
    setPendingInvites(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [userId]);

  const sendInvite = async (email: string, household_id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .insert([{ email, household_id, status: "pending" }]);
    await refresh();
    return !error;
  };

  const acceptInvite = async (inviteId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);
    await refresh();
    return !error;
  };

  const declineInvite = async (inviteId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .update({ status: "declined" })
      .eq("id", inviteId);
    await refresh();
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
