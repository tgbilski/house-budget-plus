const refreshHouseholds = async () => {
  if (!user) return;

  setLoading(true);
  try {
    // Fetch all household memberships for the user with joined household data
    const { data: memberData, error: memberError } = await supabase
      .from('household_members')
      .select(`
        household_id,
        households!inner(*)
      `)
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    if (memberData) {
      const households = memberData.map(item => (item as any).households).filter(Boolean) as Household[];
      setUserHouseholds(households);

      let currentHouseholdId: string | null = null;
      // Get user's profile to find current household
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_household_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      } else {
        currentHouseholdId = profile?.current_household_id;
      }
      
      // Check if the current household from profile is a valid membership.
      let current = null;
      if (currentHouseholdId) {
        current = households.find(h => h.id === currentHouseholdId);
      }

      // If no current household is set or it's not a valid membership, default to the first one found.
      if (!current && households.length > 0) {
        current = households[0];
        // Optional: Update the user's profile to reflect this new default.
        if (user) {
          await supabase
            .from('profiles')
            .update({ current_household_id: current.id })
            .eq('user_id', user.id);
        }
      }
      
      if (current) {
        setCurrentHousehold(current);
        await loadHouseholdMembers(current.id);
      } else {
        setCurrentHousehold(null);
        setHouseholdMembers([]);
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
