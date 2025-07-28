import React, { useState, useContext, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetCalculator from './BudgetCalculator';
import { CurrencyContext } from '@/App';

interface Calculator {
  id: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

const currencies: Currency[] = [
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

const BudgetApp: React.FC = () => {
  console.log('BudgetApp rendering...');
  
  const [calculators, setCalculators] = useState<Calculator[]>([{ id: '1' }]);
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to USD

  useEffect(() => {
    console.log('BudgetApp mounted successfully');
  }, []);

  const addCalculator = () => {
    console.log('Adding calculator...');
    const newId = (calculators.length + 1).toString();
    setCalculators([...calculators, { id: newId }]);
  };

  const removeCalculator = (calculatorId: string) => {
    console.log('Removing calculator:', calculatorId);
    if (calculators.length > 1) {
      setCalculators(calculators.filter(calc => calc.id !== calculatorId));
    }
  };

  console.log('Rendering with calculators:', calculators);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="text-center py-4 px-2 sm:py-6 sm:px-4">
          <div className="flex justify-center mb-3">
            <img 
              src="/lovable-uploads/5377daa4-3f84-4748-a91b-081403394030.png" 
              alt="House Budget Calculator"
              className="h-24 w-auto sm:h-32"
            />
          </div>
          <p className="text-muted-foreground text-base sm:text-lg mb-4">
            Plan your household finances with precision
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currency.code} onValueChange={(value) => {
              console.log('Currency changing to:', value);
              const selectedCurrency = currencies.find(c => c.code === value);
              if (selectedCurrency) setCurrency(selectedCurrency);
            }}>
              <SelectTrigger className="w-40 sm:w-48">
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
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl mx-auto mb-4 px-2">
            Simply add your monthly income, then add monthly expenses to see if you have money left over! Use the plus sign to add a spouse or roommate to split the costs!
          </p>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-2 sm:px-4 pb-6">
          <div className="flex flex-wrap gap-3 sm:gap-6 justify-center">
            {/* Calculator Containers */}
            {calculators.map((calculator) => {
              console.log('Rendering calculator:', calculator.id);
              return (
                <div key={calculator.id} className="relative">
                  <BudgetCalculator
                    id={calculator.id}
                    onRemove={() => removeCalculator(calculator.id)}
                    showRemove={calculators.length > 1}
                  />
                </div>
              );
            })}

            {/* Add New Calculator Button */}
            <div className="flex items-center justify-center">
              <Button
                onClick={addCalculator}
                variant="outline"
                size="lg"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </Button>
            </div>
          </div>

          {/* AdSense Optimization Content */}
          <section className="mt-8 sm:mt-12 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
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
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 border-t border-border">
          <p className="text-muted-foreground">
            Free House Budget Calculator - Take control of your finances today
          </p>
        </footer>
      </div>
    </CurrencyContext.Provider>
  );
};

export default BudgetApp;
