// src/pages/MonthlyBudget.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Globe, PiggyBank, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetCalculator from '@/components/BudgetCalculator';

import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { budgetCalculatorFAQs } from '@/utils/faqData';
import { AIChatbot } from '@/components/AIChatbot';

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
  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number }>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});
  const { currency } = useCurrency();
  const { user } = useAuth();
  const { earnBadge } = useBadges();

  const totalIncome = Object.values(budgetData).reduce((sum, data) => sum + (data.income || 0), 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, data) => sum + (data.expenses || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  useEffect(() => {
    const handleBudgetUpdate = (event: CustomEvent) => {
      const { calculatorId, income, totalExpenses } = event.detail;
      setBudgetData(prev => ({
        ...prev,
        [calculatorId]: { income: income || 0, expenses: totalExpenses || 0 }
      }));
    };

    window.addEventListener('budgetUpdate', handleBudgetUpdate as EventListener);
    return () => window.removeEventListener('budgetUpdate', handleBudgetUpdate as EventListener);
  }, []);

  useEffect(() => {
    const handleEarnBadge = (event: CustomEvent) => {
      const { badgeType } = event.detail;
      earnBadge(badgeType);
    };

    window.addEventListener('earnBadge', handleEarnBadge as EventListener);
    return () => window.removeEventListener('earnBadge', handleEarnBadge as EventListener);
  }, [earnBadge]);

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
      // Sort calculator IDs numerically
      const sortedCalculators = uniqueCalculators.sort((a, b) => parseInt(a) - parseInt(b));
      setCalculators(sortedCalculators.map(id => ({ id })));
    }
  };

  const addCalculator = () => {
    if (calculators.length >= 4) {
      return; // Limit to 4 calculators
    }
    // Find the next available number (1-4)
    const existingIds = calculators.map(c => parseInt(c.id));
    let newId = 1;
    while (existingIds.includes(newId) && newId <= 4) {
      newId++;
    }
    setCalculators([...calculators, { id: newId.toString() }]);
  };

  const removeCalculator = async (calculatorId: string) => {
    if (!user) return;

    // Delete from database
    await supabase
      .from('budget_data')
      .delete()
      .eq('user_id', user.id)
      .eq('calculator_id', calculatorId)
      .eq('page_type', 'monthly_budget');

    // Remove from state
    setCalculators(calculators.filter(c => c.id !== calculatorId));
    
    // Clean up related state
    setBudgetData(prev => {
      const newData = { ...prev };
      delete newData[calculatorId];
      return newData;
    });
    
    setCalculatorNames(prev => {
      const newNames = { ...prev };
      delete newNames[calculatorId];
      return newNames;
    });
  };
  
  const handleNameChange = (id: string, name: string) => {
    setCalculatorNames(prev => ({
      ...prev,
      [id]: name
    }));
  };

  const summaryData = [
    { title: 'Total Income', value: totalIncome, icon: PiggyBank, color: 'text-green-500' },
    { title: 'Total Expenses', value: totalExpenses, icon: Receipt, color: 'text-red-500' },
    { title: 'Net Balance', value: netBalance, icon: DollarSign, color: netBalance >= 0 ? 'text-blue-500' : 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical="https://www.housebudgetcalculator.com/budget"
      />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <img 
              src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
              alt="Calculator mascot" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Monthly Budget Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Take control of your finances by tracking every dollar of your household income and expenses.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryData.map((item) => (
            <div key={item.title} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {currency.symbol}{item.value.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-full">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Budget Calculators */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Budget Calculators</h2>
              <Button 
                onClick={addCalculator} 
                disabled={calculators.length >= 4}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Budget ({calculators.length}/4)
              </Button>
            </div>
            
            <div className="space-y-6">
              {calculators.map((calculator) => (
                <BudgetCalculator
                  key={calculator.id}
                  id={calculator.id}
                  calculatorNumber={parseInt(calculator.id)}
                  showRemove={calculators.length > 1}
                  onRemove={() => removeCalculator(calculator.id)}
                  onNameChange={handleNameChange}
                  pageType="monthly_budget"
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Tips */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Track every expense to see where your money really goes</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Aim to save at least 20% of your income</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Review and adjust your budget monthly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-card rounded-xl border p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Use Our Budget Calculator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Track Every Dollar</h3>
              <p className="text-sm text-muted-foreground">Monitor income and expenses to see exactly where your money goes each month.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Plan for the Future</h3>
              <p className="text-sm text-muted-foreground">Build emergency funds and save for major purchases with clear financial planning.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Multiple Scenarios</h3>
              <p className="text-sm text-muted-foreground">Create separate budgets for different household members or financial situations.</p>
            </div>
          </div>
        </div>

        {/* FAQ and Additional Content */}
        <div className="space-y-8">
          <FAQ faqs={budgetCalculatorFAQs} />
          <InternalLinks currentPage="/" category="budgeting" />
        </div>

        {/* Contact Section */}
        <div className="bg-card rounded-xl border p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Get in touch with questions, suggestions, or feedback about our budget calculator.
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
          >
            Contact Us
          </Button>
        </div>

        <AIChatbot 
          pageContext="This is the Monthly Budget Calculator page where users can input their monthly income and expenses to calculate their net budget. Users can add multiple calculators for different household members or scenarios, select different currencies, and save their data if logged in. The page includes pre-configured expense categories and the ability to add custom expenses."
          pageName="Monthly Budget Calculator"
          calculatorsData={Object.entries(calculatorNames).map(([id, name]) => ({ calculatorId: id, ownerName: name }))}
        />
      </div>
    </div>
  );
};

export default MonthlyBudget;
