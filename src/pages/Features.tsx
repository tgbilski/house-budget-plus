import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { ChevronDown } from "lucide-react";
import { PricingCards } from "@/components/PricingCards";

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
    title: "Monthly Calculator",
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
  const { subscribed, loading } = useSubscription();
  
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Financial Tools & Calculators
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-6">
              Powerful budget planning tools to track expenses, compare vendors, plan vacations, and achieve your savings goals with smart financial insights
            </p>
            <ChevronDown 
              className="w-8 h-8 text-white/60 mx-auto animate-bounce" 
              aria-label="Scroll down to view tools"
            />
            {/* Subscription CTA for logged-in non-subscribers */}
            {user && !subscribed && !loading && (
              <div className="pt-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Unlock Premium Features
                </h2>
                <p className="text-white/70 text-lg mb-6">
                  Get AI-powered insights, voice expense tracking, and unlimited PDF processing
                </p>
                <PricingCards />
              </div>
            )}
            {user && (
              <div className="space-y-2 pt-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-white">
                  Welcome back!
                </h2>
                <p className="text-lg text-white/70">
                  Choose a tool below to get started
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Calculator Grid */}
        <section className="container mx-auto px-4 pb-8 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {calculators.map((calc) => (
              <Link key={calc.title} to={calc.href} className="block group">
                <Card className="h-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-1 hover:-translate-y-1 border-4 border-black bg-card/50 backdrop-blur">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={calc.image}
                      alt={calc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="eager"
                    />
                    {calc.isPremium && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur shadow-lg">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  <CardHeader className="relative bg-white min-h-[140px] h-full">
                    <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors text-foreground">
                      {calc.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground line-clamp-3">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA Section for non-logged-in users */}
        {!user && (
          <section className="container mx-auto px-4 pb-20 text-center">
            <Link to="/auth" className="inline-block">
              <Button 
                size="lg"
                className="h-14 px-12 text-xl font-bold bg-sage text-sage-foreground hover:bg-sage/90 shadow-2xl transition-all"
              >
                Sign Up & Save Data
              </Button>
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
