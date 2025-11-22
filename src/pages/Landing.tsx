import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Shield, Users, TrendingDown, Calculator, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { trackButtonClick } from '@/utils/analytics';

export default function Landing() {
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [showResult, setShowResult] = useState(false);

  const calculateSavings = () => {
    if (income && expenses) {
      setShowResult(true);
      trackButtonClick('calculate_landing', 'landing_page');
    }
  };

  const handleSignup = () => {
    trackButtonClick('signup_landing', 'landing_page');
    navigate('/auth');
  };

  const monthlyIncome = parseFloat(income) || 0;
  const monthlyExpenses = parseFloat(expenses) || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const yearlySavings = monthlySavings * 12;
  const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;

  return (
    <>
      <SEO 
        title="Stop Overspending, Start Saving - Free Budget Calculator"
        description="Calculate your savings potential in 30 seconds. Join thousands of families taking control of their finances with smart budgeting tools."
        keywords="budget calculator, expense tracker, savings calculator, personal finance, money management"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Join 10,000+ families saving smarter</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Stop Overspending,
              <br />
              <span className="text-primary">Start Saving</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Calculate your savings potential in 30 seconds. No signup required.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Shield className="h-5 w-5 text-primary" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <TrendingDown className="h-5 w-5 text-primary" />
                <span>Reduce Expenses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="container mx-auto px-4 pb-12">
          <Card className="max-w-2xl mx-auto shadow-2xl border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Your Quick Savings Calculator
              </CardTitle>
              <p className="text-muted-foreground">
                See how much you could save this year
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income" className="text-base">
                    Monthly Income
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 5000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenses" className="text-base">
                    Monthly Expenses
                  </Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="e.g., 4000"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <Button 
                  onClick={calculateSavings}
                  className="w-full h-12 text-lg"
                  size="lg"
                  disabled={!income || !expenses}
                >
                  Calculate My Savings
                </Button>
              </div>

              {showResult && monthlySavings >= 0 && (
                <div className="space-y-4 pt-4 border-t animate-in fade-in duration-500">
                  <div className="bg-primary/10 rounded-lg p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly Savings:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${monthlySavings.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Yearly Savings:</span>
                      <span className="text-3xl font-bold text-primary">
                        ${yearlySavings.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Savings Rate:</span>
                      <span className="text-xl font-bold">{savingsRate}%</span>
                    </div>
                  </div>

                  {/* CTA After Calculation */}
                  <div className="bg-accent/30 rounded-lg p-6 space-y-3 text-center">
                    <div className="flex justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">
                      Want to save even more?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create a free account to track expenses, set goals, and get AI-powered insights to boost your savings.
                    </p>
                    <Button 
                      onClick={handleSignup}
                      size="lg"
                      className="w-full h-12 text-lg"
                    >
                      Save My Results - It's Free
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      No credit card required • Takes 30 seconds
                    </p>
                  </div>
                </div>
              )}

              {showResult && monthlySavings < 0 && (
                <div className="space-y-4 pt-4 border-t animate-in fade-in duration-500">
                  <div className="bg-amber-500/10 rounded-lg p-6 space-y-3">
                    <h3 className="font-semibold text-lg text-center">
                      You're spending ${Math.abs(monthlySavings).toFixed(0)} more than you earn
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Don't worry - that's exactly why we built this tool. Track where your money goes and find areas to cut back.
                    </p>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-6 space-y-3 text-center">
                    <h3 className="font-semibold text-lg">
                      Get back on track
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our expense tracker and AI insights help you identify where to cut costs and start saving.
                    </p>
                    <Button 
                      onClick={handleSignup}
                      size="lg"
                      className="w-full h-12 text-lg"
                    >
                      Start Tracking Free
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      No credit card required • Takes 30 seconds
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything you need to save more
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">Track Every Dollar</h3>
                  <p className="text-sm text-muted-foreground">
                    See exactly where your money goes with automatic expense categorization
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations to reduce spending and boost savings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">Reach Your Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Set savings goals and track progress with visual charts and milestones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-12 pb-20">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to take control of your finances?
              </h2>
              <p className="text-muted-foreground">
                Join thousands who've already started saving smarter
              </p>
              <Button 
                onClick={handleSignup}
                size="lg"
                className="h-12 px-8 text-lg"
              >
                Get Started Free
              </Button>
              <p className="text-xs text-muted-foreground">
                Free forever • No credit card required • Set up in 30 seconds
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
