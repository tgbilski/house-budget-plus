import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Import feature images
import voiceExpenseImg from '@/assets/features/voice-expense.png';
import savingsGoalsImg from '@/assets/features/savings-goals.png';
import vacationPlannerImg from '@/assets/features/vacation-planner.png';
import vendorComparisonImg from '@/assets/features/vendor-comparison.png';
import giftListsImg from '@/assets/features/gift-lists.png';
import aiAdvisorImg from '@/assets/features/ai-advisor.png';

const tools = [
  {
    title: "Voice Expense Tracker",
    description: "Log expenses instantly by speaking. AI-powered transcription automatically tracks your spending.",
    image: voiceExpenseImg,
    href: "/expenses",
    isPremium: true
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
    title: "AI Financial Advisor",
    description: "Get personalized financial insights and smart recommendations powered by AI.",
    image: aiAdvisorImg,
    href: "/ai-insights",
    isPremium: true
  }
];

interface ToolsGridProps {
  excludeHref?: string;
}

export function ToolsGrid({ excludeHref }: ToolsGridProps) {
  const filteredTools = excludeHref 
    ? tools.filter(tool => tool.href !== excludeHref)
    : tools;

  return (
    <section className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          More Financial Tools
        </h2>
        <p className="text-muted-foreground">
          Explore our other budget planning and tracking tools
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <Link key={tool.title} to={tool.href} className="block group">
            <Card className="h-full overflow-hidden bg-card hover:translate-y-[-2px] hover:shadow-cartoon-hover transition-all duration-200">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {tool.isPremium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    PREMIUM
                  </div>
                )}
              </div>
              <CardHeader className="p-3 bg-muted/50">
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
