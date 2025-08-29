import React, { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
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
  const [calculators, setCalculators] = useState<Calculator[]>([{ id: '1' }, { id: '2' }]);
  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number }>>({});
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { earnBadge } = useBadges();

  // Calculate total budget health from all calculators
  const totalIncome = Object.values(budgetData).reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, data) => sum + data.expenses, 0);

  // Listen for budget updates from individual calculators
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

  // Listen for badge earning events
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
    <div className="min-h-screen overflow-x-hidden">
      <SEO 
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical="https://www.housebudgetcalculator.com/budget"
      />
      {/* Hero Section with Light Background */}
      <div className="relative bg-white text-gray-900 py-8 rounded-2xl mx-4 mt-4 mb-6 shadow-xl">
          <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img 
                  src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
                  alt="Calculator mascot" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Monthly Budget Calculator</h1>
              <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
                Plan your household finances with precision
              </p>
            </div>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-8">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={currency.code} onValueChange={(value) => {
            const selectedCurrency = currencies.find(c => c.code === value);
            if (selectedCurrency) setCurrency(selectedCurrency);
          }}>
            <SelectTrigger className="w-64">
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

        {/* Main Content Container - Flexbox Layout with gauge on the right */}
        <div className="flex flex-col xl:flex-row justify-center items-start gap-8 w-full max-w-7xl mx-auto px-4 py-8">
          
          {/* Calculators Container */}
          <div className="flex flex-row flex-wrap justify-center xl:justify-start gap-6 flex-1 w-full">
            {calculators.map((calculator) => (
              <div key={calculator.id} className="w-full md:w-[48%] lg:w-[49%]">
                <BudgetCalculator
                  id={calculator.id}
                  onRemove={() => removeCalculator(calculator.id)}
                  showRemove={calculators.length > 1}
                  pageType="monthly_budget"
                />
              </div>
            ))}
          </div>

          {/* Budget Health Gauge - Right side, locked in position */}
          <div className="flex justify-center w-full xl:w-auto xl:flex-shrink-0">
            <BudgetHealthGauge 
              income={totalIncome} 
              totalExpenses={totalExpenses} 
            />
          </div>
        </div>

        {/* Light Section - Matching Other Pages */}
        <section className="py-16 px-4 bg-white text-gray-900 relative rounded-2xl mx-4 shadow-xl">
          <div className="w-full max-w-4xl mx-auto text-center relative z-10 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              Take Control of Your Finances
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Use our comprehensive budget calculator to plan your financial future and achieve your goals
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Track Every Dollar</h3>
                <p className="text-sm text-gray-600">Monitor income and expenses to see exactly where your money goes each month</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Plan for the Future</h3>
                <p className="text-sm text-gray-600">Build emergency funds and save for major purchases with clear financial planning</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Multiple Scenarios</h3>
                <p className="text-sm text-gray-600">Create separate budgets for different household members or financial situations</p>
              </div>
            </div>
          </div>
        </section>

        {/* AdSense Optimization Content */}
        <section className="mt-16 w-full max-w-4xl mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              How to Use the Monthly Budget Calculator
            </h2>
            <div className="prose prose-sm text-muted-foreground space-y-4">
              <p>
                Our free Monthly Budget Calculator helps you track and manage your household expenses effectively. 
                Simply enter your monthly income and all your regular expenses to see your financial picture at a glance.
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

              <h3 className="text-lg font-medium text-foreground">Why Use a Budget Calculator?</h3>
              <p>
                A monthly budget calculator is essential for financial health. It helps you understand where your money goes, 
                identify unnecessary expenses, and plan for future goals. Whether you're saving for a house, paying off debt, 
                or just trying to make ends meet, having a clear budget is the first step.
              </p>

              <h3 className="text-lg font-medium text-foreground">Tips for Better Budgeting:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Be accurate with income:</strong> Include all sources of monthly income including salary, freelance work, and passive income</li>
                <li><strong>Track every expense:</strong> Don't forget small recurring expenses like subscriptions, apps, and services</li>
                <li><strong>Review monthly:</strong> Update your budget regularly as your circumstances change</li>
                <li><strong>Aim for surplus:</strong> Try to have a positive net result to build emergency savings</li>
                <li><strong>Use multiple calculators:</strong> Separate budgets for different scenarios or household members</li>
                <li><strong>Plan for irregular expenses:</strong> Include annual or quarterly expenses divided by 12</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Who Should Use This Calculator?</h3>
              <p>
                This calculator is perfect for individuals, couples, families, and roommates who want to 
                understand their shared or individual financial responsibilities. Whether you're planning 
                to buy a home, save for a vacation, start a family, or simply want better control over your finances, 
                this tool provides the clarity you need to make informed financial decisions.
              </p>

              <h3 className="text-lg font-medium text-foreground">Start Building Better Financial Habits Today</h3>
              <p>
                Financial planning doesn't have to be complicated. With our intuitive budget calculator, you can 
                start taking control of your finances in minutes. Create multiple budget scenarios, track different 
                household members, and see exactly where you stand financially each month.
              </p>
            </div>
          </div>
        </section>

        <FAQ faqs={budgetCalculatorFAQs} />
        <InternalLinks currentPage="/" category="budgeting" />
        
        {/* Contact Us Section */}
        <section className="mt-12 py-8">
          <div className="text-center">
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
          </div>
        </section>

        {/* AI Chatbot */}
        <AIChatbot 
          pageContext="This is the Monthly Budget Calculator page where users can input their monthly income and expenses to calculate their net budget. Users can add multiple calculators for different household members or scenarios, select different currencies, and save their data if logged in. The page includes pre-configured expense categories and the ability to add custom expenses."
          pageName="Monthly Budget Calculator"
        />
      </div>
  );
};

export default MonthlyBudget;
