import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Import AI-generated feature images
import voiceExpenseImg from '@/assets/features/voice-expense.png';
import budgetCalculatorImg from '@/assets/features/budget-calculator.png';
import savingsGoalsImg from '@/assets/features/savings-goals.png';
import vacationPlannerImg from '@/assets/features/vacation-planner.png';
import vendorComparisonImg from '@/assets/features/vendor-comparison.png';
import giftListsImg from '@/assets/features/gift-lists.png';
import marketplaceImg from '@/assets/features/marketplace.png';
import aiAdvisorImg from '@/assets/features/ai-advisor.png';
import mascotImg from '@/assets/calculator-mascot.png';

const calculators = [
  {
    title: "Voice Expense Tracker",
    description: "Log expenses instantly by speaking. AI-powered transcription automatically tracks your spending.",
    image: voiceExpenseImg,
    href: "/expenses",
    isPremium: true
  },
  {
    title: "Monthly Budget Calculator",
    description: "Track your household income and expenses with our intuitive calculator and visual charts.",
    image: budgetCalculatorImg,
    href: "/budget"
  },
  {
    title: "Savings Goals Tracker",
    description: "Set financial goals and monitor your progress with visual tracking and milestone celebrations.",
    image: savingsGoalsImg,
    href: "/savings"
  },
  {
    title: "Vacation Planner",
    description: "Compare vacation destinations, track costs, and plan your dream trips within budget.",
    image: vacationPlannerImg,
    href: "/vacation"
  },
  {
    title: "Vendor Comparison Tool",
    description: "Compare contractor quotes side-by-side to find the best value for your home projects.",
    image: vendorComparisonImg,
    href: "/compare-prices"
  },
  {
    title: "Gift Lists",
    description: "Organize gift ideas for every occasion with budget tracking and shopping lists.",
    image: giftListsImg,
    href: "/gifts"
  },
  {
    title: "Community Marketplace",
    description: "Discover local vendors, vacation rentals, and handmade gifts from our community.",
    image: marketplaceImg,
    href: "/marketplace"
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial insights and smart recommendations powered by AI.",
    image: aiAdvisorImg,
    href: "/ai-insights",
    isPremium: true
  }
];

export default function Features() {
  const { user } = useAuth();
  
  return (
    <>
      <SEO 
        title="Financial Tools & Calculators - House Budget"
        description="Explore our suite of financial planning tools including budget calculators, expense trackers, savings goals, vacation planners, and more."
        keywords="budget calculator, expense tracker, savings goals, vacation planner, vendor comparison, financial tools"
      />
      
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(213, 50%, 22%)' }}>
        {/* CTA Section - Now at Top */}
        <section className="container mx-auto px-4 pt-16 pb-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <img 
                src={mascotImg} 
                alt="House Budget Calculator Mascot" 
                className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Financial Tools & Calculators
            </h1>
            {user ? (
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-white">
                  Welcome back!
                </h2>
                <p className="text-lg text-white/70">
                  Choose a tool below to get started
                </p>
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  size="lg"
                  className="h-14 px-12 text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all"
                >
                  Sign Up For Free
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Calculator Grid */}
        <section className="container mx-auto px-4 pb-20 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {calculators.map((calc) => (
              <Link key={calc.title} to={calc.href} className="block group">
                <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/10 hover:border-primary/40 bg-card/50 backdrop-blur">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={calc.image}
                      alt={calc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {calc.isPremium && (
                      <div className="absolute top-4 right-4 bg-amber-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur">
                        PREMIUM
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>
                  <CardHeader className="relative bg-white">
                    <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors text-foreground">
                      {calc.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Removed bottom CTA - now at top */}
      </div>
    </>
  );
}
