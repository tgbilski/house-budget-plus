// src/components/BudgetCalculator.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { generateBudgetPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { StreamingServiceSelector } from './StreamingServiceSelector';

interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
  selectedService?: string;
}

interface BudgetCalculatorProps {
  id: string;
  calculatorNumber?: number;
  onRemove: () => void;
  showRemove: boolean;
  pageType?: string;
  onNameChange: (id: string, name: string) => void;
}

const defaultExpenses: ExpenseItem[] = [
  { id: 'mortgage', label: 'Mortgage / Rent', amount: 0 },
  { id: 'electric', label: 'Electric', amount: 0 },
  { id: 'gas', label: 'Gas', amount: 0 },
  { id: 'water', label: 'Water', amount: 0 },
  { id: 'sewage', label: 'Sewage', amount: 0 },
  { id: 'utilities', label: 'Other Utilities', amount: 0 },
  { id: 'car-loan', label: 'Car Loan', amount: 0 },
  { id: 'car-insurance', label: 'Car Insurance', amount: 0 },
  { id: 'internet', label: 'Internet', amount: 0 },
  { id: 'phone', label: 'Phone', amount: 0 },
  { id: 'subscription1', label: 'Subscription #1', amount: 0 },
  { id: 'subscription2', label: 'Subscription #2', amount: 0 },
  { id: 'subscription3', label: 'Subscription #3', amount: 0 },
];

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ 
  id, 
  calculatorNumber,
  onRemove, 
  showRemove, 
  pageType = 'monthly_budget',
  onNameChange
}) => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();
  const [ownerName, setOwnerName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(defaultExpenses);
  const [additionalExpenses, setAdditionalExpenses] = useState<ExpenseItem[]>([]);
  const [additionalSubscriptions, setAdditionalSubscriptions] = useState<ExpenseItem[]>([]);
  const [subscriptionServices, setSubscriptionServices] = useState<Record<string, string>>({});

  // When the component loads, check for saved data and set the owner name.
  useEffect(() => {
    if (user && currentHousehold && selectedYear) {
      loadData();
    }
  }, [user, currentHousehold, selectedYear, id, pageType]);

  // Set up event listener for AI autofill
  useEffect(() => {
    const handleBudgetAutofill = (event: CustomEvent) => {
      const autofillData = event.detail;
      
      // Check if the event is for this specific calculator ID
      if (autofillData.action === 'fill_budget' && autofillData.calculatorId === id) {
        const { data } = autofillData;
        
        // Update income and expenses based on the data from the AI
        if (data.income !== null && data.income !== undefined) {
          setMonthlyIncome(data.income);
        }
        
        if (data.expenses) {
          const updatedExpenses = expenses.map(expense => {
            if (data.expenses[expense.id] !== undefined) {
              return { ...expense, amount: data.expenses[expense.id] };
            }
            return expense;
          });
          setExpenses(updatedExpenses);
        }
        
        if (data.customExpenses && data.customExpenses.length > 0) {
          const newCustomExpenses = data.customExpenses.map((expense: any, index: number) => ({
            id: `custom-${Date.now()}-${index}`,
            label: expense.label,
            amount: expense.amount
          }));
          setAdditionalExpenses(prev => [...prev, ...newCustomExpenses]);
        }
      }
    };

    window.addEventListener('budgetAutofill', handleBudgetAutofill as EventListener);
    
    return () => {
      window.removeEventListener('budgetAutofill', handleBudgetAutofill as EventListener);
    };
  }, [expenses, id]);

  const loadData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold?.id)
      .eq('year', selectedYear)
      .eq('calculator_id', id)
      .eq('page_type', pageType)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading budget data:', error);
      return;
    }

    if (data && data.length > 0) {
      const budgetData = data[0];
      setMonthlyIncome(budgetData.income || 0);
      const expensesData = budgetData.expenses as any;
      
      if (expensesData) {
        if (expensesData.fixed) {
          const updatedExpenses = defaultExpenses.map(expense => ({
            ...expense,
            amount: expensesData.fixed[expense.id] || 0
          }));
          setExpenses(updatedExpenses);
        }
        if (expensesData.custom) {
          setAdditionalExpenses(expensesData.custom);
        }
        if (expensesData.additionalSubscriptions) {
          setAdditionalSubscriptions(expensesData.additionalSubscriptions);
        }
        if (expensesData.subscriptionServices) {
          setSubscriptionServices(expensesData.subscriptionServices);
        }
        if (expensesData.ownerName) {
          setOwnerName(expensesData.ownerName);
          onNameChange(id, expensesData.ownerName); // Send the name to the parent component
        }
      }
    }
  };

  const saveData = async () => {
    if (!user) return;

    const fixedExpensesData: Record<string, number> = {};
    expenses.forEach(expense => {
      if (expense.amount > 0) {
        fixedExpensesData[expense.id] = expense.amount;
      }
    });

    const expensesData = {
      fixed: fixedExpensesData,
      custom: additionalExpenses,
      additionalSubscriptions,
      subscriptionServices,
      ownerName
    };

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        household_id: currentHousehold?.id,
        calculator_id: id,
        page_type: pageType,
        year: selectedYear,
        income: monthlyIncome,
        expenses: expensesData as any
      }, {
        onConflict: 'user_id,calculator_id,page_type,household_id,year'
      });

    if (error) {
      console.error('Error saving budget data:', error);
    } else {
      if (pageType === 'monthly_budget' && (monthlyIncome > 0 || Object.keys(fixedExpensesData).length > 0 || additionalExpenses.length > 0 || additionalSubscriptions.length > 0)) {
        window.dispatchEvent(new CustomEvent('earnBadge', { detail: { badgeType: 'monthly_budget' } }));
      }
    }
  };

  useEffect(() => {
    if (user && (monthlyIncome > 0 || expenses.some(e => e.amount > 0) || additionalExpenses.length > 0 || additionalSubscriptions.length > 0 || ownerName || Object.keys(subscriptionServices).length > 0)) {
      const saveTimeout = setTimeout(saveData, 500);
      return () => clearTimeout(saveTimeout);
    }
  }, [monthlyIncome, expenses, additionalExpenses, additionalSubscriptions, subscriptionServices, ownerName, user, pageType, id, selectedYear, currentHousehold]);

  const addAdditionalExpense = () => {
    if (additionalExpenses.length < 10) {
      const newExpense: ExpenseItem = {
        id: `additional-${Date.now()}`,
        label: 'Custom Expense',
        amount: 0,
      };
      setAdditionalExpenses([...additionalExpenses, newExpense]);
    }
  };

  const addAdditionalSubscription = () => {
    if (additionalSubscriptions.length < 10) {
      const newSubscription: ExpenseItem = {
        id: `subscription-${Date.now()}`,
        label: `Subscription #${4 + additionalSubscriptions.length}`,
        amount: 0,
      };
      setAdditionalSubscriptions([...additionalSubscriptions, newSubscription]);
    }
  };

  const removeAdditionalSubscription = (subscriptionId: string) => {
    setAdditionalSubscriptions(additionalSubscriptions.filter(sub => sub.id !== subscriptionId));
  };

  const removeAdditionalExpense = (expenseId: string) => {
    setAdditionalExpenses(additionalExpenses.filter(expense => expense.id !== expenseId));
  };

  const updateExpense = (expenseId: string, amount: number, isAdditional = false) => {
    if (isAdditional) {
      setAdditionalExpenses(
        additionalExpenses.map(expense =>
          expense.id === expenseId ? { ...expense, amount } : expense
        )
      );
    } else {
      setExpenses(
        expenses.map(expense =>
          expense.id === expenseId ? { ...expense, amount } : expense
        )
      );
    }
  };

  const updateAdditionalSubscription = (subscriptionId: string, amount: number) => {
    setAdditionalSubscriptions(
      additionalSubscriptions.map(subscription =>
        subscription.id === subscriptionId ? { ...subscription, amount } : subscription
      )
    );
  };

  const updateSubscriptionService = (expenseId: string, serviceId: string) => {
    setSubscriptionServices(prev => ({
      ...prev,
      [expenseId]: serviceId
    }));
  };

  const updateAdditionalExpenseLabel = (expenseId: string, label: string) => {
    setAdditionalExpenses(
      additionalExpenses.map(expense =>
        expense.id === expenseId ? { ...expense, label } : expense
      )
    );
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) +
    additionalExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
    additionalSubscriptions.reduce((sum, expense) => sum + expense.amount, 0);
  
  const netResult = monthlyIncome - totalExpenses;

  useEffect(() => {
    const event = new CustomEvent('budgetUpdate', {
      detail: {
        calculatorId: id,
        income: monthlyIncome,
        totalExpenses: totalExpenses,
        netResult: netResult
      }
    });
    window.dispatchEvent(event);
  }, [id, monthlyIncome, totalExpenses, netResult]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    const budgetData = {
      ownerName,
      monthlyIncome,
      expenses,
      additionalExpenses,
      currency: currency.symbol
    };
    generateBudgetPDF(budgetData);
  };

  return (
    <Card className="w-full max-w-md shadow-md border border-sage/40 bg-sage/5" data-calculator-id={id}>
      <CardHeader className="pb-2 pt-3 bg-teal/10 rounded-t-lg">
        <div className="space-y-2">
          {/* Compact title section */}
          <div className="group">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Calculator {calculatorNumber} Owner
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`owner-${id}`}
                placeholder="Enter owner name..."
                value={ownerName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setOwnerName(newName);
                  onNameChange(id, newName);
                }}
                className="text-sm font-semibold h-8 border-2 focus:border-primary transition-colors flex-1 min-w-0"
              />
            </div>
          </div>
          
          {/* Compact remove button */}
          {showRemove && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive hover:bg-red-50 h-7 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-3">
        {/* Compact Monthly Income */}
        <div>
          <Label htmlFor={`income-${id}`} className="text-xs font-semibold text-foreground">
            Monthly Income
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
            <Input
              id={`income-${id}`}
              type="number"
              min="0"
              step="0.01"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
              className="pl-6 h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Compact Monthly Expenses Header */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold text-foreground mb-2">Monthly Expenses</h3>
          
          {/* Compact Default Expenses */}
          <div className="space-y-1">
            {expenses.map((expense) => {
              if (!expense.id.startsWith('subscription')) {
                return (
                  <div key={expense.id} className="flex items-center space-x-1.5">
                    <Label className="text-xs text-muted-foreground w-24 text-left truncate">
                      {expense.label}
                    </Label>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={expense.amount || ''}
                        onChange={(e) => updateExpense(expense.id, parseFloat(e.target.value) || 0)}
                        className="pl-6 h-7 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Compact Additional Expenses */}
            {additionalExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center space-x-1.5">
                <Input
                  value={expense.label}
                  onChange={(e) => updateAdditionalExpenseLabel(expense.id, e.target.value)}
                  className="w-24 h-7 text-xs"
                  placeholder="Expense name"
                />
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expense.amount || ''}
                    onChange={(e) => updateExpense(expense.id, parseFloat(e.target.value) || 0, true)}
                    className="pl-6 h-7 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAdditionalExpense(expense.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Compact Add Expense Button */}
            {additionalExpenses.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addAdditionalExpense}
                className="w-full h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Expense
              </Button>
            )}

            {/* Default Subscription Expenses */}
            {expenses.map((expense) => {
              if (expense.id.startsWith('subscription')) {
                return (
                  <div key={expense.id} className="space-y-1">
                    <StreamingServiceSelector
                      value={expense.amount}
                      onChange={(amount) => updateExpense(expense.id, amount)}
                      label={expense.label}
                      expenseId={expense.id}
                      selectedService={subscriptionServices[expense.id] || 'custom'}
                      onServiceChange={(serviceId) => updateSubscriptionService(expense.id, serviceId)}
                    />
                  </div>
                );
              }
              return null;
            })}

            {/* Additional Subscriptions */}
            {additionalSubscriptions.map((subscription) => (
              <div key={subscription.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <StreamingServiceSelector
                    value={subscription.amount}
                    onChange={(amount) => updateAdditionalSubscription(subscription.id, amount)}
                    label={subscription.label}
                    expenseId={subscription.id}
                    selectedService={subscriptionServices[subscription.id] || 'custom'}
                    onServiceChange={(serviceId) => updateSubscriptionService(subscription.id, serviceId)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAdditionalSubscription(subscription.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Subscription Button */}
            {additionalSubscriptions.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addAdditionalSubscription}
                className="w-full h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Compact Subtotal and Net Result */}
        <div className="border-t pt-2 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">Subtotal:</span>
            <span className="text-xs font-semibold text-foreground">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Net Result:</span>
            <span className={`text-sm font-bold ${
              netResult >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {formatCurrency(netResult)}
            </span>
          </div>
        </div>

        {/* Compact Download PDF Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="w-full h-7 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCalculator;
