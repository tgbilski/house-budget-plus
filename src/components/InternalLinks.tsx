import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Target, Receipt } from 'lucide-react';

interface RelatedTool {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
}

const allTools: RelatedTool[] = [
  {
    title: "Monthly Budget Calculator",
    description: "Track your monthly income and expenses with our comprehensive budget planner",
    href: "/budget",
    icon: Calculator,
  },
  {
    title: "Expense Tracker",
    description: "Log purchases and see monthly spending breakdowns by category",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Savings Goals Tracker",
    description: "Set financial goals and track your progress with visual insights",
    href: "/savings",
    icon: Target,
  },
];

interface InternalLinksProps {
  currentPage: string;
  category?: string;
  limit?: number;
}

export const InternalLinks: React.FC<InternalLinksProps> = ({ 
  currentPage, 
  limit = 3 
}) => {
  const filteredTools = allTools
    .filter(tool => tool.href !== currentPage)
    .slice(0, limit);

  if (filteredTools.length === 0) return null;

  return (
    <section className="mt-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
        Related Financial Tools
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.href} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <tool.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {tool.description}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={tool.href}>
                  <span>Try This Tool</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
