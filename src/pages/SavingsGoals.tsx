import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface SavingsEntry {
  id: string;
  amount: number;
  entry_month: string;
  goal_id: string;
}

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  description?: string;
  image_url?: string;
}

const SavingsGoals = () => {
  const { user } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('My Savings Goal');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(goalTitle);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [savingsData, setSavingsData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user) {
      loadSavingsGoals();
    }
  }, [user]);

  useEffect(() => {
    if (currentGoalId) {
      fetchSavingsData();
    }
  }, [currentGoalId, selectedYear]);

  const loadSavingsGoals = async () => {
    try {
      const { data: goals, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (goals && goals.length > 0) {
        setSavingsGoals(goals);
        setCurrentGoalId(goals[0].id);
        setGoalTitle(goals[0].title);
        setEditTitle(goals[0].title);
      } else {
        // Create a default goal for the user
        const { data: newGoal, error: createError } = await supabase
          .from('savings_goals')
          .insert([{
            user_id: user?.id,
            title: 'My Savings Goal',
            target_amount: 0,
            current_amount: 0
          }])
          .select()
          .single();

        if (createError) throw createError;

        setSavingsGoals([newGoal]);
        setCurrentGoalId(newGoal.id);
        setGoalTitle(newGoal.title);
        setEditTitle(newGoal.title);
      }
    } catch (error) {
      console.error('Error loading savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const createNewGoal = async () => {
    try {
      const { data: newGoal, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: user?.id,
          title: `Goal ${savingsGoals.length + 1}`,
          target_amount: 0,
          current_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setSavingsGoals([...savingsGoals, newGoal]);
      setCurrentGoalId(newGoal.id);
      setGoalTitle(newGoal.title);
      setEditTitle(newGoal.title);
      toast.success('New savings goal created!');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create new goal');
    }
  };

  const selectGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setCurrentGoalId(goal.id);
      setGoalTitle(goal.title);
      setEditTitle(goal.title);
    }
  };

  const fetchSavingsData = async () => {
    if (!currentGoalId) return;

    try {
      const { data, error } = await supabase
        .from('savings_entries')
        .select('*')
        .eq('goal_id', currentGoalId)
        .gte('entry_month', `${selectedYear}-01-01`)
        .lt('entry_month', `${parseInt(selectedYear) + 1}-01-01`);

      if (error) throw error;

      const dataMap: Record<string, number> = {};
      data?.forEach((entry: SavingsEntry) => {
        const monthKey = entry.entry_month.slice(0, 7); // YYYY-MM format
        dataMap[monthKey] = entry.amount;
      });

      setSavingsData(dataMap);
    } catch (error) {
      console.error('Error fetching savings data:', error);
      toast.error('Failed to load savings data');
    }
  };

  const updateSavingsAmount = async (monthIndex: number, amount: number) => {
    if (!currentGoalId) return;

    const monthKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    const entryDate = `${monthKey}-01`;

    try {
      // Check if entry exists
      const { data: existingEntry } = await supabase
        .from('savings_entries')
        .select('id')
        .eq('goal_id', currentGoalId)
        .eq('entry_month', entryDate)
        .single();

      if (existingEntry) {
        // Update existing entry
        if (amount === 0) {
          // Delete if amount is 0
          await supabase
            .from('savings_entries')
            .delete()
            .eq('id', existingEntry.id);
        } else {
          await supabase
            .from('savings_entries')
            .update({ amount })
            .eq('id', existingEntry.id);
        }
      } else if (amount > 0) {
        // Create new entry only if amount > 0
        await supabase
          .from('savings_entries')
          .insert([{
            goal_id: currentGoalId,
            amount,
            entry_month: entryDate
          }]);
      }

      // Update local state
      const newData = { ...savingsData };
      if (amount === 0) {
        delete newData[monthKey];
      } else {
        newData[monthKey] = amount;
      }
      setSavingsData(newData);

      // Update total in goals table
      const total = Object.values(newData).reduce((sum, val) => sum + val, 0);
      await supabase
        .from('savings_goals')
        .update({ current_amount: total })
        .eq('id', currentGoalId);

    } catch (error) {
      console.error('Error updating savings:', error);
      toast.error('Failed to update savings amount');
    }
  };

  const updateGoalTitle = async () => {
    if (!currentGoalId || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ title: editTitle.trim() })
        .eq('id', currentGoalId);

      if (error) throw error;

      setGoalTitle(editTitle.trim());
      setIsEditingTitle(false);
      toast.success('Goal title updated!');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update goal title');
    }
  };

  const getTotalSaved = () => {
    return Object.values(savingsData).reduce((sum, amount) => sum + amount, 0);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please sign in to track your savings goals.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <SEO 
        title="Savings Goals - Track Your Monthly Savings"
        description="Track your monthly savings with an interactive yearly table and editable goals."
        keywords="savings goals, monthly savings, financial planning, money tracker"
      />
      
      {/* Hero Section with Dark Gradient */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4K')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Savings Tracker</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track your monthly savings progress with an easy-to-use yearly table
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Savings Goals Management */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Savings Goals</h2>
            <Button onClick={createNewGoal} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {savingsGoals.map((goal) => (
              <Button
                key={goal.id}
                variant={currentGoalId === goal.id ? "default" : "outline"}
                size="sm"
                onClick={() => selectGoal(goal.id)}
              >
                {goal.title}
              </Button>
            ))}
          </div>

          {/* Editable Title for Current Goal */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateGoalTitle();
                  if (e.key === 'Escape') {
                    setEditTitle(goalTitle);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={updateGoalTitle}>
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditTitle(goalTitle);
                  setIsEditingTitle(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{goalTitle}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Total Saved */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Total Saved</h3>
              <p className="text-4xl font-bold text-primary">
                ${getTotalSaved().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Year Selection and Savings Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Year:</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Month</TableHead>
                  <TableHead>Amount Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((month, index) => {
                  const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                  const currentAmount = savingsData[monthKey] || 0;
                  
                  return (
                    <TableRow key={month}>
                      <TableCell className="font-medium">{month}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={currentAmount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            updateSavingsAmount(index, value);
                          }}
                          placeholder="0"
                          className="w-32"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Year Total */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total for {selectedYear}:</span>
                <span className="text-lg font-bold text-primary">
                  ${Object.entries(savingsData)
                    .filter(([key]) => key.startsWith(selectedYear))
                    .reduce((sum, [, value]) => sum + value, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SavingsGoals;