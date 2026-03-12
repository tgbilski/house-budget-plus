import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Import feature images
import voiceExpenseImg from '@/assets/features/voice-expense.png';
import savingsGoalsImg from '@/assets/features/savings-goals.png';
import budgetCalculatorImg from '@/assets/features/budget-calculator.png';

const tools = [
  {
    title: "Monthly Budget",
    description: "See exactly where your paycheck goes with our simple, visual budget calculator.",
    image: budgetCalculatorImg,
    href: "/budget"
  },
  {
    title: "Expense Tracker",
    description: "Log expenses instantly and see monthly spending breakdowns by category.",
    image: voiceExpenseImg,
    href: "/expenses"
  },
  {
    title: "Savings Goals",
    description: "Set financial goals and monitor your progress with visual tracking and milestone celebrations.",
    image: savingsGoalsImg,
    href: "/savings"
  },
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
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <Link key={tool.title} to={tool.href} className="block group touch-manipulation">
            <Card className="h-full overflow-hidden bg-card transition-all duration-200 [@media(hover:hover)]:hover:translate-y-[-2px] [@media(hover:hover)]:hover:shadow-cartoon-hover">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardHeader className="p-3 bg-muted/50">
                <CardTitle className="text-base transition-colors [@media(hover:hover)]:group-hover:text-primary">
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
