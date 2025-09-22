// src/pages/Vacation.tsx
import React from 'react';
import { Plane, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { FAQ } from '@/components/FAQ';
import { WarningBanner } from '@/components/WarningBanner';
import { seoData } from '@/utils/seoData';

// Import our new hook and component!
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationCard } from '@/components/VacationCard';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();

  // Our hook does all the heavy lifting now!
  const {
    options,
    isLoading,
    totalBudget,
    bestOption,
    updateVacationOption,
    resetVacationOption,
  } = useVacationPlanner({ user, year: selectedYear });
  
  const vacationPlanningFAQs = [
    { question: "How do I compare vacation options effectively?", answer: "Use our vacation comparison tool to evaluate different destinations based on cost, activities, weather, and personal preferences. Fill out the evaluation criteria for each option to get a comprehensive comparison." },
    { question: "What costs should I include in my vacation budget?", answer: "Include travel costs, lodging, transportation at the destination, food, activities, and shopping. Don't forget to budget for unexpected expenses." },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Planning your getaways...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={seoData.vacation.title}
        description={seoData.vacation.description}
        keywords={seoData.vacation.keywords}
        canonical="/vacation"
      />

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vacation Planner</h1>
                <p className="text-sm text-gray-600">Plan and budget your dream getaways</p>
              </div>
            </div>
            <YearSelector />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <WarningBanner />

        {!user && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> -
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your vacation plans
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Budget of All Options</h3>
              <div className="text-3xl font-bold text-primary">{currency.symbol}{totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Options Compared</h3>
              <div className="text-3xl font-bold text-primary">{options.filter(opt => opt.destination).length} / 3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Top Rated Option</h3>
              <div className="text-xl font-bold text-primary truncate">{bestOption?.destination || 'N/A'}</div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < (bestOption?.score || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The new side-by-side card layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {options.map(option => (
            <VacationCard
              key={option.id}
              option={option}
              onUpdate={updateVacationOption}
              onReset={resetVacationOption}
              currencySymbol={currency.symbol}
            />
          ))}
        </div>

        <FAQ faqs={vacationPlanningFAQs} />
      </div>
    </div>
  );
};

export default Vacation;
