import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import financial news placeholder images
import financialNews1 from '../assets/financial-placeholder-1.svg';
import financialNews2 from '../assets/financial-placeholder-2.svg';
import financialNews3 from '../assets/financial-placeholder-3.svg';
import financialNews4 from '../assets/financial-placeholder-4.svg';
import financialNews5 from '../assets/financial-placeholder-5.svg';
import financialNews6 from '../assets/financial-placeholder-6.svg';
import financialNews7 from '../assets/financial-placeholder-7.svg';
import financialNews8 from '../assets/financial-placeholder-8.svg';
import financialNews9 from '../assets/financial-placeholder-9.svg';
import financialNews10 from '../assets/financial-placeholder-10.svg';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
}

// Array of financial news images that will cycle through articles
const financialImages = [
  financialNews1,
  financialNews2,
  financialNews3,
  financialNews4,
  financialNews5,
  financialNews6,
  financialNews7,
  financialNews8,
  financialNews9,
  financialNews10,
];

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
  const [currentIndex, setCurrentIndex] = useState(0);

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
        
        // Use a reliable RSS feed if none provided
        const rssUrl = feedUrl || "https://feeds.reuters.com/reuters/businessNews";

        console.log('Fetching RSS feed from:', rssUrl);
        
        // Call our Supabase Edge Function
        console.log('About to call fetch-rss function...');
        const { data, error } = await supabase.functions.invoke('fetch-rss', {
          body: { feedUrl: rssUrl }
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

  const truncateDescription = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === articles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
    <section className="py-8 md:py-16">
        <div className="w-full max-w-sm mx-auto px-2">
          <h2 className="text-lg md:text-2xl font-bold mb-6 text-center">
            {title}
          </h2>
          <div className="flex justify-center overflow-hidden">
            <div className="w-full max-w-xs animate-pulse">
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
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16">
        <div className="w-full max-w-sm mx-auto text-center px-2">
          <h2 className="text-lg md:text-2xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    );
  }

  console.log('RSSFeed render - articles:', articles.length, articles);

  return (
    <section className="py-8 md:py-12 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold mb-3 text-white">
            {title}
          </h2>
          <p className="text-xs md:text-base text-gray-300">
            Stay informed with the latest financial news
          </p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">Loading financial news...</p>
          </div>
        ) : (
          <>
            {/* Mobile: Single Card Display with Navigation */}
            <div className="block md:hidden relative max-w-sm mx-auto">
              <div className="overflow-hidden">
                {articles.length > 0 && (
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group max-w-sm mx-auto bg-white">
                    <div className="relative h-16 md:h-20 overflow-hidden">
                      <img 
                        src={financialImages[currentIndex % financialImages.length]} 
                        alt={`Financial news illustration ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <CardHeader className="pb-2 p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{formatDate(articles[currentIndex].pubDate)}</span>
                        <span>•</span>
                        <span className="truncate text-xs">{articles[currentIndex].source}</span>
                      </div>
                      <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight text-gray-900">
                        {articles[currentIndex].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-3">
                      <CardDescription className="text-xs line-clamp-2 mb-3 text-gray-600">
                        {truncateDescription(articles[currentIndex].description, 60)}
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        asChild
                      >
                        <a 
                          href={articles[currentIndex].link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Read More</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Mobile Navigation Buttons */}
              {articles.length > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSlide}
                    className="h-8 w-8 p-0"
                    aria-label="Previous article"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex space-x-2">
                    {articles.slice(0, 5).map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex % 5 ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to article ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSlide}
                    className="h-8 w-8 p-0"
                    aria-label="Next article"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop: Responsive Horizontal Scroll Layout */}
            <div className="hidden md:block">
              <div className="overflow-x-auto pb-4 scrollbar-hide w-full max-w-[calc(100vw-8rem)]">
                <div className="flex gap-4 w-max">
                  {articles.slice(0, 6).map((article, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group w-64 flex-shrink-0 bg-white">
                      <div className="relative h-24 overflow-hidden">
                        <img 
                          src={financialImages[index % financialImages.length]} 
                          alt={`Financial news illustration ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <CardHeader className="pb-2 p-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{formatDate(article.pubDate)}</span>
                          <span>•</span>
                          <span className="truncate text-xs">{article.source}</span>
                        </div>
                        <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight text-gray-900">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 p-4">
                        <CardDescription className="text-xs line-clamp-2 mb-3 text-gray-600">
                          {truncateDescription(article.description, 80)}
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
                            <div className="flex items-center justify-center gap-1">
                              <span>Read More</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};