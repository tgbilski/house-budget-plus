import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Edit2, Check, X, AlertTriangle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AIChatbot } from '@/components/AIChatbot';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

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
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [savingsData, setSavingsData] = useState<Record<string, number>>({});
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user) {
      loadSavingsGoals();
    } else {
      // Initialize with a default goal for non-authenticated users
      const defaultGoal = {
        id: 'temp-1',
        title: 'My Savings Goal',
        target_amount: 0,
        current_amount: 0
      };
      setSavingsGoals([defaultGoal]);
      setCurrentGoalId(defaultGoal.id);
      setLoading(false);
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
      }
    } catch (error) {
      console.error('Error loading savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const createNewGoal = async () => {
    if (!user) {
      // For non-authenticated users, create a temporary goal
      const tempGoal = {
        id: `temp-${Date.now()}`,
        title: `Goal ${savingsGoals.length + 1}`,
        target_amount: 0,
        current_amount: 0
      };
      setSavingsGoals([...savingsGoals, tempGoal]);
      setCurrentGoalId(tempGoal.id);
      toast.success('New savings goal created! Sign in to save your progress.');
      return;
    }

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
      toast.success('New savings goal created!');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create new goal');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (savingsGoals.length <= 1) {
      toast.error('Cannot delete the last remaining goal');
      return;
    }

    if (!user) {
      // For non-authenticated users, just remove from local state
      const updatedGoals = savingsGoals.filter(goal => goal.id !== goalId);
      setSavingsGoals(updatedGoals);
      
      // Select first remaining goal
      if (updatedGoals.length > 0) {
        setCurrentGoalId(updatedGoals[0].id);
      }
      
      // Clear savings data for this goal
      const newData = { ...savingsData };
      Object.keys(newData).forEach(key => delete newData[key]);
      setSavingsData(newData);
      
      toast.success('Goal deleted! Sign in to save your progress.');
      return;
    }

    try {
      // Delete from database
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      const updatedGoals = savingsGoals.filter(goal => goal.id !== goalId);
      setSavingsGoals(updatedGoals);

      // Select first remaining goal
      if (updatedGoals.length > 0) {
        setCurrentGoalId(updatedGoals[0].id);
      }

      // Clear savings data for this goal
      const newData = { ...savingsData };
      Object.keys(newData).forEach(key => delete newData[key]);
      setSavingsData(newData);

      toast.success('Savings goal deleted!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const selectGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setCurrentGoalId(goal.id);
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
      const inputMap: Record<string, string> = {};
      data?.forEach((entry: SavingsEntry) => {
        const monthKey = entry.entry_month.slice(0, 7); // YYYY-MM format
        dataMap[monthKey] = entry.amount;
        inputMap[monthKey] = entry.amount.toString();
      });

      setSavingsData(dataMap);
      setLocalInputValues(inputMap);
    } catch (error) {
      console.error('Error fetching savings data:', error);
      toast.error('Failed to load savings data');
    }
  };

  const handleInputChange = (monthIndex: number, inputValue: string) => {
    const monthKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    
    // Update local input value immediately for responsive UI
    setLocalInputValues(prev => ({
      ...prev,
      [monthKey]: inputValue
    }));
    
    // Parse and update the actual savings data
    const numericValue = parseFloat(inputValue) || 0;
    updateSavingsAmount(monthIndex, numericValue);
  };

  const updateSavingsAmount = async (monthIndex: number, amount: number) => {
    const monthKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    
    if (!user) {
      // For non-authenticated users, just update local state
      const newData = { ...savingsData };
      if (amount === 0) {
        delete newData[monthKey];
      } else {
        newData[monthKey] = amount;
      }
      setSavingsData(newData);
      return;
    }

    if (!currentGoalId) return;

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

  const updateGoalTitle = async (goalId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    if (!user) {
      // For non-authenticated users, just update local state
      const updatedGoals = savingsGoals.map(goal => 
        goal.id === goalId ? { ...goal, title: newTitle.trim() } : goal
      );
      setSavingsGoals(updatedGoals);
      setEditingGoalId(null);
      toast.success('Goal title updated! Sign in to save your progress.');
      return;
    }

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ title: newTitle.trim() })
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      const updatedGoals = savingsGoals.map(goal => 
        goal.id === goalId ? { ...goal, title: newTitle.trim() } : goal
      );
      setSavingsGoals(updatedGoals);
      setEditingGoalId(null);
      toast.success('Goal title updated!');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update goal title');
    }
  };

  const startEditingGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoalId(goalId);
      setEditingTitle(goal.title);
    }
  };

  const getCurrentGoal = () => {
    return savingsGoals.find(goal => goal.id === currentGoalId);
  };

  const getProgressPercentage = () => {
    const currentGoal = getCurrentGoal();
    const totalSaved = getTotalSaved();
    const targetAmount = currentGoal?.target_amount || 0;
    
    if (targetAmount === 0) return 0;
    return Math.min((totalSaved / targetAmount) * 100, 100);
  };

  const updateGoalTarget = async (targetAmount: number) => {
    if (!currentGoalId) return;

    if (!user) {
      // For non-authenticated users, just update local state
      const updatedGoals = savingsGoals.map(goal => 
        goal.id === currentGoalId ? { ...goal, target_amount: targetAmount } : goal
      );
      setSavingsGoals(updatedGoals);
      return;
    }

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ target_amount: targetAmount })
        .eq('id', currentGoalId);

      if (error) throw error;

      // Update local state
      const updatedGoals = savingsGoals.map(goal => 
        goal.id === currentGoalId ? { ...goal, target_amount: targetAmount } : goal
      );
      setSavingsGoals(updatedGoals);
    } catch (error) {
      console.error('Error updating goal target:', error);
      toast.error('Failed to update goal target');
    }
  };

  const getTotalSaved = () => {
    return Object.values(savingsData).reduce((sum, amount) => sum + amount, 0);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
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
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-4 md:py-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4K')] opacity-20"></div>
        <div className="w-full max-w-none px-4 relative z-10">
          <div className="text-center">
            <Target className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 md:mb-3 text-primary" />
            <h1 className="text-lg md:text-2xl font-bold mb-2">Savings Tracker</h1>
            <p className="text-sm md:text-base text-gray-300">
              Track your monthly savings progress with an easy-to-use yearly table
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Warning Banner for Non-Authenticated Users */}
        {!user && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Try it out!</strong> You're using savings tracker in demo mode. 
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900 dark:hover:text-yellow-100">
                Sign in to save your progress
              </Link> and access all features.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Savings Goals Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap overflow-x-auto pb-2">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-1">
                {editingGoalId === goal.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8 w-32 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateGoalTitle(goal.id, editingTitle);
                        if (e.key === 'Escape') setEditingGoalId(null);
                      }}
                      onBlur={() => updateGoalTitle(goal.id, editingTitle)}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={() => updateGoalTitle(goal.id, editingTitle)} className="h-8 w-8 p-0">
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingGoalId(null)} className="h-8 w-8 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="relative group">
                      <Button
                        variant={currentGoalId === goal.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectGoal(goal.id)}
                        className="pr-8"
                      >
                        {goal.title}
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingGoal(goal.id);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded flex items-center justify-center"
                        title="Edit goal name"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Goal Plus Button */}
            <Button 
              onClick={createNewGoal} 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0 rounded-full border-dashed"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Total Saved with Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Progress towards goal</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {getProgressPercentage().toFixed(1)}%
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {/* Total Goal Amount */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium whitespace-nowrap">Total Goal:</label>
                  <div className="relative flex-1 sm:flex-none">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={getCurrentGoal()?.target_amount || ''}
                      onChange={(e) => updateGoalTarget(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full sm:w-32 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {/* Year Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium">Year:</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full sm:w-32">
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
              
              {/* Delete Goal Button */}
              {savingsGoals.length > 1 && currentGoalId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteGoal(currentGoalId)}
                  className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Goal
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Month</TableHead>
                    <TableHead className="min-w-[140px]">Amount Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map((month, index) => {
                    const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                    const currentAmount = savingsData[monthKey] || 0;
                    const inputValue = localInputValues[monthKey] || '';
                    
                    return (
                      <TableRow key={month}>
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            placeholder="0.00"
                            className="w-full max-w-[120px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
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

      <AIChatbot 
        pageContext="This is the Savings Goals page where users can set and track their savings goals for different years. Users can create multiple savings goals, set target amounts, and track their monthly savings progress in a table format. The page shows total saved amounts and calculates progress toward goals."
        pageName="Savings Goals"
      />
    </div>
  );
};

export default SavingsGoals;