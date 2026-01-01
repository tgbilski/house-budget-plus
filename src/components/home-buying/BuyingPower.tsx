import React, { useState, useMemo } from 'react';
import { Home, Calculator, TrendingUp, DollarSign, Percent, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface BuyingPowerProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  currencySymbol: string;
}

export const BuyingPower: React.FC<BuyingPowerProps> = ({
  monthlyIncome,
  monthlyExpenses,
  currencySymbol,
}) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [monthlyDebts, setMonthlyDebts] = useState(0);
  const [paymentPercent, setPaymentPercent] = useState(100);

  const annualIncome = monthlyIncome * 12;

  // Calculate DTI (Debt-to-Income ratio)
  const currentDTI = monthlyIncome > 0 
    ? ((monthlyDebts + monthlyExpenses) / monthlyIncome) * 100 
    : 0;

  // Calculate max affordable monthly payment (28% rule for housing)
  const maxHousingPayment = monthlyIncome * 0.28;
  
  // Calculate max monthly payment considering total DTI (43% max)
  const maxTotalDTI = 0.43;
  const availableForHousing = Math.min(
    maxHousingPayment,
    (monthlyIncome * maxTotalDTI) - monthlyDebts
  );

  // Calculate max loan amount based on monthly payment
  const calculateMaxLoan = (monthlyPayment: number) => {
    if (monthlyPayment <= 0 || interestRate <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    // Subtract estimated taxes & insurance (about 25% of payment)
    const principalInterestPayment = monthlyPayment * 0.75;
    const loanAmount = principalInterestPayment * 
      ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    return Math.max(0, loanAmount);
  };

  // Apply payment percentage adjustment
  const adjustedMonthlyPayment = availableForHousing * (paymentPercent / 100);

  // Calculate home prices for different scenarios
  const calculations = useMemo(() => {
    const maxLoan = calculateMaxLoan(adjustedMonthlyPayment);
    const homePrice = maxLoan / (1 - downPaymentPercent / 100);
    const downPayment = homePrice * (downPaymentPercent / 100);
    
    // Closing costs (typically 2-5% of home price)
    const closingCostsLow = homePrice * 0.02;
    const closingCostsHigh = homePrice * 0.05;
    
    // Down payment scenarios
    const scenarios = [
      { percent: 5, label: 'Low (5%)' },
      { percent: 10, label: 'Standard (10%)' },
      { percent: 20, label: 'Ideal (20%)' },
    ].map(s => {
      const scenarioHomePrice = maxLoan / (1 - s.percent / 100);
      const scenarioDownPayment = scenarioHomePrice * (s.percent / 100);
      return {
        ...s,
        homePrice: scenarioHomePrice,
        downPayment: scenarioDownPayment,
      };
    });

    return {
      maxLoan,
      homePrice,
      downPayment,
      closingCostsLow,
      closingCostsHigh,
      monthlyPayment: adjustedMonthlyPayment,
      maxMonthlyPayment: availableForHousing,
      scenarios,
    };
  }, [adjustedMonthlyPayment, availableForHousing, downPaymentPercent, interestRate, loanTermYears]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Result Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-4 sm:p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h4 className="text-base sm:text-lg font-semibold text-foreground">Your Home Buying Power</h4>
        </div>
        
        <div className="text-center py-3 sm:py-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Estimated Max Home Price</p>
          <p className="text-3xl sm:text-5xl font-bold text-primary">
            {currencySymbol}{Math.round(calculations.homePrice).toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            with {downPaymentPercent}% down ({currencySymbol}{Math.round(calculations.downPayment).toLocaleString()})
          </p>
        </div>
      </div>

      {/* Adjustable Inputs */}
      <div className="bg-muted/30 rounded-xl p-4 sm:p-5 border border-border/50 space-y-4 sm:space-y-5">
        <h5 className="font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
          <Calculator className="h-4 w-4" />
          Adjust Your Scenario
        </h5>

        {/* Monthly Payment Limit Slider */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs sm:text-sm">Max Monthly Payment</Label>
            <span className="text-xs sm:text-sm font-medium text-primary">
              {paymentPercent}% ({currencySymbol}{Math.round(adjustedMonthlyPayment).toLocaleString()})
            </span>
          </div>
          <Slider
            value={[paymentPercent]}
            onValueChange={(v) => setPaymentPercent(v[0])}
            min={50}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50% ({currencySymbol}{Math.round(availableForHousing * 0.5).toLocaleString()})</span>
            <span>100% ({currencySymbol}{Math.round(availableForHousing).toLocaleString()})</span>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs sm:text-sm">Down Payment</Label>
            <span className="text-xs sm:text-sm font-medium text-primary">{downPaymentPercent}%</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(v) => setDownPaymentPercent(v[0])}
            min={3}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs sm:text-sm">Interest Rate</Label>
            <span className="text-xs sm:text-sm font-medium">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(v) => setInterestRate(v[0])}
            min={3}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Monthly Debts */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Other Monthly Debts (car, student loans, etc.)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currencySymbol}
            </span>
            <Input
              type="number"
              value={monthlyDebts || ''}
              onChange={(e) => setMonthlyDebts(Number(e.target.value) || 0)}
              className="pl-8"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Down Payment Scenarios */}
      <div className="space-y-2 sm:space-y-3">
        <h5 className="font-medium text-foreground text-sm sm:text-base">Down Payment Scenarios</h5>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {calculations.scenarios.map((scenario) => (
            <div 
              key={scenario.percent}
              className={`bg-card rounded-xl p-2 sm:p-4 border transition-all cursor-pointer ${
                scenario.percent === downPaymentPercent 
                  ? 'border-primary shadow-md' 
                  : 'border-border/50 hover:border-primary/50'
              }`}
              onClick={() => setDownPaymentPercent(scenario.percent)}
            >
              <p className="text-xs text-muted-foreground mb-1 truncate">{scenario.label}</p>
              <p className="text-sm sm:text-lg font-bold text-foreground truncate">
                {currencySymbol}{Math.round(scenario.homePrice / 1000)}k
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {currencySymbol}{Math.round(scenario.downPayment).toLocaleString()} down
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Monthly Payment</p>
          </div>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {currencySymbol}{Math.round(calculations.monthlyPayment).toLocaleString()}
          </p>
        </div>

        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Your DTI Ratio</p>
          </div>
          <p className={`text-base sm:text-lg font-bold ${currentDTI > 43 ? 'text-red-500' : 'text-foreground'}`}>
            {currentDTI.toFixed(1)}%
          </p>
        </div>

        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 col-span-2">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Estimated Closing Costs</p>
          </div>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {currencySymbol}{Math.round(calculations.closingCostsLow).toLocaleString()} - {currencySymbol}{Math.round(calculations.closingCostsHigh).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Find Homes CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-4 sm:p-5 border border-primary/20">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2 justify-center sm:justify-start text-sm sm:text-base">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Ready to Browse Homes?
            </h5>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search for homes up to {currencySymbol}{Math.round(calculations.homePrice).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <a
              href={`https://www.zillow.com/homes/for_sale/?searchQueryState=${encodeURIComponent(JSON.stringify({
                filterState: {
                  price: { max: Math.round(calculations.homePrice) }
                }
              }))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto gap-2 shadow-cartoon border-[3px] border-stroke hover:translate-y-[-2px] hover:shadow-cartoon-hover transition-all text-sm">
                <Home className="h-4 w-4" />
                Zillow
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
            <a
              href={`https://www.realtor.com/realestateandhomes-search?price_max=${Math.round(calculations.homePrice)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full sm:w-auto gap-2 border-[3px] border-stroke hover:translate-y-[-2px] transition-all text-sm">
                Realtor.com
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/20 rounded-xl p-3 sm:p-4 border border-border/30">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> These calculations are estimates based on the 28% housing rule and 43% total DTI ratio. 
          Actual loan approval depends on credit score, employment history, and lender requirements. 
          Always consult with a mortgage professional before making decisions.
        </p>
      </div>
    </div>
  );
};
