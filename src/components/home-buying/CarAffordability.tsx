import React, { useState, useMemo } from 'react';
import { Car, Calculator, TrendingUp, DollarSign, Percent, ExternalLink, Search, Fuel, Shield, Wrench, Scale, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // Lease vs Buy inputs
  const [carPrice, setCarPrice] = useState(35000);
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState(350);
  const [leaseTermMonths, setLeaseTermMonths] = useState(36);
  const [leaseDownPayment, setLeaseDownPayment] = useState(2000);
  const [leaseDispositionFee, setLeaseDispositionFee] = useState(350);
  const [buyDownPayment, setBuyDownPayment] = useState(5000);
  const [buyInterestRate, setBuyInterestRate] = useState(7.0);
  const [buyLoanTermMonths, setBuyLoanTermMonths] = useState(60);
  const [yearsToOwn, setYearsToOwn] = useState(5);
  const [depreciationRate, setDepreciationRate] = useState(15);

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

  // Lease vs Buy calculations
  const leaseVsBuyCalc = useMemo(() => {
    // Lease costs
    const totalLeasePayments = leaseMonthlyPayment * leaseTermMonths;
    const totalLeaseCost = leaseDownPayment + totalLeasePayments + leaseDispositionFee;
    const leasesNeeded = Math.ceil((yearsToOwn * 12) / leaseTermMonths);
    const totalLeaseOverYears = totalLeaseCost * leasesNeeded;

    // Buy costs
    const loanAmount = carPrice - buyDownPayment;
    const monthlyRate = buyInterestRate / 100 / 12;
    let monthlyPayment = 0;
    
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, buyLoanTermMonths)) / 
        (Math.pow(1 + monthlyRate, buyLoanTermMonths) - 1);
    } else {
      monthlyPayment = loanAmount / buyLoanTermMonths;
    }

    const totalLoanPayments = monthlyPayment * buyLoanTermMonths;
    const totalInterest = totalLoanPayments - loanAmount;
    const totalBuyCost = buyDownPayment + totalLoanPayments;

    // Car value after years to own (compound depreciation)
    const carValueAfterYears = carPrice * Math.pow(1 - depreciationRate / 100, yearsToOwn);
    
    // Net cost of buying = total paid - residual value
    const netBuyCost = totalBuyCost - carValueAfterYears;

    // Difference
    const savings = totalLeaseOverYears - netBuyCost;
    const buyIsBetter = savings > 0;

    return {
      // Lease
      leaseMonthlyPayment,
      totalLeaseCost,
      leasesNeeded,
      totalLeaseOverYears,
      // Buy
      buyMonthlyPayment: monthlyPayment,
      totalBuyCost,
      totalInterest,
      carValueAfterYears,
      netBuyCost,
      // Comparison
      savings: Math.abs(savings),
      buyIsBetter,
    };
  }, [carPrice, leaseMonthlyPayment, leaseTermMonths, leaseDownPayment, leaseDispositionFee, 
      buyDownPayment, buyInterestRate, buyLoanTermMonths, yearsToOwn, depreciationRate]);

  const formatCurrency = (value: number) => {
    return `${currencySymbol}${Math.round(value).toLocaleString()}`;
  };

  return (
    <Tabs defaultValue="affordability" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1">
        <TabsTrigger value="affordability" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
          <Calculator className="h-4 w-4" />
          Affordability
        </TabsTrigger>
        <TabsTrigger value="lease-vs-buy" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
          <Scale className="h-4 w-4" />
          Lease vs Buy
        </TabsTrigger>
      </TabsList>

      <TabsContent value="affordability" className="space-y-6 mt-0">
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
      </TabsContent>

      <TabsContent value="lease-vs-buy" className="space-y-6 mt-0">
        {/* Result Summary */}
        <div className={`rounded-xl p-5 border-2 ${leaseVsBuyCalc.buyIsBetter ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Scale className={`h-6 w-6 ${leaseVsBuyCalc.buyIsBetter ? 'text-green-600' : 'text-blue-600'}`} />
            <h4 className="text-xl font-bold text-foreground">
              {leaseVsBuyCalc.buyIsBetter ? 'Buying' : 'Leasing'} saves you {formatCurrency(leaseVsBuyCalc.savings)}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Over {yearsToOwn} years, {leaseVsBuyCalc.buyIsBetter 
              ? `buying costs ${formatCurrency(leaseVsBuyCalc.netBuyCost)} vs leasing at ${formatCurrency(leaseVsBuyCalc.totalLeaseOverYears)}`
              : `leasing costs ${formatCurrency(leaseVsBuyCalc.totalLeaseOverYears)} vs buying at ${formatCurrency(leaseVsBuyCalc.netBuyCost)}`
            }
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lease Column */}
          <div className={`rounded-xl p-5 border-2 ${!leaseVsBuyCalc.buyIsBetter ? 'border-blue-500/50 bg-blue-500/5' : 'border-border/50 bg-muted/20'}`}>
            <div className="flex items-center gap-2 mb-4">
              {!leaseVsBuyCalc.buyIsBetter && <CheckCircle className="h-5 w-5 text-blue-600" />}
              <h4 className="font-bold text-lg text-foreground">Lease</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="font-medium">{formatCurrency(leaseVsBuyCalc.leaseMonthlyPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-medium">{formatCurrency(leaseDownPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Per Lease Cost</span>
                <span className="font-medium">{formatCurrency(leaseVsBuyCalc.totalLeaseCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Leases Needed ({yearsToOwn} yrs)</span>
                <span className="font-medium">{leaseVsBuyCalc.leasesNeeded}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="font-semibold">Total Cost</span>
                <span className="font-bold text-lg">{formatCurrency(leaseVsBuyCalc.totalLeaseOverYears)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Car Value at End</span>
                <span>{formatCurrency(0)}</span>
              </div>
            </div>
          </div>

          {/* Buy Column */}
          <div className={`rounded-xl p-5 border-2 ${leaseVsBuyCalc.buyIsBetter ? 'border-green-500/50 bg-green-500/5' : 'border-border/50 bg-muted/20'}`}>
            <div className="flex items-center gap-2 mb-4">
              {leaseVsBuyCalc.buyIsBetter && <CheckCircle className="h-5 w-5 text-green-600" />}
              <h4 className="font-bold text-lg text-foreground">Buy</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="font-medium">{formatCurrency(leaseVsBuyCalc.buyMonthlyPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-medium">{formatCurrency(buyDownPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Loan + Interest</span>
                <span className="font-medium">{formatCurrency(leaseVsBuyCalc.totalBuyCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Car Value After {yearsToOwn} yrs</span>
                <span className="font-medium text-green-600">-{formatCurrency(leaseVsBuyCalc.carValueAfterYears)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="font-semibold">Net Cost</span>
                <span className="font-bold text-lg">{formatCurrency(leaseVsBuyCalc.netBuyCost)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>You Keep the Car</span>
                <span>{formatCurrency(leaseVsBuyCalc.carValueAfterYears)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Car & Time */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Vehicle
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Car Price (MSRP)</Label>
                <span className="text-sm font-medium">{formatCurrency(carPrice)}</span>
              </div>
              <Slider
                value={[carPrice]}
                onValueChange={(v) => setCarPrice(v[0])}
                min={15000}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Years to Compare</Label>
                <span className="text-sm font-medium">{yearsToOwn} years</span>
              </div>
              <Slider
                value={[yearsToOwn]}
                onValueChange={(v) => setYearsToOwn(v[0])}
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Annual Depreciation</Label>
                <span className="text-sm font-medium">{depreciationRate}%</span>
              </div>
              <Slider
                value={[depreciationRate]}
                onValueChange={(v) => setDepreciationRate(v[0])}
                min={5}
                max={25}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Lease Terms */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              Lease Terms
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Monthly Payment</Label>
                <span className="text-sm font-medium">{formatCurrency(leaseMonthlyPayment)}</span>
              </div>
              <Slider
                value={[leaseMonthlyPayment]}
                onValueChange={(v) => setLeaseMonthlyPayment(v[0])}
                min={150}
                max={800}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Lease Term</Label>
                <span className="text-sm font-medium">{leaseTermMonths} months</span>
              </div>
              <Slider
                value={[leaseTermMonths]}
                onValueChange={(v) => setLeaseTermMonths(v[0])}
                min={24}
                max={48}
                step={12}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Down Payment</Label>
                <span className="text-sm font-medium">{formatCurrency(leaseDownPayment)}</span>
              </div>
              <Slider
                value={[leaseDownPayment]}
                onValueChange={(v) => setLeaseDownPayment(v[0])}
                min={0}
                max={5000}
                step={250}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Disposition Fee</Label>
                <span className="text-sm font-medium">{formatCurrency(leaseDispositionFee)}</span>
              </div>
              <Slider
                value={[leaseDispositionFee]}
                onValueChange={(v) => setLeaseDispositionFee(v[0])}
                min={0}
                max={500}
                step={50}
                className="w-full"
              />
            </div>
          </div>

          {/* Buy Terms */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Buy Terms
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Down Payment</Label>
                <span className="text-sm font-medium">{formatCurrency(buyDownPayment)}</span>
              </div>
              <Slider
                value={[buyDownPayment]}
                onValueChange={(v) => setBuyDownPayment(v[0])}
                min={0}
                max={30000}
                step={500}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Interest Rate (APR)</Label>
                <span className="text-sm font-medium">{buyInterestRate.toFixed(1)}%</span>
              </div>
              <Slider
                value={[buyInterestRate]}
                onValueChange={(v) => setBuyInterestRate(v[0])}
                min={0}
                max={15}
                step={0.25}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Loan Term</Label>
                <span className="text-sm font-medium">{buyLoanTermMonths} months</span>
              </div>
              <Slider
                value={[buyLoanTermMonths]}
                onValueChange={(v) => setBuyLoanTermMonths(v[0])}
                min={36}
                max={84}
                step={12}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              Leasing Pros
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                Lower monthly payments
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                Always drive a newer car
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                Warranty coverage during lease
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                Mileage limits & fees
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                No ownership at end
              </li>
            </ul>
          </div>

          <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-green-600" />
              Buying Pros
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                You own the car outright
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                No mileage restrictions
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                Can modify or sell anytime
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                Higher monthly payments
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                Maintenance costs after warranty
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This comparison is for educational purposes only. 
            Actual costs vary based on credit score, location, and dealer incentives. 
            Leasing may include additional fees (acquisition, excess mileage, wear). 
            Consult with your dealer or financial advisor for accurate quotes.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
