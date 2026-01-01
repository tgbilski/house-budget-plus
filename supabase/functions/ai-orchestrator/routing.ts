// Agent definitions with their domains and database tables
export const AGENTS = {
  budget: {
    name: "Budget Agent",
    emoji: "💰",
    description: "Handles monthly budget, income, and expense tracking questions",
    tables: ["budget_data"],
    keywords: ["budget", "income", "expense", "spending", "money", "bills", "monthly", "cost", "afford"]
  },
  savings: {
    name: "Savings Agent", 
    emoji: "🎯",
    description: "Handles savings goals and progress tracking questions",
    tables: ["savings_goals", "savings_entries"],
    keywords: ["savings", "save", "goal", "target", "progress", "emergency fund", "saving"]
  },
  vacation: {
    name: "Vacation Agent",
    emoji: "✈️",
    description: "Handles vacation planning and travel budget questions", 
    tables: ["vacation_projects", "vacation_options"],
    keywords: ["vacation", "travel", "trip", "holiday", "destination", "lodging", "flight", "rental"]
  },
  expenses: {
    name: "Expenses Agent",
    emoji: "📊",
    description: "Handles expense tracking and categorization questions",
    tables: ["expenses"],
    keywords: ["expense", "transaction", "purchase", "spent", "category", "merchant", "receipt"]
  },
  gifts: {
    name: "Gifts Agent",
    emoji: "🎁",
    description: "Handles gift lists and budget tracking questions",
    tables: ["gift_lists", "gift_items"],
    keywords: ["gift", "present", "birthday", "christmas", "holiday", "wishlist", "shopping list"]
  }
};

// Allowed topics for the website
export const ALLOWED_TOPICS = [
  "budget", "finance", "money", "savings", "expenses", "income", 
  "vacation", "travel", "gifts", "shopping",
  "financial planning", "household budget", "spending", "cost",
  "investment advice", "debt", "bills", "subscriptions"
];

// Off-topic indicators that should be rejected
export const OFF_TOPIC_INDICATORS = [
  "weather", "sports", "news", "politics", "recipe", "cooking",
  "movie", "music", "game", "celebrity", "joke", "story",
  "translate", "code", "programming", "homework", "essay"
];

// Check if question is on-topic for the website
export function checkIfOnTopic(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  
  // Check for allowed topic keywords
  const hasAllowedTopic = ALLOWED_TOPICS.some(topic => 
    lowerQuestion.includes(topic)
  );
  
  // Check for agent-specific keywords
  const hasAgentKeyword = Object.values(AGENTS).some(agent =>
    agent.keywords.some(keyword => lowerQuestion.includes(keyword))
  );
  
  // Check for off-topic indicators
  const isOffTopic = OFF_TOPIC_INDICATORS.some(indicator => 
    lowerQuestion.includes(indicator)
  );
  
  return (hasAllowedTopic || hasAgentKeyword) && !isOffTopic;
}

// Select which agents should handle the question
export function selectAgents(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  
  // Score each agent based on keyword matches
  const scores: Record<string, number> = {};
  
  for (const [key, agent] of Object.entries(AGENTS)) {
    scores[key] = 0;
    for (const keyword of agent.keywords) {
      if (lowerQuestion.includes(keyword)) {
        scores[key]++;
      }
    }
  }
  
  // Select agents with positive scores, sorted by score
  const sortedAgents = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);
  
  // Return top 2 agents max for multi-agent queries
  return sortedAgents.slice(0, 2);
}
