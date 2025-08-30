import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust this path if needed

type Invite = {
  id: string;
  email: string;
  status: string;
  // ...other fields
};

export function useHouseholdInvites() {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    // Get pending invites for the current user (adjust as needed)
    const { data, error } = await supabase
      .from("household_invites")
      .select("*")
      .eq("status", "pending");
    setPendingInvites(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const sendInvite = async (email: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("household_invites")
      .insert([{ email, status: "pending" }]);
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
