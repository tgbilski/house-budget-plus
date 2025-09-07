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
import { Plus, Target, Edit2, Check, X, AlertTriangle, Trash2, Calendar, DollarSign, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Savings Goals</h2>
              <Button onClick={() => createNewGoal()} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-1">
                  {editingGoalId === goal.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 w-32"
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
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant={currentGoalId === goal.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentGoalId(goal.id)}
                        className="relative group"
                      >
                        {goal.title}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -right-1 -top-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoalId(goal.id);
                            setEditingTitle(goal.title);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </Button>
                      {savingsGoals.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Target Amount</span>
                    <span className="font-medium">${currentGoal?.target_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={localTargetAmount}
                      onChange={(e) => {
                        setLocalTargetAmount(e.target.value);
                        const amount = parseFloat(e.target.value) || 0;
                        updateGoalTarget(amount);
                      }}
                      className="pl-10"
                      placeholder="Enter target amount"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium">{getProgressPercentage().toFixed(1)}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Saved</span>
                    <span className="font-bold text-green-600">${getTotalSaved().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium">${((currentGoal?.target_amount || 0) - getTotalSaved()).toLocaleString()}</span>
                  </div>

                  {getAverageMonthlySavings() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Month</span>
                      <span className="font-medium">${getAverageMonthlySavings().toFixed(0)}</span>
                    </div>
                  )}

                  {getEstimatedCompletionDate() && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">
                          {getEstimatedCompletionDate()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Input Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Monthly Savings - {selectedYear}
                  </CardTitle>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {months.map((month, index) => {
                    const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                    const amount = savingsData[monthKey] || 0;
                    const inputValue = localInputValues[monthKey] || '';
                    
                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">{month}</label>
                          {amount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              ${amount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => handleMonthlyInputChange(index, e.target.value)}
                            className="pl-10"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AIChatbot 
        pageContext="This is the Savings Goals page where users can create multiple savings goals, set target amounts, and track monthly progress toward each goal."
        pageName="Savings Goals"
      />
    </div>
  );
};

export default SavingsGoals;