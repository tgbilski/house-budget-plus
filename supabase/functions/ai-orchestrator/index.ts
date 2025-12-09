import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

// Agent definitions with their domains and database tables
const AGENTS = {
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
  vendors: {
    name: "Vendors Agent",
    emoji: "🏪", 
    description: "Handles vendor comparisons and quotes questions",
    tables: ["vendor_projects", "vendor_quotes"],
    keywords: ["vendor", "quote", "contractor", "comparison", "price", "estimate", "project", "service provider"]
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
const ALLOWED_TOPICS = [
  "budget", "finance", "money", "savings", "expenses", "income", 
  "vacation", "travel", "vendors", "quotes", "gifts", "shopping",
  "financial planning", "household budget", "spending", "cost",
  "investment advice", "debt", "bills", "subscriptions"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth header check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription?.subscribed) {
      return new Response(JSON.stringify({
        error: "Subscription required",
        message: "Please subscribe to access AI insights feature."
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check and increment AI usage
    const { data: usageCheck, error: usageError } = await supabase
      .rpc('check_and_increment_ai_usage', { _user_id: user.id });
    
    if (usageError || !usageCheck?.allowed) {
      return new Response(JSON.stringify({
        error: "Usage limit reached",
        message: "You've reached your AI insight limit this month.",
        reset_date: usageCheck?.reset_date
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendStatus = async (status: string, agent?: string) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "status", status, agent })}\n\n`));
    };

    const sendContent = async (content: string) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`));
    };

    const sendDone = async () => {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      await writer.close();
    };

    // Process in background
    (async () => {
      try {
        await sendStatus("Analyzing your question...");

        // Step 1: Check if question is on-topic
        const isOnTopic = await checkIfOnTopic(question);
        
        if (!isOnTopic) {
          await sendStatus("Question not related to financial planning");
          await sendContent("I'm sorry, but I can only help with questions related to your household finances, budgeting, savings, expenses, vacation planning, vendor comparisons, and gift lists. Please ask a question about one of these topics!");
          await sendDone();
          return;
        }

        await sendStatus("Question validated ✓");

        // Step 2: Determine which agents to consult
        await sendStatus("Determining which specialist to consult...");
        const selectedAgents = selectAgents(question);
        
        if (selectedAgents.length === 0) {
          selectedAgents.push("budget"); // Default to budget agent
        }

        // Step 3: Fetch user data for selected agents
        const currentYear = new Date().getFullYear();
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*, current_household_id")
          .eq("user_id", user.id)
          .single();

        const currentHouseholdId = profileData?.current_household_id;

        // Fetch data based on selected agents
        const agentData: Record<string, any> = {};
        
        for (const agentKey of selectedAgents) {
          const agent = AGENTS[agentKey as keyof typeof AGENTS];
          await sendStatus(`Consulting ${agent.emoji} ${agent.name}...`, agentKey);
          
          agentData[agentKey] = await fetchAgentData(
            supabase, 
            agentKey, 
            user.id, 
            currentYear, 
            currentHouseholdId
          );
        }

        // Step 4: Build context and get AI response
        await sendStatus("Generating personalized insights...");
        
        const context = buildAgentContext(agentData, selectedAgents, profileData, currentYear);
        const systemPrompt = buildSystemPrompt(selectedAgents, context, currentYear);

        // Call Lovable AI with streaming
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ],
            stream: true,
            max_tokens: 1500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("AI API error:", error);
          await sendContent("Sorry, I encountered an error processing your question. Please try again.");
          await sendDone();
          return;
        }

        await sendStatus("Streaming response...");

        // Stream the response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  await sendContent(content);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        await sendDone();

      } catch (error) {
        console.error("Orchestrator error:", error);
        await sendContent("An error occurred while processing your question.");
        await sendDone();
      }
    })();

    return new Response(stream.readable, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (error) {
    console.error("ai-orchestrator error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Check if question is on-topic for the website
function checkIfOnTopic(question: string): boolean {
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
  const offTopicIndicators = [
    "weather", "sports", "news", "politics", "recipe", "cooking",
    "movie", "music", "game", "celebrity", "joke", "story",
    "translate", "code", "programming", "homework", "essay"
  ];
  
  const isOffTopic = offTopicIndicators.some(indicator => 
    lowerQuestion.includes(indicator)
  );
  
  return (hasAllowedTopic || hasAgentKeyword) && !isOffTopic;
}

// Select which agents should handle the question
function selectAgents(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  const selectedAgents: string[] = [];
  
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

// Fetch data for a specific agent
async function fetchAgentData(
  supabase: any, 
  agentKey: string, 
  userId: string, 
  year: number,
  householdId: string | null
): Promise<any> {
  switch (agentKey) {
    case "budget":
      const { data: budgetData } = await supabase
        .from("budget_data")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year)
        .order("created_at", { ascending: false });
      return { budget: budgetData || [] };

    case "savings":
      const { data: savingsGoals } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year);
      
      const goalIds = savingsGoals?.map((g: any) => g.id) || [];
      const { data: savingsEntries } = goalIds.length > 0
        ? await supabase
            .from("savings_entries")
            .select("*")
            .in("goal_id", goalIds)
        : { data: [] };
      
      return { goals: savingsGoals || [], entries: savingsEntries || [] };

    case "vendors":
      const { data: vendorProjects } = await supabase
        .from("vendor_projects")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year);
      
      const projectIds = vendorProjects?.map((p: any) => p.id) || [];
      const { data: vendorQuotes } = projectIds.length > 0
        ? await supabase
            .from("vendor_quotes")
            .select("*")
            .in("project_id", projectIds)
        : { data: [] };
      
      return { projects: vendorProjects || [], quotes: vendorQuotes || [] };

    case "vacation":
      const { data: vacationProjects } = await supabase
        .from("vacation_projects")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year);
      
      const vacationProjectIds = vacationProjects?.map((p: any) => p.id) || [];
      const { data: vacationOptions } = vacationProjectIds.length > 0
        ? await supabase
            .from("vacation_options")
            .select("*")
            .in("project_id", vacationProjectIds)
        : { data: [] };
      
      return { projects: vacationProjects || [], options: vacationOptions || [] };

    case "expenses":
      const expenseQuery = supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year)
        .order("date", { ascending: false })
        .limit(100);
      
      if (householdId) {
        expenseQuery.eq("household_id", householdId);
      }
      
      const { data: expenses } = await expenseQuery;
      return { expenses: expenses || [] };

    case "gifts":
      const { data: giftLists } = await supabase
        .from("gift_lists")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year);
      
      const listIds = giftLists?.map((l: any) => l.id) || [];
      const { data: giftItems } = listIds.length > 0
        ? await supabase
            .from("gift_items")
            .select("*")
            .in("list_id", listIds)
        : { data: [] };
      
      return { lists: giftLists || [], items: giftItems || [] };

    default:
      return {};
  }
}

