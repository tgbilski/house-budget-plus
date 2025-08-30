
import { useState, useEffect } from "react";

// Replace with your actual API functions
import {
  fetchPendingInvites,
  apiSendInvite,
  apiAcceptInvite,
  apiDeclineInvite,
} from "@/lib/api/householdInvites";

export function useHouseholdInvites() {
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setPendingInvites(await fetchPendingInvites());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const sendInvite = async (email: string) => {
    setLoading(true);
    const ok = await apiSendInvite(email);
    await refresh();
    return ok;
  };

  const acceptInvite = async (inviteId: string) => {
    setLoading(true);
    const ok = await apiAcceptInvite(inviteId);
    await refresh();
    return ok;
  };

  const declineInvite = async (inviteId: string) => {
    setLoading(true);
    const ok = await apiDeclineInvite(inviteId);
    await refresh();
    return ok;
  };

  return {
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
  };
}
