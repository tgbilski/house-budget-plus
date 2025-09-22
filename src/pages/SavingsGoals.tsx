// ...imports remain unchanged
const SavingsGoals = () => {
  // ...state declarations remain unchanged
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();
  // ...

  // When inserting or updating, include the 'year' field
  const saveSavingsEntry = async (goalId: string, amount: number, monthKey: string) => {
    const entryDate = `${monthKey}-01`;
    if (!user || !goalId) return;

    try {
      const { data: existingEntry } = await supabase
        .from('savings_entries')
        .select('id')
        .eq('goal_id', goalId)
        .eq('entry_month', entryDate)
        .eq('year', selectedYear)
        .single();

      if (existingEntry) {
        if (amount === 0) {
          await supabase.from('savings_entries').delete().eq('id', existingEntry.id);
        } else {
          await supabase.from('savings_entries').update({ amount, year: selectedYear }).eq('id', existingEntry.id);
        }
      } else if (amount > 0) {
        await supabase.from('savings_entries').insert([{ goal_id: goalId, amount, entry_month: entryDate, year: selectedYear }]);
      }
    } catch (error) {
      console.error('Error updating savings entry:', error);
    }
  };

  // ...rest of component, including rendering and event handlers
};
export default SavingsGoals;
