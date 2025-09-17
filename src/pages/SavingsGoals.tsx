import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle, Calendar, DollarSign, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { AIChatbot } from '@/components/AIChatbot';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  goal_number: number;
}

const SavingsGoals = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [localTargetAmount, setLocalTargetAmount] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [savingsData, setSavingsData] = useState<Record<string, number>>({});
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const currentGoal = savingsGoals.find(g => g.id === currentGoalId);

  useEffect(() => {
    if (user && currentHousehold) {
      loadSavingsGoals();
    } else if (!user) {
      initializeDemoGoals();
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

  // Initialize 3 goals for demo users
  const initializeDemoGoals = () => {
    const demoGoals = [
      { id: 'temp-1', title: 'Goal 1', target_amount: 0, current_amount: 0, goal_number: 1 },
      { id: 'temp-2', title: 'Goal 2', target_amount: 0, current_amount: 0, goal_number: 2 },
      { id: 'temp-3', title: 'Goal 3', target_amount: 0, current_amount: 0, goal_number: 3 }
    ];
    setSavingsGoals(demoGoals);
    setCurrentGoalId(demoGoals[0].id);
  };

  const loadSavingsGoals = async () => {
    try {
      const { data: goals, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('household_id', currentHousehold?.id)
        .order('goal_number', { ascending: true });

      if (fetchError) throw fetchError;

      // Create all 3 goals if they don't exist
      const existingGoalNumbers = goals?.map(g => g.goal_number) || [];
      const missingGoals = [];
      
      for (let i = 1; i <= 3; i++) {
        if (!existingGoalNumbers.includes(i)) {
          missingGoals.push({
            user_id: user?.id,
            household_id: currentHousehold?.id,
            title: `Goal ${i}`,
            target_amount: 0,
            current_amount: 0,
            goal_number: i
          });
        }
      }

      if (missingGoals.length > 0) {
        const { data: newGoals, error: insertError } = await supabase
          .from('savings_goals')
          .insert(missingGoals)
          .select();
        
        if (insertError) throw insertError;
        
        const allGoals = [...(goals || []), ...(newGoals || [])].sort((a, b) => a.goal_number - b.goal_number);
        setSavingsGoals(allGoals);
        setCurrentGoalId(allGoals[0].id);
      } else {
        setSavingsGoals(goals);
        setCurrentGoalId(goals[0].id);
      }
    } catch (error) {
      console.error('Error loading savings goals:', error);
      toast.error('Failed to load savings goals.');
    } finally {
      setLoading(false);
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

  const getEstimatedCompletionDate = () => {
    if (!currentGoal) return null;
    const remainingAmount = currentGoal.target_amount - getTotalSaved();
    if (remainingAmount <= 0) return "Goal achieved!";
    const averageMonthlySavings = getAverageMonthlySavings();
    if (averageMonthlySavings <= 0) return null;
    const monthsToComplete = Math.ceil(remainingAmount / averageMonthlySavings);
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
    return completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const resetGoalData = async () => {
    if (!currentGoalId) return;

    // Clear local state
    setSavingsData({});
    setLocalInputValues({});

    if (!user) return;

    try {
      // Delete all savings entries for the current goal
      await supabase
        .from('savings_entries')
        .delete()
        .eq('goal_id', currentGoalId);

      // Reset current_amount to 0
      await supabase
        .from('savings_goals')
        .update({ current_amount: 0 })
        .eq('id', currentGoalId);

      // Update local goals state
      setSavingsGoals(prevGoals => prevGoals.map(goal => 
        goal.id === currentGoalId ? { ...goal, current_amount: 0 } : goal
      ));

      toast.success('Goal data reset successfully');
    } catch (error) {
      console.error('Error resetting goal data:', error);
      toast.error('Failed to reset goal data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-16 bg-gray-200 rounded w-80"></div>
          <div className="h-64 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Savings Goals - Track Your Monthly Savings"
        description="Track your monthly savings with an interactive yearly table and editable goals."
        keywords="savings goals, monthly savings, financial planning, money tracker"
      />

      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Savings Tracker</h1>
                <p className="text-sm text-gray-600">Track your progress toward financial goals</p>
              </div>
            </div>
            
            {currentGoal && currentGoal.target_amount > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-2xl font-bold text-primary">
                  {getProgressPercentage().toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!user && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> - 
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your progress
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Goals Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="w-full">
                  <div 
                    className={cn(
                      "group relative cursor-pointer transition-all w-full",
                      currentGoalId === goal.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      "rounded-lg px-4 py-3 border-2",
                      currentGoalId === goal.id && "border-primary",
                      currentGoalId !== goal.id && "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => setCurrentGoalId(goal.id)}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-lg font-semibold">
                        {goal.title}
                      </span>
                      <div className="text-sm opacity-75">
                        ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {currentGoal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {currentGoal.title} Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Target Amount Input */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium w-24">Target:</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">$</span>
                  <Input
                    type="number"
                    value={localTargetAmount}
                    onChange={(e) => setLocalTargetAmount(e.target.value)}
                    onBlur={() => {
                      const amount = parseFloat(localTargetAmount) || 0;
                      updateGoalTarget(amount);
                    }}
                    className="w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {currentGoal.target_amount > 0 && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressPercentage().toFixed(1)}%</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${getTotalSaved().toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${(currentGoal.target_amount - getTotalSaved()).toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${getAverageMonthlySavings().toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Avg/Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{getEstimatedCompletionDate() || 'N/A'}</div>
                      <div className="text-xs text-gray-600">Est. Complete</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Monthly Savings Input */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-4">
              <CardTitle className="text-base font-medium">Monthly Savings</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetGoalData}
                className="text-destructive hover:text-destructive"
              >
                Reset Goal
              </Button>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {months.map((month, index) => {
                const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                const currentValue = localInputValues[monthKey] || '';
                const savedAmount = savingsData[monthKey] || 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{month}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleMonthlyInputChange(index, e.target.value)}
                        className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <AIChatbot 
          pageContext="I'm on the savings goals page where I can track my monthly savings progress toward financial goals."
          pageName="Savings Goals"
        />
      </div>
    </div>
  );
};

export default SavingsGoals;