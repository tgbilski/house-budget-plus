import React, { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetCalculator from '@/components/BudgetCalculator';
import { useCurrency } from '@/components/BudgetApp';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Calculator {
  id: string;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
];

const MonthlyBudget: React.FC = () => {
  const [calculators, setCalculators] = useState<Calculator[]>([{ id: '1' }]);
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCalculators();
    }
  }, [user]);

  const loadCalculators = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('calculator_id')
      .eq('user_id', user.id)
      .eq('page_type', 'monthly_budget');

    if (data && data.length > 0) {
      const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
      setCalculators(uniqueCalculators.map(id => ({ id })));
    }
  };

  const addCalculator = () => {
    const newId = (calculators.length + 1).toString();
    setCalculators([...calculators, { id: newId }]);
  };

  const removeCalculator = (calculatorId: string) => {
    if (calculators.length > 1) {
      setCalculators(calculators.filter(calc => calc.id !== calculatorId));
      
      // Also remove from database if user is logged in
      if (user) {
        supabase
          .from('budget_data')
          .delete()
          .eq('user_id', user.id)
          .eq('calculator_id', calculatorId)
          .eq('page_type', 'monthly_budget');
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Monthly Budget Calculator</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Plan your household finances with precision{!user && ' (sign up to save)'}
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currency.code} onValueChange={(value) => {
              const selectedCurrency = currencies.find(c => c.code === value);
              if (selectedCurrency) setCurrency(selectedCurrency);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{curr.symbol}</span>
                      <span>{curr.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instructional Text */}
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-6">
            Simply add your monthly income, then add monthly expenses to see if you have money left over! Use the plus sign to add a spouse or roommate to split the costs!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-wrap gap-6 justify-center mb-16">
          {/* Calculator Containers */}
          {calculators.map((calculator) => (
            <div key={calculator.id} className="relative">
              <BudgetCalculator
                id={calculator.id}
                onRemove={() => removeCalculator(calculator.id)}
                showRemove={calculators.length > 1}
                pageType="monthly_budget"
              />
            </div>
          ))}

          {/* Add New Calculator Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={addCalculator}
              variant="outline"
              size="lg"
              className="h-20 w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
            >
              <Plus className="h-8 w-8 text-primary" />
            </Button>
          </div>
        </div>

        {/* AdSense Optimization Content */}
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              How to Use the House Budget Calculator
            </h2>
            <div className="prose prose-sm text-muted-foreground space-y-4">
              <p>
                Our House Budget Calculator helps you track and manage your household expenses effectively. 
                Simply enter your monthly income and all your regular expenses to see your financial picture at a glance.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Track monthly income and expenses for multiple household members</li>
                <li>Pre-configured expense categories for common household costs</li>
                <li>Add up to 10 custom expense categories per person</li>
                <li>Real-time calculation of your net budget result</li>
                <li>Easy-to-use interface with clear visual feedback</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Tips for Better Budgeting:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Be accurate with your income - include all sources of monthly income</li>
                <li>Don't forget small recurring expenses like subscriptions</li>
                <li>Review and update your budget monthly</li>
                <li>Aim for a positive net result to build savings</li>
                <li>Use separate calculators for different household members or scenarios</li>
              </ul>

              <p>
                This calculator is perfect for individuals, couples, families, and roommates who want to 
                understand their shared or individual financial responsibilities. Whether you're planning 
                to buy a home, save for a vacation, or simply want better control over your finances, 
                this tool provides the clarity you need.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MonthlyBudget;