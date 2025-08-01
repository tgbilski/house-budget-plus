import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Calendar, MapPin, FileText, BookOpen } from 'lucide-react';

interface RelatedTool {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  category: string;
}

const allTools: RelatedTool[] = [
  {
    title: "Monthly Budget Calculator",
    description: "Track your monthly income and expenses with our comprehensive budget planner",
    href: "/",
    icon: Calculator,
    category: "budgeting"
  },
  {
    title: "Vendor Quote Comparison",
    description: "Compare contractor quotes and vendor proposals for your projects",
    href: "/compare-prices",
    icon: TrendingUp,
    category: "comparison"
  },
  {
    title: "Takeout Expense Tracker",
    description: "Monitor your dining and takeout expenses with our calendar tracker",
    href: "/takeout",
    icon: Calendar,
    category: "tracking"
  },
  {
    title: "Vacation Budget Planner",
    description: "Plan and compare vacation options within your travel budget",
    href: "/vacation",
    icon: MapPin,
    category: "planning"
  },
  {
    title: "Budget Templates",
    description: "Pre-made budget templates for different life situations",
    href: "/templates",
    icon: FileText,
    category: "templates"
  },
  {
    title: "Financial Resources",
    description: "Guides, tips, and resources for better financial planning",
    href: "/ai-insights",
    icon: BookOpen,
    category: "education"
  }
];

interface InternalLinksProps {
  currentPage: string;
  category?: string;
  limit?: number;
}

export const InternalLinks: React.FC<InternalLinksProps> = ({ 
  currentPage, 
  category,
  limit = 3 
}) => {
  const filteredTools = allTools
    .filter(tool => tool.href !== currentPage)
    .filter(tool => !category || tool.category === category)
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
                  Try This Tool
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};