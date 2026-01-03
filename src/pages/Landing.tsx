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
        title="Stop Budgeting. Start Optimizing. - Free Budget Calculator"
        description="Calculate your savings potential in 30 seconds. Take control of your finances with smart budgeting tools and calculators."
        keywords="AI budget calculator, AI expense tracker, AI savings calculator, AI personal finance, AI money management"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Join families taking control of their finances</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Stop Budgeting,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Start Optimizing
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See exactly how much you could save this year. 
              <span className="font-semibold text-foreground"> Premium AI-Powered Calculators, instant results.</span>
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-6">
              <div className="flex items-center gap-2.5 text-base md:text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Base Calculators are Free Forever</span>
              </div>
              <div className="flex items-center gap-2.5 text-base md:text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">100% Private</span>
              </div>
              <div className="flex items-center gap-2.5 text-base md:text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Easy to Use</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="container mx-auto px-4 pb-16 md:pb-20">
          <Card className="max-w-3xl mx-auto shadow-xl border-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center pb-6 pt-8 space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Calculator className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  Your Savings Calculator
                </CardTitle>
                <p className="text-base md:text-lg text-muted-foreground">
                  See your potential savings in seconds
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 px-6 md:px-8 pb-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="income" className="text-base font-semibold flex items-center gap-2">
                    💰 Monthly Income
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 5000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="text-xl h-14 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="expenses" className="text-base font-semibold flex items-center gap-2">
                    💳 Monthly Expenses
                  </Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="e.g., 4000"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="text-xl h-14 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <Button 
                  onClick={calculateSavings}
                  className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  disabled={!income || !expenses}
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate My Savings
                </Button>
              </div>

              {showResult && monthlySavings >= 0 && (
                <div className="space-y-6 pt-6 border-t-2 animate-in fade-in duration-500">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 space-y-5 border border-primary/20">
                    <h3 className="text-2xl font-bold text-center mb-4">Your Savings Potential</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                        <span className="text-base font-medium text-muted-foreground">Monthly Savings</span>
                        <span className="text-3xl font-extrabold text-primary">
                          ${monthlySavings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                        <span className="text-base font-medium text-muted-foreground">Yearly Savings</span>
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          ${yearlySavings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                        <span className="text-base font-medium text-muted-foreground">Savings Rate</span>
                        <span className="text-2xl font-bold text-foreground">{savingsRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA After Calculation */}
                  <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-8 space-y-5 text-center border-2 border-accent/30">
                    <div className="flex justify-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl">
                        Want to save even more?
                      </h3>
                    <p className="text-base text-muted-foreground max-w-md mx-auto">
                      Track expenses, set goals, and get AI-powered insights to help identify savings opportunities.
                    </p>
                    </div>
                    <Button 
                      onClick={handleSignup}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Save My Results - It's Free
                    </Button>
                    <p className="text-sm text-muted-foreground font-medium">
                      ✓ No credit card required  ✓ Set up in 30 seconds
                    </p>
                  </div>
                </div>
              )}

              {showResult && monthlySavings < 0 && (
                <div className="space-y-6 pt-6 border-t-2 animate-in fade-in duration-500">
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl p-8 space-y-4 border border-amber-500/20">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-center">
                      You're spending ${Math.abs(monthlySavings).toFixed(0)} more than you earn each month
                    </h3>
                    <p className="text-base text-muted-foreground text-center max-w-md mx-auto">
                      That's okay - tracking where your money goes is the first step to fixing it.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-8 space-y-5 text-center border-2 border-accent/30">
                    <h3 className="font-bold text-2xl">
                      Get back on track
                    </h3>
                    <p className="text-base text-muted-foreground max-w-md mx-auto">
                      Our expense tracker and AI insights help you identify where to cut costs and start saving.
                    </p>
                    <Button 
                      onClick={handleSignup}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Start Tracking Free
                    </Button>
                    <p className="text-sm text-muted-foreground font-medium">
                      ✓ No credit card required  ✓ Set up in 30 seconds
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-b from-transparent to-secondary/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Everything you need to save more
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful tools designed to help you take control of your finances
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                      <TrendingDown className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">Track Every Dollar</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    See exactly where your money goes with automatic expense categorization
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">AI-Powered Insights</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Get personalized recommendations to reduce spending and boost savings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">Reach Your Goals</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Set savings goals and track progress with visual charts and milestones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16 pb-24">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 shadow-2xl">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold">
                  Ready to take control of your finances?
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Start saving smarter with our free budgeting tools
                </p>
              </div>
              <Button 
                onClick={handleSignup}
                size="lg"
                className="h-16 px-12 text-xl font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started Free
              </Button>
              <p className="text-sm text-muted-foreground font-medium">
                 ✓ Free forever  ✓ No credit card  ✓ 30-second setup
               </p>
             </CardContent>
           </Card>
         </section>
       </div>
     </>
   );
}
