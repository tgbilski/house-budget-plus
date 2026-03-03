// src/components/BudgetCalculator.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHousehold } from '@/hooks/useHousehold';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { StreamingServiceSelector } from './StreamingServiceSelector';
import { AISavingsTeaser } from './AISavingsTeaser';

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
  onEmptyStateChange?: (id: string, isEmpty: boolean) => void;
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
  onNameChange,
  onEmptyStateChange
}) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold(user?.id);
  const { selectedYear } = useYear();
  const { currency } = useCurrency();
  const [ownerName, setOwnerName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(defaultExpenses);
  const [additionalExpenses, setAdditionalExpenses] = useState<ExpenseItem[]>([]);
  const [additionalSubscriptions, setAdditionalSubscriptions] = useState<ExpenseItem[]>([]);
  const [subscriptionServices, setSubscriptionServices] = useState<Record<string, string>>({});
  const [badgeAwarded, setBadgeAwarded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user has entered any data
  const checkHasData = () => {
    return ownerName.trim() !== '' || 
           monthlyIncome > 0 || 
           expenses.some(e => e.amount > 0) || 
           additionalExpenses.length > 0 || 
           additionalSubscriptions.length > 0;
  };

  // Handle blur from the calculator container
  const handleContainerBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is outside this container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      if (checkHasData() && !badgeAwarded && pageType === 'monthly_budget') {
        window.dispatchEvent(new CustomEvent('earnBadge', { detail: { badgeType: 'monthly_budget' } }));
        setBadgeAwarded(true);
      }
    }
  };

  // Reset calculator to defaults and notify parent to hide it
  const resetCalculator = async () => {
    setOwnerName('');
    setMonthlyIncome(0);
    setExpenses(defaultExpenses);
    setAdditionalExpenses([]);
    setAdditionalSubscriptions([]);
    setSubscriptionServices({});
    setBadgeAwarded(false);
    onNameChange(id, '');
    
    // Delete data from database if user is logged in
    if (user && currentHousehold) {
      await supabase
        .from('budget_data')
        .delete()
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .eq('calculator_id', id)
        .eq('page_type', pageType);
      
      // Invalidate the React Query cache so deleted data doesn't come back
      queryClient.removeQueries({ 
        queryKey: ['budget-data', user.id, currentHousehold.id, selectedYear, id, pageType] 
      });
    }
    
    // Reset initialization flag so if user adds data again, it won't be overwritten
    hasInitialized.current = true;
    
    // Dispatch zero values to update the chart immediately
    window.dispatchEvent(new CustomEvent('budgetUpdate', {
      detail: {
        calculatorId: id,
        income: 0,
        totalExpenses: 0,
        netResult: 0,
        housingExpense: 0
      }
    }));
    
    // Notify parent to hide this calculator (only for calculators 2-4)
    if (onEmptyStateChange && id !== '1') {
      onEmptyStateChange(id, true);
    }
  };
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);

  // React Query for loading budget data - cached and won't refetch on window focus
  const { data: budgetQueryData } = useQuery({
    queryKey: ['budget-data', user?.id, currentHousehold?.id, selectedYear, id, pageType],
    queryFn: async () => {
      if (!user || !currentHousehold) return null;
      
      const { data, error } = await supabase
        .from('budget_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .eq('calculator_id', id)
        .eq('page_type', pageType)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading budget data:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user && !!currentHousehold,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Hydrate state from query data ONLY on initial load - never overwrite user edits
  useEffect(() => {
    // Skip if already initialized for this data context
    if (hasInitialized.current) return;
    
    // Skip if still loading (undefined means query hasn't resolved yet)
    if (budgetQueryData === undefined) return;
    
    // Mark as initialized FIRST to prevent any re-runs
    hasInitialized.current = true;
    
    if (budgetQueryData) {
      const income = budgetQueryData.income || 0;
      setMonthlyIncome(income);
      const expensesData = budgetQueryData.expenses as any;
      
      let hydratedExpenses = defaultExpenses;
      let hydratedAdditionalExpenses: ExpenseItem[] = [];
      let hydratedAdditionalSubscriptions: ExpenseItem[] = [];
      let hydratedHousingExpense = 0;
      
      if (expensesData) {
        if (expensesData.fixed) {
          hydratedExpenses = defaultExpenses.map(expense => ({
            ...expense,
            amount: expensesData.fixed[expense.id] || 0
          }));
          setExpenses(hydratedExpenses);
          hydratedHousingExpense = expensesData.fixed['mortgage'] || 0;
        }
        if (expensesData.custom) {
          hydratedAdditionalExpenses = expensesData.custom;
          setAdditionalExpenses(hydratedAdditionalExpenses);
        }
        if (expensesData.additionalSubscriptions) {
          hydratedAdditionalSubscriptions = expensesData.additionalSubscriptions;
          setAdditionalSubscriptions(hydratedAdditionalSubscriptions);
        }
        if (expensesData.subscriptionServices) {
          setSubscriptionServices(expensesData.subscriptionServices);
        }
        if (expensesData.ownerName) {
          setOwnerName(expensesData.ownerName);
          onNameChange(id, expensesData.ownerName);
        }
      }
      
      // Immediately dispatch budget update with hydrated values
      const fixedTotal = hydratedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const additionalTotal = hydratedAdditionalExpenses.reduce((sum, e) => sum + e.amount, 0);
      const subsTotal = hydratedAdditionalSubscriptions.reduce((sum, e) => sum + e.amount, 0);
      const totalExp = fixedTotal + additionalTotal + subsTotal;
      
      window.dispatchEvent(new CustomEvent('budgetUpdate', {
        detail: {
          calculatorId: id,
          income: income,
          totalExpenses: totalExp,
          netResult: income - totalExp,
          housingExpense: hydratedHousingExpense
        }
      }));
    } else {
      // No data found - initialize with defaults and dispatch zero values
      setMonthlyIncome(0);
      setExpenses(defaultExpenses);
      setAdditionalExpenses([]);
      setAdditionalSubscriptions([]);
      setSubscriptionServices({});
      setOwnerName('');
      onNameChange(id, '');
      
      window.dispatchEvent(new CustomEvent('budgetUpdate', {
        detail: {
          calculatorId: id,
          income: 0,
          totalExpenses: 0,
          netResult: 0,
          housingExpense: 0
        }
      }));
    }
  }, [budgetQueryData, id, onNameChange]);

  // Reset initialization flag when key dependencies change (e.g., year)
  useEffect(() => {
    hasInitialized.current = false;
  }, [selectedYear, user?.id, currentHousehold?.id]);

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

  const fixedExpensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const additionalExpensesTotal = additionalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const additionalSubscriptionsTotal = additionalSubscriptions.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalExpenses = fixedExpensesTotal + additionalExpensesTotal + additionalSubscriptionsTotal;
  
  console.log(`Calculator ${id} - Fixed: ${fixedExpensesTotal}, Additional: ${additionalExpensesTotal}, Subs: ${additionalSubscriptionsTotal}, Total: ${totalExpenses}`);
  
  const netResult = monthlyIncome - totalExpenses;

  // Get housing expense (mortgage/rent) for the Major Purchase Toolkit
  const housingExpense = expenses.find(e => e.id === 'mortgage')?.amount || 0;

  useEffect(() => {
    const event = new CustomEvent('budgetUpdate', {
      detail: {
        calculatorId: id,
        income: monthlyIncome,
        totalExpenses: totalExpenses,
        netResult: netResult,
        housingExpense: housingExpense
      }
    });
    window.dispatchEvent(event);
  }, [id, monthlyIncome, totalExpenses, netResult, housingExpense]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };


  return (
    <Card 
      ref={containerRef}
      onBlur={handleContainerBlur}
      className="w-full max-w-md border-[4px] border-stroke shadow-cartoon bg-card relative" 
      data-calculator-id={id}
    >
      {/* Reset button - top right corner */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetCalculator}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-muted h-7 text-xs z-10"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset
      </Button>
      
      <CardHeader className="pb-4 pt-4 bg-teal/10 rounded-t-lg">
        <div className="space-y-3">
          {/* Owner name and Monthly Income - stacked on separate rows */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Calculator {calculatorNumber} Owner
              </Label>
              <Input
                id={`owner-${id}`}
                placeholder="Owner name..."
                value={ownerName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setOwnerName(newName);
                  onNameChange(id, newName);
                }}
                className="text-sm font-semibold h-9 border-2 focus:border-primary transition-colors"
              />
            </div>
            
            <div>
              <Label htmlFor={`income-${id}`} className="text-xs font-semibold text-foreground mb-1.5 block">
                Monthly Income
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
                <Input
                  id={`income-${id}`}
                  type="number"
                  min="0"
                  max="999999"
                  step="1"
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                  className="pl-7 h-9 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Compact remove button - only show if showRemove is true */}
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

      <CardContent className="space-y-4 px-5 py-4">
        {/* Monthly Expenses in two columns */}
        <div>
          <h3 className="text-xs font-semibold text-foreground mb-3">Monthly Expenses</h3>
          
          {/* Responsive layout: single column on mobile, two columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenses.map((expense) => {
              if (!expense.id.startsWith('subscription')) {
                return (
                  <div key={expense.id} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground block">
                      {expense.label}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
                      <Input
                        type="number"
                        min="0"
                        max="999999"
                        step="1"
                        value={expense.amount || ''}
                        onChange={(e) => updateExpense(expense.id, parseInt(e.target.value) || 0)}
                        className="pl-7 h-8 text-sm w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Additional Expenses span full width on mobile, 2 columns on larger screens */}
            {additionalExpenses.map((expense) => (
              <div key={expense.id} className="col-span-1 sm:col-span-2 flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground block">Custom Expense</Label>
                  <Input
                    value={expense.label}
                    onChange={(e) => updateAdditionalExpenseLabel(expense.id, e.target.value)}
                    className="h-8 text-sm min-w-0"
                    placeholder="Expense name"
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <Label className="text-xs text-muted-foreground block">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{currency.symbol}</span>
                    <Input
                      type="number"
                      min="0"
                      max="999999"
                      step="1"
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(expense.id, parseInt(e.target.value) || 0, true)}
                      className="pl-7 h-8 text-sm w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAdditionalExpense(expense.id)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Add Expense Button - spans full width */}
            {additionalExpenses.length < 10 && (
              <div className="col-span-1 sm:col-span-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalExpense}
                  className="w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Expense
                </Button>
              </div>
            )}
            {/* Default Subscription Expenses - full width */}
            {expenses.map((expense, index) => {
              if (expense.id.startsWith('subscription')) {
                return (
                  <div key={expense.id} className="col-span-1 sm:col-span-2">
                    <StreamingServiceSelector
                      value={expense.amount}
                      onChange={(amount) => updateExpense(expense.id, amount)}
                      label={expense.label}
                      expenseId={expense.id}
                      selectedService={subscriptionServices[expense.id] || ''}
                      onServiceChange={(serviceId) => updateSubscriptionService(expense.id, serviceId)}
                      placeholder="subscription option"
                    />
                  </div>
                );
              }
              return null;
            })}

            {/* Additional Subscriptions */}
            {additionalSubscriptions.map((subscription, index) => (
              <div key={subscription.id} className="col-span-1 sm:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <StreamingServiceSelector
                    value={subscription.amount}
                    onChange={(amount) => updateAdditionalSubscription(subscription.id, amount)}
                    label={subscription.label}
                    expenseId={subscription.id}
                    selectedService={subscriptionServices[subscription.id] || ''}
                    onServiceChange={(serviceId) => updateSubscriptionService(subscription.id, serviceId)}
                    placeholder="subscription option"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAdditionalSubscription(subscription.id)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Add Subscription Button */}
            {additionalSubscriptions.length < 10 && (
              <div className="col-span-1 sm:col-span-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalSubscription}
                  className="w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Subscription
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Subtotal and Net Result */}
        <div className="border-t pt-3 space-y-2 relative">
          {!user && totalExpenses > 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-2">Sign up free to see your results</p>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow-sm transition-colors"
              >
                Create Free Account
              </a>
            </div>
          )}
          <div className={!user && totalExpenses > 0 ? 'blur-md select-none' : ''}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Subtotal:</span>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-base font-semibold text-foreground">Net Result:</span>
              <span className={`text-base font-bold ${
                netResult >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(netResult)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Savings Teaser */}
        <AISavingsTeaser
          totalExpenses={totalExpenses}
          monthlyIncome={monthlyIncome}
          formatCurrency={formatCurrency}
        />

      </CardContent>
    </Card>
  );
};

export default BudgetCalculator;
