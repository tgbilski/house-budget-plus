import React, { useState, useMemo } from 'react';
import { Car, Calculator, TrendingUp, DollarSign, Percent, ExternalLink, Search, Fuel, Shield, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface CarAffordabilityProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  currencySymbol: string;
}

export const CarAffordability: React.FC<CarAffordabilityProps> = ({
  monthlyIncome,
  monthlyExpenses,
  currencySymbol,
}) => {
  // Car loan inputs
  const [downPayment, setDownPayment] = useState(5000);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTermMonths, setLoanTermMonths] = useState(60);
  const [monthlyInsurance, setMonthlyInsurance] = useState(150);
  const [monthlyFuel, setMonthlyFuel] = useState(200);

  // Calculate max car payment using 15% rule (car expenses shouldn't exceed 15% of income)
  const calculations = useMemo(() => {
    const maxCarBudget = monthlyIncome * 0.15;
    const availableForPayment = maxCarBudget - monthlyInsurance - monthlyFuel;
    const safePayment = Math.max(0, availableForPayment);

    // Calculate max car price from monthly payment
    const monthlyRate = interestRate / 100 / 12;
    let maxCarPrice = 0;
    
    if (monthlyRate > 0 && safePayment > 0) {
      // Reverse mortgage calculation: P = PMT * [(1 - (1+r)^-n) / r]
      maxCarPrice = safePayment * ((1 - Math.pow(1 + monthlyRate, -loanTermMonths)) / monthlyRate);
    } else if (safePayment > 0) {
      maxCarPrice = safePayment * loanTermMonths;
    }

    const totalCarPrice = maxCarPrice + downPayment;
    
    // Total cost of ownership over loan term
    const totalInterest = (safePayment * loanTermMonths) - maxCarPrice;
    const totalInsurance = monthlyInsurance * loanTermMonths;
    const totalFuel = monthlyFuel * loanTermMonths;
    const totalOwnershipCost = totalCarPrice + totalInterest + totalInsurance + totalFuel;
    
    // What percentage of income goes to car
    const carExpensePercent = monthlyIncome > 0 ? (maxCarBudget / monthlyIncome) * 100 : 0;

    return {
      maxCarPrice: totalCarPrice,
      monthlyPayment: safePayment,
      maxCarBudget,
      totalOwnershipCost,
      totalInterest: Math.max(0, totalInterest),
      carExpensePercent,
    };
  }, [monthlyIncome, downPayment, interestRate, loanTermMonths, monthlyInsurance, monthlyFuel]);

  const formatCurrency = (value: number) => {
    return `${currencySymbol}${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Max Car Price</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(calculations.maxCarPrice)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Including {formatCurrency(downPayment)} down
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(calculations.monthlyPayment)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Loan only (excl. insurance/fuel)
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(calculations.maxCarBudget)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            15% of monthly income
          </p>
        </div>
      </div>

      {/* 15% Rule Explanation */}
      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <Calculator className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">The 15% Rule</p>
            <p className="text-sm text-muted-foreground">
              Financial experts recommend spending no more than 15% of your monthly income on total car expenses 
              (payment + insurance + fuel). This ensures your car doesn't strain your budget.
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Terms */}
        <div className="space-y-5">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Loan Terms
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Down Payment</Label>
              <span className="text-sm font-medium">{formatCurrency(downPayment)}</span>
            </div>
            <Slider
              value={[downPayment]}
              onValueChange={(v) => setDownPayment(v[0])}
              min={0}
              max={30000}
              step={500}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Interest Rate (APR)</Label>
              <span className="text-sm font-medium">{interestRate.toFixed(1)}%</span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={(v) => setInterestRate(v[0])}
              min={0}
              max={20}
              step={0.25}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Loan Term</Label>
              <span className="text-sm font-medium">{loanTermMonths} months ({Math.round(loanTermMonths / 12)} years)</span>
            </div>
            <Slider
              value={[loanTermMonths]}
              onValueChange={(v) => setLoanTermMonths(v[0])}
              min={24}
              max={84}
              step={12}
              className="w-full"
            />
          </div>
        </div>

        {/* Running Costs */}
        <div className="space-y-5">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Monthly Running Costs
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Insurance
              </Label>
              <span className="text-sm font-medium">{formatCurrency(monthlyInsurance)}</span>
            </div>
            <Slider
              value={[monthlyInsurance]}
              onValueChange={(v) => setMonthlyInsurance(v[0])}
              min={50}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                Fuel / Charging
              </Label>
              <span className="text-sm font-medium">{formatCurrency(monthlyFuel)}</span>
            </div>
            <Slider
              value={[monthlyFuel]}
              onValueChange={(v) => setMonthlyFuel(v[0])}
              min={50}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-muted/20 rounded-lg p-4 border border-border/30 mt-4">
            <p className="text-sm font-medium text-foreground mb-2">Monthly Breakdown</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Payment</span>
                <span className="font-medium">{formatCurrency(calculations.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance</span>
                <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fuel</span>
                <span className="font-medium">{formatCurrency(monthlyFuel)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(calculations.maxCarBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Cost of Ownership */}
      <div className="bg-muted/20 rounded-xl p-5 border border-border/30">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Total Cost of Ownership ({loanTermMonths} months)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Car Price</p>
            <p className="font-semibold text-foreground">{formatCurrency(calculations.maxCarPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Interest Paid</p>
            <p className="font-semibold text-foreground">{formatCurrency(calculations.totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Insurance + Fuel</p>
            <p className="font-semibold text-foreground">{formatCurrency((monthlyInsurance + monthlyFuel) * loanTermMonths)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Ownership Cost</p>
            <p className="font-bold text-primary text-lg">{formatCurrency(calculations.totalOwnershipCost)}</p>
          </div>
        </div>
      </div>

      {/* Find Cars CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2 justify-center sm:justify-start">
              <Search className="h-5 w-5 text-primary" />
              Ready to Browse Cars?
            </h5>
            <p className="text-sm text-muted-foreground">
              Search for cars up to {formatCurrency(calculations.maxCarPrice)}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://www.cargurus.com/Cars/new/searchresults.action?maxPrice=${Math.round(calculations.maxCarPrice)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2 shadow-cartoon border-[3px] border-stroke hover:translate-y-[-2px] hover:shadow-cartoon-hover transition-all">
                <Car className="h-4 w-4" />
                CarGurus
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
            <a
              href={`https://www.autotrader.com/cars-for-sale?maxPrice=${Math.round(calculations.maxCarPrice)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 border-[3px] border-stroke hover:translate-y-[-2px] transition-all">
                Autotrader
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> These calculations are estimates for educational purposes. 
          Actual car prices, loan rates, and running costs vary. Does not include maintenance, 
          registration, taxes, or depreciation. Consult with your lender for accurate loan terms.
        </p>
      </div>
    </div>
  );
};
