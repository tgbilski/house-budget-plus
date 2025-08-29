// src/pages/MonthlyBudget.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Globe, PiggyBank, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetCalculator from '@/components/BudgetCalculator';
import { BudgetHealthGauge } from '@/components/BudgetHealthGauge';
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
  const { currency, setCurrency } = useCurrency();
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
      setCalculators(uniqueCalculators.map(id => ({ id })));
    }
  };

  const addCalculator = () => {
    const newId = (parseInt(calculators[calculators.length - 1].id) + 1).toString();
    setCalculators([...calculators, { id: newId }]);
  };
  
  // New function to update the name for a specific calculator
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
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      <SEO 
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical="https://www.housebudgetcalculator.com/budget"
      />
      <div className="relative pt-8 pb-16">
        <div
          className="w-full max-w-6xl mx-auto px-4"
        >
          <div className="relative py-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
                alt="Calculator mascot" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Monthly Budget Calculator</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take control of your finances by tracking every dollar of your household income and expenses.
            </p>
          </div>
          
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currency.code} onValueChange={(value) => {
              const selectedCurrency = currencies.find(c => c.code === value);
              if (selectedCurrency) setCurrency(selectedCurrency);
            }}>
              <SelectTrigger className="w-[150px] md:w-[180px] border-none text-sm bg-gray-50/50">
                <SelectValue placeholder="Currency" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
            {summaryData.map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-1">{item.title}</h3>
                  <p className={`text-3xl font-bold ${item.color}`}>{currency.symbol}{item.value.toLocaleString()}</p>
                </div>
                <item.icon className={`w-10 h-10 ${item.color}`} />
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row flex-wrap justify-center items-start gap-4 mb-8">
            {calculators.map((calculator) => (
              <div key={calculator.id} className="w-full md:w-auto min-w-[300px] flex-1">
                <BudgetCalculator
                  id={calculator.id}
                  showRemove={calculators.length > 1}
                  onRemove={() => setCalculators(calculators.filter(c => c.id !== calculator.id))}
                  onNameChange={handleNameChange} // Pass the new prop
                  pageType="monthly_budget"
                />
              </div>
            ))}
            <div className="w-full md:w-auto min-w-[300px] max-w-xs flex-shrink-0 flex justify-center">
              <BudgetHealthGauge 
                income={totalIncome} 
                totalExpenses={totalExpenses} 
              />
            </div>
          </div>

          <div className="text-center my-8">
            <Button onClick={addCalculator} className="group transition-all duration-300 transform-gpu hover:scale-105">
              <Plus className="h-4 w-4 mr-2" /> Add Another Budget
            </Button>
          </div>

          <section className="py-16 bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-100 mt-8">
            <div className="w-full max-w-4xl mx-auto text-center px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Take Control of Your Finances
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Use our comprehensive budget calculator to plan your financial future and achieve your goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold mb-2">Track Every Dollar</h3>
                  <p className="text-sm text-gray-600">Monitor income and expenses to see exactly where your money goes each month.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold mb-2">Plan for the Future</h3>
                  <p className="text-sm text-gray-600">Build emergency funds and save for major purchases with clear financial planning.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold mb-2">Multiple Scenarios</h3>
                  <p className="text-sm text-gray-600">Create separate budgets for different household members or financial situations.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 w-full max-w-4xl mx-auto px-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How to Use the Monthly Budget Calculator
              </h2>
              <div className="prose prose-sm text-muted-foreground space-y-4">
                <p>
                  Our free Monthly Budget Calculator helps you track and manage your household expenses effectively. Simply enter your monthly income and all your regular expenses to see your financial picture at a glance.
                </p>
                
                <h3 className="text-lg font-medium text-foreground">Key Features:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Track monthly income and expenses for multiple household members</li>
                  <li>Pre-configured expense categories for common household costs</li>
                  <li>Add up to 10 custom expense categories per person</li>
                  <li>Real-time calculation of your net budget result</li>
                  <li>Easy-to-use interface with clear visual feedback</li>
                  <li>Support for multiple currencies (USD, EUR, GBP, and more)</li>
                  <li>Save your budgets when you create an account</li>
                </ul>
              </div>
            </div>
          </section>

          <FAQ faqs={budgetCalculatorFAQs} />
          <InternalLinks currentPage="/" category="budgeting" />
          
          <section className="mt-12 py-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">Need Help or Have Feedback?</h3>
            <p className="text-muted-foreground mb-6">
              We're here to help you succeed with your budgeting journey. Get in touch with questions, suggestions, or feedback.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
            >
              Contact Us
            </Button>
          </section>

          <AIChatbot 
            pageContext="This is the Monthly Budget Calculator page where users can input their monthly income and expenses to calculate their net budget. Users can add multiple calculators for different household members or scenarios, select different currencies, and save their data if logged in. The page includes pre-configured expense categories and the ability to add custom expenses."
            pageName="Monthly Budget Calculator"
            additionalContext={{ calculatorNames }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudget;
