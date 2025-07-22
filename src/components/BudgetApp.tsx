import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetCalculator from './BudgetCalculator';

interface Calculator {
  id: string;
}

const BudgetApp: React.FC = () => {
  const [calculators, setCalculators] = useState<Calculator[]>([{ id: '1' }]);

  const addCalculator = () => {
    const newId = (calculators.length + 1).toString();
    setCalculators([...calculators, { id: newId }]);
  };

  const removeCalculator = (calculatorId: string) => {
    if (calculators.length > 1) {
      setCalculators(calculators.filter(calc => calc.id !== calculatorId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          House Budget Calculator
        </h1>
        <p className="text-muted-foreground text-lg">
          Plan your household finances with precision
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-6 justify-center">
          {/* Calculator Containers */}
          {calculators.map((calculator) => (
            <div key={calculator.id} className="relative">
              <BudgetCalculator
                id={calculator.id}
                onRemove={() => removeCalculator(calculator.id)}
                showRemove={calculators.length > 1}
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
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t border-border">
        <p className="text-muted-foreground">
          Free House Budget Calculator - Take control of your finances today
        </p>
      </footer>
    </div>
  );
};

export default BudgetApp;