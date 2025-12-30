import React, { useState, useMemo } from 'react';
import { Home, Building, TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface RentVsBuyProps {
  monthlyIncome: number;
  currentRent: number;
  currencySymbol: string;
}

export const RentVsBuy: React.FC<RentVsBuyProps> = ({
  monthlyIncome,
  currentRent,
  currencySymbol,
}) => {
  const [rent, setRent] = useState(currentRent || 1500);
  const [rentIncrease, setRentIncrease] = useState(3); // Annual rent increase %
  const [homePrice, setHomePrice] = useState(300000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [homeAppreciation, setHomeAppreciation] = useState(3); // Annual home appreciation %
  const [yearsToCompare, setYearsToCompare] = useState(10);

  const calculations = useMemo(() => {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = 30 * 12;
    
    // Monthly mortgage payment (P&I only)
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Estimated monthly costs for homeownership
    const monthlyTaxes = (homePrice * 0.012) / 12; // ~1.2% annual property tax
    const monthlyInsurance = (homePrice * 0.004) / 12; // ~0.4% annual insurance
    const monthlyMaintenance = (homePrice * 0.01) / 12; // ~1% annual maintenance
    const totalMonthlyOwnership = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyMaintenance;

    // Calculate totals over the comparison period
    let totalRentPaid = 0;
    let totalOwnershipPaid = 0;
    let currentRentPayment = rent;
    
    for (let year = 1; year <= yearsToCompare; year++) {
      totalRentPaid += currentRentPayment * 12;
      totalOwnershipPaid += totalMonthlyOwnership * 12;
      currentRentPayment *= (1 + rentIncrease / 100);
    }

    // Calculate equity built and home value
    const futureHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearsToCompare);
    const homeEquityGain = futureHomeValue - homePrice;
    
    // Simplified equity from payments (about 30% of P&I goes to principal in early years)
    const estimatedEquityFromPayments = monthlyPI * 0.3 * 12 * yearsToCompare;
    const totalEquity = downPayment + estimatedEquityFromPayments + homeEquityGain;

    // Net cost comparison
    const netRentCost = totalRentPaid;
    const netOwnershipCost = totalOwnershipPaid - totalEquity;

    // Breakeven year (when ownership becomes cheaper)
    let breakevenYear = 0;
    let cumulativeRent = 0;
    let cumulativeOwnership = 0;
    let yearlyRent = rent * 12;
    
    for (let year = 1; year <= 30; year++) {
      cumulativeRent += yearlyRent;
      cumulativeOwnership += totalMonthlyOwnership * 12;
      const yearEquity = downPayment + (monthlyPI * 0.3 * 12 * year) + 
        (homePrice * (Math.pow(1 + homeAppreciation / 100, year) - 1));
      
      if (cumulativeOwnership - yearEquity < cumulativeRent && breakevenYear === 0) {
        breakevenYear = year;
      }
      yearlyRent *= (1 + rentIncrease / 100);
    }

    const buyingIsBetter = netOwnershipCost < netRentCost;

    return {
      monthlyPI,
      totalMonthlyOwnership,
      totalRentPaid,
      totalOwnershipPaid,
      futureHomeValue,
      totalEquity,
      netRentCost,
      netOwnershipCost,
      breakevenYear: breakevenYear || 'N/A',
      buyingIsBetter,
      monthlyDifference: totalMonthlyOwnership - rent,
      downPayment,
    };
  }, [rent, rentIncrease, homePrice, downPaymentPercent, interestRate, homeAppreciation, yearsToCompare]);

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rent Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-xl p-5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-5 w-5 text-amber-600" />
            <h4 className="font-semibold text-foreground">Renting</h4>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            {currencySymbol}{rent.toLocaleString()}<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {currencySymbol}{Math.round(calculations.netRentCost).toLocaleString()} total over {yearsToCompare} years
          </p>
        </div>

        {/* Buy Card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Home className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Buying</h4>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            {currencySymbol}{Math.round(calculations.totalMonthlyOwnership).toLocaleString()}<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {currencySymbol}{Math.round(calculations.netOwnershipCost).toLocaleString()} net cost over {yearsToCompare} years
          </p>
        </div>
      </div>

      {/* Verdict */}
      <div className={`rounded-xl p-5 border ${
        calculations.buyingIsBetter 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            calculations.buyingIsBetter ? 'bg-green-500/20' : 'bg-amber-500/20'
          }`}>
            {calculations.buyingIsBetter ? (
              <Home className="h-6 w-6 text-green-600" />
            ) : (
              <Building className="h-6 w-6 text-amber-600" />
            )}
          </div>
          <div>
            <p className={`font-semibold text-lg ${
              calculations.buyingIsBetter ? 'text-green-600' : 'text-amber-600'
            }`}>
              {calculations.buyingIsBetter ? 'Buying wins!' : 'Renting is better for now'}
            </p>
            <p className="text-sm text-muted-foreground">
              {calculations.buyingIsBetter 
                ? `Over ${yearsToCompare} years, buying saves you ${currencySymbol}${Math.round(calculations.netRentCost - calculations.netOwnershipCost).toLocaleString()} compared to renting.`
                : `At current rates, renting costs less. Breakeven point is around year ${calculations.breakevenYear}.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Adjustable Inputs */}
      <div className="bg-muted/30 rounded-xl p-5 border border-border/50 space-y-5">
        <h5 className="font-medium text-foreground">Adjust Your Comparison</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Monthly Rent */}
          <div className="space-y-2">
            <Label className="text-sm">Monthly Rent</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={rent || ''}
                onChange={(e) => setRent(Number(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Home Price */}
          <div className="space-y-2">
            <Label className="text-sm">Home Purchase Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={homePrice || ''}
                onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Down Payment</Label>
            <span className="text-sm font-medium text-primary">
              {downPaymentPercent}% ({currencySymbol}{Math.round(calculations.downPayment).toLocaleString()})
            </span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(v) => setDownPaymentPercent(v[0])}
            min={3}
            max={30}
            step={1}
          />
        </div>

        {/* Years to Compare */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Years to Compare</Label>
            <span className="text-sm font-medium">{yearsToCompare} years</span>
          </div>
          <Slider
            value={[yearsToCompare]}
            onValueChange={(v) => setYearsToCompare(v[0])}
            min={1}
            max={30}
            step={1}
          />
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Breakeven</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            Year {calculations.breakevenYear}
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Home Value ({yearsToCompare}yr)</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {currencySymbol}{Math.round(calculations.futureHomeValue).toLocaleString()}
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Equity Built</p>
          </div>
          <p className="text-lg font-bold text-green-600">
            {currencySymbol}{Math.round(calculations.totalEquity).toLocaleString()}
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Monthly Diff</p>
          </div>
          <p className={`text-lg font-bold ${calculations.monthlyDifference > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {calculations.monthlyDifference > 0 ? '+' : ''}{currencySymbol}{Math.round(calculations.monthlyDifference).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
        <p className="text-xs text-muted-foreground">
          <strong>Assumptions:</strong> {rentIncrease}% annual rent increase, {homeAppreciation}% home appreciation, 
          30-year fixed mortgage at {interestRate}%, 1.2% property tax, 0.4% insurance, 1% maintenance. 
          Does not include tax benefits of homeownership or investment returns on down payment if renting.
        </p>
      </div>
    </div>
  );
};
