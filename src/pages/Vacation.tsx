import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';

interface VacationExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const expenseCategories = [
  'Transportation',
  'Accommodation',
  'Food & Dining',
  'Activities',
  'Shopping',
  'Other'
];

const Vacation: React.FC = () => {
  const [expenses, setExpenses] = useState<VacationExpense[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [newExpense, setNewExpense] = useState({ 
    category: '', 
    description: '', 
    amount: '', 
    date: '' 
  });
  const { user } = useAuth();
  const { currency } = useCurrency();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setNewExpense(prev => ({ ...prev, date: today }));
  }, []);

  const loadData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'vacation')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const budgetData = data[0];
      setBudget(budgetData.income || 0);
      const expensesData = budgetData.expenses as any;
      if (expensesData.expenses) {
        setExpenses(expensesData.expenses);
      }
    }
  };

  const saveData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'vacation',
        calculator_id: 'vacation',
        income: budget,
        expenses: { expenses } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    }
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount && newExpense.date) {
      const expense: VacationExpense = {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ category: '', description: '', amount: '', date: newExpense.date });
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  useEffect(() => {
    if (user) {
      saveData();
    }
  }, [expenses, budget, user]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;
  const budgetPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const expensesByCategory = expenseCategories.map(category => ({
    category,
    amount: expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })).filter(item => item.amount > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Vacation Budget</h1>
          <p className="text-muted-foreground">
            Plan and track your vacation expenses to stay within budget
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="budget">Total Budget ({currency.symbol})</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={budget || ''}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currency.symbol}{totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency.symbol}{remaining.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Budget Used</h3>
                  <p className={`text-2xl font-bold ${budgetPercentage <= 100 ? 'text-primary' : 'text-red-600'}`}>
                    {budgetPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {budget > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budgetPercentage <= 80 ? 'bg-green-500' :
                      budgetPercentage <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Expense */}
          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="What you spent on"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ({currency.symbol})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addExpense} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {expensesByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expensesByCategory.map(item => (
                    <div key={item.category} className="text-center p-4 border border-border rounded-lg">
                      <h3 className="font-medium">{item.category}</h3>
                      <p className="text-2xl font-bold text-primary">
                        {currency.symbol}{item.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {budget > 0 ? `${((item.amount / budget) * 100).toFixed(1)}% of budget` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Expenses */}
          {expenses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(expense => (
                      <div
                        key={expense.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                              {expense.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold mt-1">{expense.description}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className="font-semibold">
                            {currency.symbol}{expense.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpense(expense.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No vacation expenses tracked yet. Set your budget and add expenses above!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vacation;