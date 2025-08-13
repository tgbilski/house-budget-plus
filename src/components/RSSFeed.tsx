import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Clock } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
}

interface RSSFeedProps {
  feedUrl?: string;
  title?: string;
}

export const RSSFeed: React.FC<RSSFeedProps> = ({ 
  feedUrl = "", 
  title = "Latest Financial News"
}) => {
  const [articles, setArticles] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockArticles: RSSItem[] = [
    {
      title: "Federal Reserve Announces New Interest Rate Decision",
      description: "The Federal Reserve has made a significant decision regarding interest rates that could impact your budget and savings strategy...",
      link: "#",
      pubDate: "2024-08-12T10:00:00Z",
      source: "Financial Times"
    },
    {
      title: "Top 5 Budgeting Apps That Actually Work",
      description: "Personal finance experts review the most effective budgeting applications and tools for managing your monthly expenses...",
      link: "#",
      pubDate: "2024-08-12T08:30:00Z",
      source: "Money Magazine"
    },
    {
      title: "How to Save $1000 in 30 Days: Expert Tips",
      description: "Financial advisors share practical strategies for cutting expenses and boosting your savings in just one month...",
      link: "#",
      pubDate: "2024-08-11T16:45:00Z",
      source: "Bloomberg"
    },
    {
      title: "Market Volatility: What It Means for Your Budget",
      description: "Understanding how current market conditions affect your personal finances and investment decisions...",
      link: "#",
      pubDate: "2024-08-11T14:20:00Z",
      source: "Reuters"
    },
    {
      title: "Tax Season 2024: New Deductions You Should Know",
      description: "Important updates to tax regulations that could save you money on your next filing...",
      link: "#",
      pubDate: "2024-08-11T12:00:00Z",
      source: "Wall Street Journal"
    }
  ];

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!feedUrl) {
          // Use mock data when no feed URL is provided
          setTimeout(() => {
            setArticles(mockArticles);
            setLoading(false);
          }, 1000);
          return;
        }

        console.log('Fetching RSS feed from:', feedUrl);
        
        // Call our Supabase Edge Function
        console.log('About to call fetch-rss function...');
        const { data, error } = await supabase.functions.invoke('fetch-rss', {
          body: { feedUrl }
        });

        console.log('Function response:', { data, error });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message);
        }

        if (data && data.success) {
          console.log('Successfully fetched articles:', data.data?.length || 0);
          setArticles(data.data || []);
        } else {
          console.error('Function returned error:', data);
          throw new Error(data?.error || 'Failed to fetch RSS feed');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching RSS feed:', err);
        setError(err instanceof Error ? err.message : "Failed to load financial news");
        
        // Fallback to mock data on error
        setArticles(mockArticles);
        setLoading(false);
      }
    };

    fetchRSSFeed();
  }, [feedUrl]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {title}
          </h2>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[300px] animate-pulse">
                <Card className="h-[200px]">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest financial news and insights to make better budgeting decisions.
          </p>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-6 pb-4">
            {articles.map((article, index) => (
              <Card 
                key={index} 
                className="min-w-[320px] max-w-[320px] hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.pubDate)}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </div>
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm line-clamp-3 mb-4">
                    {truncateDescription(article.description)}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    asChild
                  >
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                    >
                      Read More <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};