// Build context string from agent data
function buildAgentContext(
  agentData: Record<string, any>,
  selectedAgents: string[],
  profileData: any,
  year: number
): string {
  let context = `User Financial Profile for ${year}:\n\n`;
  
  if (profileData) {
    context += `Profile: ${profileData.first_name || ''} ${profileData.last_name || ''}\n\n`;
  }
  
  for (const agentKey of selectedAgents) {
    const agent = AGENTS[agentKey as keyof typeof AGENTS];
    const data = agentData[agentKey];
    
    context += `=== ${agent.emoji} ${agent.name} Data ===\n`;
    
    switch (agentKey) {
      case "budget":
        if (data.budget?.length > 0) {
          data.budget.forEach((b: any, i: number) => {
            context += `Budget ${i + 1}: Income $${b.income || 0}\n`;
            if (b.expenses) {
              const expenses = typeof b.expenses === 'string' ? JSON.parse(b.expenses) : b.expenses;
              if (expenses.fixed) {
                context += `Fixed expenses: ${JSON.stringify(expenses.fixed)}\n`;
              }
              if (expenses.custom?.length > 0) {
                context += `Custom expenses: ${JSON.stringify(expenses.custom)}\n`;
              }
            }
          });
        } else {
          context += "No budget data recorded.\n";
        }
        break;

      case "savings":
        if (data.goals?.length > 0) {
          data.goals.forEach((g: any) => {
            const progress = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(1) : 0;
            context += `Goal: ${g.title} - Target: $${g.target_amount}, Current: $${g.current_amount} (${progress}%)\n`;
          });
        } else {
          context += "No savings goals set.\n";
        }
        break;

      case "vendors":
        if (data.projects?.length > 0) {
          data.projects.forEach((p: any) => {
            context += `Project: ${p.title}\n`;
            const projectQuotes = data.quotes?.filter((q: any) => q.project_id === p.id) || [];
            projectQuotes.forEach((q: any) => {
              context += `  - ${q.vendor_name || 'Unknown'}: $${q.estimate_amount || 0}\n`;
            });
          });
        } else {
          context += "No vendor projects.\n";
        }
        break;

      case "vacation":
        if (data.projects?.length > 0) {
          data.projects.forEach((p: any) => {
            context += `Vacation: ${p.title}\n`;
            const options = data.options?.filter((o: any) => o.project_id === p.id) || [];
            options.forEach((o: any) => {
              const total = (o.lodging_cost || 0) + (o.travel_mode_cost || 0) + (o.car_rental_cost || 0);
              context += `  - ${o.destination || 'TBD'}: $${total} total\n`;
            });
          });
        } else {
          context += "No vacation plans.\n";
        }
        break;

      case "expenses":
        if (data.expenses?.length > 0) {
          const totalSpent = data.expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
          const byCategory: Record<string, number> = {};
          data.expenses.forEach((e: any) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + (parseFloat(e.amount) || 0);
          });
          context += `Total spent: $${totalSpent.toFixed(2)}\n`;
          context += `By category: ${JSON.stringify(byCategory)}\n`;
          context += `Recent transactions: ${data.expenses.slice(0, 10).map((e: any) => 
            `${e.date}: $${e.amount} at ${e.merchant || 'Unknown'} (${e.category})`
          ).join('; ')}\n`;
        } else {
          context += "No expenses recorded.\n";
        }
        break;

      case "gifts":
        if (data.lists?.length > 0) {
          data.lists.forEach((l: any) => {
            const listItems = data.items?.filter((i: any) => i.list_id === l.id) || [];
            const totalBudget = listItems.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
            const purchased = listItems.filter((i: any) => i.status === 'purchased').length;
            context += `List: ${l.list_title} - Budget: $${l.budget_target || 0}, Items: ${listItems.length} (${purchased} purchased), Est. Total: $${totalBudget}\n`;
          });
        } else {
          context += "No gift lists.\n";
        }
        break;
    }
    context += "\n";
  }
  
  return context;
}

// Build system prompt for the AI
function buildSystemPrompt(selectedAgents: string[], context: string, year: number): string {
  const agentNames = selectedAgents.map(key => 
    `${AGENTS[key as keyof typeof AGENTS].emoji} ${AGENTS[key as keyof typeof AGENTS].name}`
  ).join(" and ");

  return `You are an expert financial advisor AI assistant for a household budgeting app.

**ACTIVE SPECIALISTS:** ${agentNames}

**CRITICAL RULES:**
1. ONLY answer questions about the user's financial data shown below
2. ONLY discuss topics related to: budgeting, savings, expenses, vacation planning, vendor comparisons, and gift lists
3. If asked about unrelated topics (weather, sports, news, etc.), politely redirect to financial topics
4. Base ALL advice on the user's actual data for ${year}
5. Be specific with dollar amounts and percentages when the data supports it
6. If data is missing, acknowledge it and suggest the user add that information

**RESPONSE FORMAT:**
- Use **bold** for headings and key metrics
- Use bullet points for actionable advice
- Keep responses focused and actionable
- Be friendly and encouraging

**USER'S FINANCIAL DATA:**
${context}

Remember: You can ONLY help with questions about the user's finances within this app. Politely decline any off-topic requests.`;
}
