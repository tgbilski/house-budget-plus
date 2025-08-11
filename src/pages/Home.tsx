import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Calendar, Plane, Brain, ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";

// ...other code (toolsData, HeroSection, etc.)

// 1. FinanceNewsSection: Horizontally scrollable RSS finance news
const DEMO_ARTICLES = [
  {
    title: "Fed Holds Interest Rates Steady",
    link: "#",
    thumbnail: "https://placehold.co/300x160?text=Finance+1",
    pubDate: "2025-08-09",
    source: "Reuters"
  },
  {
    title: "How to Save More Money in 2025",
    link: "#",
    thumbnail: "https://placehold.co/300x160?text=Finance+2",
    pubDate: "2025-08-08",
    source: "Bloomberg"
  },
  {
    title: "Stock Markets Rally After CPI Report",
    link: "#",
    thumbnail: "https://placehold.co/300x160?text=Finance+3",
    pubDate: "2025-08-07",
    source: "CNBC"
  }
];

const fallbackImage = "https://placehold.co/300x160?text=News";

// Replace DEMO_ARTICLES and use this state logic to fetch from a real RSS-JSON API (see instructions below)
const FinanceNewsSection = () => {
  // Uncomment this to go live:
  // const [articles, setArticles] = useState([]);
  // useEffect(() => {
  //   fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbc.com/id/100003114/device/rss/rss.html")
  //     .then(res => res.json())
  //     .then(data => setArticles(data.items));
  // }, []);
  // For now, use demo data:
  const articles = DEMO_ARTICLES;

  return (
    <section className="py-4 px-4 bg-muted/50 border-b border-border">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg font-bold mb-3">Finance News</h2>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap gap-4">
            {articles.map((article, idx) => (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[300px] max-w-[300px] bg-background rounded-lg shadow hover:shadow-lg transition flex-shrink-0"
              >
                <img
                  src={article.thumbnail || fallbackImage}
                  alt={article.title}
                  className="rounded-t-lg w-full h-[160px] object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <div className="font-semibold text-sm mb-1">{article.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{article.source} &bull; {new Date(article.pubDate).toLocaleDateString()}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Home page, with FinanceNewsSection added above ToolsGrid
const Home = () => {
  return (
    <>
      <SEO
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        structuredData={seoData.home.structuredData}
        canonical="https://www.housebudgetcalculator.com/"
      />
      <div className="min-h-screen relative">
        <HeroSection />
        <FinanceNewsSection /> {/* <--- NEW SECTION */}
        <ToolsGrid />
        <FeaturesSection />
        <CTASection />

        {/* Badge Display Section - Right Side */}
        <div className="fixed top-20 right-4 w-80 z-10 hidden lg:block">
          <BadgeDisplay />
        </div>
        {/* Mobile Badge Display */}
        <div className="lg:hidden container mx-auto px-4 mt-8">
          <BadgeDisplay />
        </div>
      </div>
    </>
  );
};

export default Home;
