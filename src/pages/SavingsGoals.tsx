import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Edit2, Check, X, AlertTriangle, Trash2, Calendar, LeafyGreen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AIChatbot } from '@/components/AIChatbot';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';

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
  const { currentHousehold } = useHouseholdContext();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [localTargetAmount, setLocalTargetAmount] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [savingsData, setSavingsData] = useState<Record<string, number>>({});
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [whatIfAmount, setWhatIfAmount] = useState('');

  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentGoal = savingsGoals.find(g => g.id === currentGoalId);

  useEffect(() => {
    if (user && currentHousehold) {
      loadSavingsGoals();
    } else if (!user) {
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
  }, [user, currentHousehold]);

  useEffect(() => {
    if (currentGoalId) {
      fetchSavingsData();
      const goal = savingsGoals.find(g => g.id === currentGoalId);
      if (goal) {
        setLocalTargetAmount(goal.target_amount.toString());
      }
    }
  }, [currentGoalId, selectedYear, savingsGoals]);

  const loadSavingsGoals = async () => {
    try {
      const { data: goals, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('household_id', currentHousehold?.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (goals && goals.length > 0) {
        setSavingsGoals(goals);
        setCurrentGoalId(goals[0].id);
      } else {
        await createNewGoal(true);
      }
    } catch (error) {
      console.error('Error loading savings goals:', error);
      toast.error('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  const createNewGoal = async (isInitialLoad = false) => {
    if (!user) {
      const tempGoal = {
        id: `temp-${Date.now()}`,
        title: `Goal ${savingsGoals.length + 1}`,
        target_amount: 0,
        current_amount: 0
      };
      const newGoals = [...savingsGoals, tempGoal];
      setSavingsGoals(newGoals);
      setCurrentGoalId(tempGoal.id);
      if (!isInitialLoad) toast.success('New savings goal created! Sign in to save your progress.');
      return;
    }

    try {
      const { data: newGoal, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: user?.id,
          household_id: currentHousehold?.id,
          title: `Goal ${savingsGoals.length + 1}`,
          target_amount: 0,
          current_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const updatedGoals = [...savingsGoals, newGoal];
      setSavingsGoals(updatedGoals);
      setCurrentGoalId(newGoal.id);
      if (!isInitialLoad) toast.success('New savings goal created!');
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

    const newGoals = savingsGoals.filter(goal => goal.id !== goalId);
    setSavingsGoals(newGoals);
    setCurrentGoalId(newGoals[0].id);
    setSavingsData({});
    setLocalInputValues({});

    if (!user) {
      toast.success('Goal deleted! Sign in to save your progress.');
      return;
    }

    try {
      const { error } = await supabase.from('savings_goals').delete().eq('id', goalId);
      if (error) throw error;
      toast.success('Savings goal deleted!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
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
        const monthKey = entry.entry_month.slice(0, 7);
        dataMap[monthKey] = entry.amount;
        inputMap[monthKey] = entry.amount.toString();
      });
      setSavingsData(dataMap);
      setLocalInputValues(inputMap);
    } catch (error) {
      console.error('Error fetching savings data:', error);
      toast.error('Failed to fetch savings data.');
    }
  };

  const handleMonthlyInputChange = (monthIndex: number, inputValue: string) => {
    const monthKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    setLocalInputValues(prev => ({ ...prev, [monthKey]: inputValue }));
    const numericValue = parseFloat(inputValue) || 0;
    updateSavingsAmount(monthIndex, numericValue);
  };

  const updateSavingsAmount = async (monthIndex: number, amount: number) => {
    const monthKey = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    const entryDate = `${monthKey}-01`;

    const newData = { ...savingsData };
    if (amount === 0) {
      delete newData[monthKey];
    } else {
      newData[monthKey] = amount;
    }
    setSavingsData(newData);

    if (!user || !currentGoalId) return;

    try {
      const { data: existingEntry } = await supabase
        .from('savings_entries')
        .select('id')
        .eq('goal_id', currentGoalId)
        .eq('entry_month', entryDate)
        .single();

      if (existingEntry) {
        if (amount === 0) {
          await supabase.from('savings_entries').delete().eq('id', existingEntry.id);
        } else {
          await supabase.from('savings_entries').update({ amount }).eq('id', existingEntry.id);
        }
      } else if (amount > 0) {
        await supabase.from('savings_entries').insert([{ goal_id: currentGoalId, amount, entry_month: entryDate }]);
      }

      const total = Object.values(newData).reduce((sum, val) => sum + val, 0);
      await supabase.from('savings_goals').update({ current_amount: total }).eq('id', currentGoalId);
      
      setSavingsGoals(prevGoals => prevGoals.map(goal => 
        goal.id === currentGoalId ? { ...goal, current_amount: total } : goal
      ));

    } catch (error) {
      console.error('Error updating savings:', error);
      toast.error('Failed to update savings amount');
    }
  };

  const updateGoalTitle = async (newTitle: string) => {
    if (!editingGoalId || !newTitle.trim()) return;

    if (!user) {
      const updatedGoals = savingsGoals.map(goal =>
        goal.id === editingGoalId ? { ...goal, title: newTitle.trim() } : goal
      );
      setSavingsGoals(updatedGoals);
      setEditingGoalId(null);
      toast.success('Goal title updated! Sign in to save your progress.');
      return;
    }

    try {
      const { error } = await supabase.from('savings_goals').update({ title: newTitle.trim() }).eq('id', editingGoalId);
      if (error) throw error;
      const updatedGoals = savingsGoals.map(goal =>
        goal.id === editingGoalId ? { ...goal, title: newTitle.trim() } : goal
      );
      setSavingsGoals(updatedGoals);
      setEditingGoalId(null);
      toast.success('Goal title updated!');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update goal title');
    }
  };

  const updateGoalTarget = async (targetAmount: number) => {
    if (!currentGoalId) return;

    if (!user) {
      const updatedGoals = savingsGoals.map(goal =>
        goal.id === currentGoalId ? { ...goal, target_amount: targetAmount } : goal
      );
      setSavingsGoals(updatedGoals);
      return;
    }

    try {
      const { error } = await supabase.from('savings_goals').update({ target_amount: targetAmount }).eq('id', currentGoalId);
      if (error) throw error;
      setSavingsGoals(prevGoals => prevGoals.map(goal =>
        goal.id === currentGoalId ? { ...goal, target_amount: targetAmount } : goal
      ));
    } catch (error) {
      console.error('Error updating goal target:', error);
      toast.error('Failed to update goal target');
    }
  };

  const getTotalSaved = () => Object.values(savingsData).reduce((sum, amount) => sum + amount, 0);

  const getProgressPercentage = () => {
    if (!currentGoal || currentGoal.target_amount === 0) return 0;
    const totalSaved = getTotalSaved();
    return Math.min((totalSaved / currentGoal.target_amount) * 100, 100);
  };

  const getAverageMonthlySavings = () => {
    const allSavingsValues = Object.values(savingsData);
    const monthsWithSavings = allSavingsValues.filter(amount => amount > 0).length;
    if (monthsWithSavings === 0) return 0;
    return getTotalSaved() / monthsWithSavings;
  };

  const getEstimatedCompletionDate = (monthlyAddition = 0) => {
    if (!currentGoal) return null;
    const remainingAmount = currentGoal.target_amount - getTotalSaved();
    if (remainingAmount <= 0) return "Goal achieved!";
    const averageMonthlySavings = getAverageMonthlySavings();
    const newMonthlySavings = averageMonthlySavings + monthlyAddition;
    if (newMonthlySavings <= 0) return null;
    const monthsToComplete = Math.ceil(remainingAmount / newMonthlySavings);
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
    return completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
    <div className="min-h-screen overflow-x-hidden">
      <SEO
        title="Savings Goals - Track Your Monthly Savings"
        description="Track your monthly savings with an interactive yearly table and editable goals."
        keywords="savings goals, monthly savings, financial planning, money tracker"
      />

      <div className="relative bg-white text-gray-900 py-8 overflow-x-hidden rounded-2xl mx-4 mt-4 mb-6 shadow-xl">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <Target className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Savings Tracker</h1>
            <p className="text-sm md:text-base text-gray-600 mb-4">Track your monthly savings progress with an easy-to-use yearly table</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl mx-auto px-4 py-6 md:py-8">
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

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-1">
                {editingGoalId === goal.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8 w-32 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateGoalTitle(editingTitle);
                        if (e.key === 'Escape') setEditingGoalId(null);
                      }}
                      onBlur={() => updateGoalTitle(editingTitle)}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={() => updateGoalTitle(editingTitle)} className="h-8 w-8 p-0">
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
                        onClick={() => setCurrentGoalId(goal.id)}
                        className={`pr-8 ${currentGoalId === goal.id ? 'border-2 border-white' : ''}`}
                      >
                        {goal.title}
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGoalId(goal.id);
                          setEditingTitle(goal.title);
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
            <Button
              onClick={() => createNewGoal()}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-full border-dashed"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto" />

        <Card className="mb-6">
          <CardContent className="pt-6">
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
              {getEstimatedCompletionDate() && (
                <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                  <LeafyGreen className="h-4 w-4 text-green-600" /> On track to reach your goal by: **{getEstimatedCompletionDate()}**
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto" />

        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Goal:</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={localTargetAmount}
                      onChange={(e) => setLocalTargetAmount(e.target.value)}
                      onBlur={() => updateGoalTarget(parseFloat(localTargetAmount) || 0)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                          updateGoalTarget(parseFloat(localTargetAmount) || 0);
                        }
                      }}
                      placeholder="0"
                      className="w-24 md:w-32 pl-5 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> Year:
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-20 md:w-32">
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

              {savingsGoals.length > 1 && currentGoalId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteGoal(currentGoalId)}
                  className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive w-full md:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Delete Goal</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2 text-sm">Month</TableHead>
                    <TableHead className="text-sm">Amount Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map((month, index) => {
                    const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                    const inputValue = localInputValues[monthKey] || '';

                    return (
                      <TableRow key={month}>
                        <TableCell className="font-medium text-sm py-2">{month}</TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => handleMonthlyInputChange(index, e.target.value)}
                            placeholder="0.00"
                            className="w-20 md:w-32 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

            <div className="mt-4 p-3 md:p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm md:text-base">Total for {selectedYear}:</span>
                <span className="text-base md:text-lg font-bold text-primary">
                  ${Object.entries(savingsData)
                    .filter(([key]) => key.startsWith(selectedYear))
                    .reduce((sum, [, value]) => sum + value, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What If I Save More?</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-gray-500 mb-3">
              See how adding a little extra each month can change your timeline.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="0"
                value={whatIfAmount}
                onChange={(e) => setWhatIfAmount(e.target.value)}
                className="w-24 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
              <span className="text-sm text-gray-600">more per month</span>
            </div>
            {whatIfAmount && getEstimatedCompletionDate(parseFloat(whatIfAmount)) && (
              <p className="text-lg font-semibold">
                Your new completion date would be: **{getEstimatedCompletionDate(parseFloat(whatIfAmount))}**
              </p>
            )}
          </CardContent>
        </Card>

        <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto" />

        <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl mx-auto px-4 py-8">
          <Collapsible.Root
            className="w-full"
            open={isGlossaryOpen}
            onOpenChange={setIsGlossaryOpen}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-white">Financial Glossary</h4>
              <Collapsible.Trigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isGlossaryOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                  <span className="sr-only">Toggle Financial Glossary</span>
                </Button>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">APY (Annual Percentage Yield)</h5>
                <p className="text-sm text-gray-600">
                  The real rate of return earned on an investment, taking into account the effect of compounding interest.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Compound Interest</h5>
                <p className="text-sm text-gray-600">
                  Interest earned on both the initial principal and the accumulated interest from previous periods.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Asset Allocation</h5>
                <p className="text-sm text-gray-600">
                  An investment strategy that aims to balance risk and reward by dividing a portfolio's assets according to an individual's goals, risk tolerance, and investment horizon.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">ROI (Return on Investment)</h5>
                <p className="text-sm text-gray-600">
                  A performance measure used to evaluate the efficiency of an investment or to compare the efficiency of a number of different investments.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Emergency Fund</h5>
                <p className="text-sm text-gray-600">
                  A personal savings account that is reserved for financial surprises, such as medical emergencies or a sudden job loss.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Diversification</h5>
                <p className="text-sm text-gray-600">
                  A risk management strategy that mixes a wide variety of investments within a portfolio.
                </p>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </div>

      <AIChatbot
        pageContext="This is the Savings Goals page where users can set and track their savings goals for different years. The page includes a 'What If' calculator for goal projections and an expanded, collapsible financial glossary at the bottom. The core features are editing goals, tracking monthly savings, and viewing progress."
        pageName="Savings Goals"
      />
    </div>
  );
};

export default SavingsGoals;
