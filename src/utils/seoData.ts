export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  structuredData?: any;
  canonical?: string;
  ogImage?: string;
}

export const seoData: Record<string, SEOData> = {
  home: {
    title: "Free Monthly Budget Calculator | Home Budget Made Simple",
    description: "Free monthly budget calculator — see exactly where your paycheck goes in 5 minutes. No bank linking, no spreadsheets. Track household income, split rent with roommates, and finally adult your finances.",
    keywords: "monthly budget calculator free, home budget calculator, household budget calculator, free budgeting calculator, calculate monthly living expenses, house expenses calculator, living budget calculator, living expenses budget calculator, simple budget app",
    canonical: "https://www.housebudgetcalculator.com",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "description": "Free monthly budget calculator for households — track your paycheck, manage home expenses, split rent with roommates, and see where your money actually goes",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "First apartment budget calculator",
            "Roommate expense splitting",
            "Side hustle income tracking",
            "Visual budget breakdown charts",
            "No bank account linking required",
            "Savings goals tracker",
            "Expense tracking"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "247"
          }
        },
        {
          "@type": "Organization",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "logo": "https://www.housebudgetcalculator.com/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png",
          "description": "Free monthly home budget calculator trusted by thousands of households"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the budget calculator really free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Our monthly budget calculator is 100% free with no signup required. Start budgeting in under 5 minutes. Premium features are available for just $2.99/month."
              }
            },
            {
              "@type": "Question",
              "name": "Do I need to connect my bank account?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No bank account linking required! Just enter your income and expenses manually. We keep it simple — no complicated setup or scary permissions."
              }
            },
            {
              "@type": "Question",
              "name": "Can I split expenses with roommates?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Premium users can share budgets with roommates or partners for easy expense splitting. Perfect for first apartments and couples merging finances."
              }
            },
            {
              "@type": "Question",
              "name": "How do I budget with variable income from gig work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our expense tracker works great for freelancers and gig workers. Track income from multiple sources and see your actual spending patterns without rigid budget templates."
              }
            }
          ]
        }
      ]
    }
  },

  monthlyBudget: {
    title: "Free Monthly Budget Calculator | Track Your Paycheck in Minutes",
    description: "Free monthly budget calculator — input your income, add expenses, and instantly see where your money goes. No bank account linking. Perfect for households, roommates, and first-time budgeters.",
    keywords: "monthly budget calculator free, home budget calculator, household budget calculator, free budgeting calculator, calculate monthly living expenses, living expenses budget calculator, house expenses calculator, living budget calculator, paycheck budget calculator",
    canonical: "https://www.housebudgetcalculator.com/budget",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Create Your Monthly Budget",
      "description": "Free monthly budget calculator — track your household income and expenses in under 5 minutes",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter Your Income",
          "text": "Input your paycheck, side hustle earnings, freelance gigs, and any other income sources"
        },
        {
          "@type": "HowToStep",
          "name": "List Your Expenses",
          "text": "Add rent, utilities, subscriptions, groceries, and all those little purchases that add up"
        },
        {
          "@type": "HowToStep",
          "name": "See Where Your Money Goes",
          "text": "Get a visual breakdown of your spending and figure out how to save more"
        }
      ],
      "totalTime": "PT10M"
    }
  },
  
  expenses: {
    title: "Expense Tracker | Track Spending Without Linking Your Bank",
    description: "Free expense tracker — log purchases in seconds without bank linking. See monthly spending breakdowns and find out where your money actually goes. Perfect for freelancers and gig workers.",
    keywords: "expense tracker no bank, freelancer expense tracker, gig worker budget, variable income tracker, simple spending tracker, side hustle income tracker, millennial expense app, expense log app",
    canonical: "https://www.housebudgetcalculator.com/expenses",
    ogImage: "https://www.housebudgetcalculator.com/assets/expenses-page-preview-new.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Expense Tracker",
      "description": "Track daily expenses without bank linking — perfect for freelancers and gig workers",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },

  savingsGoals: {
    title: "Savings Goal Tracker | Free Visual Savings Calculator",
    description: "Free savings goal tracker — set a target, log monthly contributions, and watch your progress grow. Perfect for apartment deposits, emergency funds, vacations, or any goal you're saving toward.",
    keywords: "savings goal tracker, saving for a vacation calculator, savings calculator free, emergency fund tracker, how much should I save, savings progress tracker, visual savings goal, monthly savings planner, first savings goal",
    canonical: "https://www.housebudgetcalculator.com/savings",
    ogImage: "https://www.housebudgetcalculator.com/assets/savings-goal-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Track Your Savings Goals",
      "description": "Set and track your savings goals for apartment deposits, travel, emergencies, and more",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Set Your Goal",
          "text": "Create a savings goal — apartment deposit, vacation, emergency fund, or anything you're working toward"
        },
        {
          "@type": "HowToStep",
          "name": "Track Monthly Progress",
          "text": "Log your monthly contributions and watch your progress grow"
        },
        {
          "@type": "HowToStep",
          "name": "Stay Motivated",
          "text": "Visual charts show how close you are to achieving your goal"
        }
      ],
      "totalTime": "PT5M"
    }
  },
};
