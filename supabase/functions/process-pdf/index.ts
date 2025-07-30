import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PDF] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("PDF processing function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check subscription status
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Check total usage for free users (lifetime limit, not monthly)
    if (!subscriber?.subscribed) {
      const { data: totalUsage, error: usageError } = await supabaseClient
        .from("pdf_processing_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("processing_status", "completed");

      if (usageError) {
        logStep("Error checking usage", { error: usageError.message });
        throw new Error("Failed to check usage limits");
      }

      if (totalUsage && totalUsage.length >= 1) {
        logStep("Free user exceeded lifetime limit", { count: totalUsage.length });
        return new Response(JSON.stringify({ 
          error: "You've used your free PDF. Upgrade to Premium for unlimited PDF processing.",
          requiresUpgrade: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    logStep("File received", { name: file.name, size: file.size, type: file.type });

    // Create processing log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from("pdf_processing_logs")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        processing_status: "processing"
      })
      .select()
      .single();

    if (logError || !logEntry) {
      logStep("Error creating log entry", { error: logError?.message });
      throw new Error("Failed to create processing log");
    }

    try {
      // Extract text from PDF using a simple text extraction approach
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      logStep("Text extracted from PDF", { textLength: text.length });

      // Categorize expenses using OpenAI (now enabled for all users for testing)
      let categorization = null;
      let foodTransactions = [];
      
      // Enable AI features for all users (free and premium) for testing
      try {
        categorization = await categorizeExpenses(text);
        logStep("AI categorization completed", { categories: Object.keys(categorization || {}).length });
        
        // Extract food transactions and save to takeout calendar for all users
        try {
          foodTransactions = await extractAndSaveFoodTransactions(text, user.id, supabaseClient);
          logStep("Food transactions extracted and saved", { count: foodTransactions.length });
        } catch (foodError) {
          logStep("Error in food transaction extraction", { error: foodError.message });
          foodTransactions = []; // Continue processing even if food extraction fails
        }
      } catch (aiError) {
        logStep("Error in AI processing", { error: aiError.message });
        // Continue without AI features if they fail
      }

      // Update log entry with results
      await supabaseClient
        .from("pdf_processing_logs")
        .update({
          processing_status: "completed",
          extracted_text: text,
          ai_categorization: categorization,
          processed_at: new Date().toISOString()
        })
        .eq("id", logEntry.id);

      logStep("Processing completed successfully");

      return new Response(JSON.stringify({
        success: true,
        extracted_text: text,
        categorization: categorization,
        foodTransactions: foodTransactions,
        message: categorization || foodTransactions.length > 0
          ? `PDF processed with AI categorization! ${foodTransactions.length} food transactions automatically added to your takeout calendar.`
          : "PDF processed successfully. Try uploading a credit card statement to see automatic food transaction extraction in action!"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (processingError) {
      // Update log entry with error
      await supabaseClient
        .from("pdf_processing_logs")
        .update({
          processing_status: "failed",
          processing_error: processingError instanceof Error ? processingError.message : String(processingError)
        })
        .eq("id", logEntry.id);

      throw processingError;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-pdf", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // Simple PDF text extraction - in a real implementation, you'd use a proper PDF parsing library
  const uint8Array = new Uint8Array(arrayBuffer);
  const text = new TextDecoder().decode(uint8Array);
  
  // Extract readable text between stream objects (very basic approach)
  const matches = text.match(/BT\s+(.*?)\s+ET/gs);
  if (matches) {
    return matches.map(match => 
      match.replace(/BT\s+|\s+ET/g, '')
           .replace(/[^\w\s\$\.\,\-\(\)]/g, ' ')
           .replace(/\s+/g, ' ')
           .trim()
    ).join(' ').substring(0, 5000); // Limit to first 5000 characters
  }
  
  // Fallback: extract any readable text
  return text.replace(/[^\w\s\$\.\,\-\(\)]/g, ' ')
             .replace(/\s+/g, ' ')
             .trim()
             .substring(0, 5000);
}

async function categorizeExpenses(text: string): Promise<any> {
  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      logStep("OpenAI API key not configured");
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI that categorizes expenses from receipts and invoices. 
            Analyze the provided text and extract expense items with their amounts and categories.
            Return a JSON object with categories as keys and arrays of expense items as values.
            Categories should include: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Other.
            Each item should have: description, amount, and date (if available).`
          },
          {
            role: 'user',
            content: `Please categorize the expenses from this receipt/invoice text: ${text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content;
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // If JSON parsing fails, return a simple categorization
        return {
          "Uncategorized": [{ description: "Manual categorization needed", amount: "Unknown" }]
        };
      }
    }
    
    return null;
  } catch (error) {
    logStep("Error in AI categorization", { error: error.message });
    return null;
  }
}

async function extractAndSaveFoodTransactions(text: string, userId: string, supabaseClient: any): Promise<any[]> {
  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      logStep("OpenAI API key not configured for food extraction");
      return [];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI that extracts food and dining transactions from credit card statements or bank statements.
            
            Focus on:
            - Restaurants (fast food, casual dining, fine dining)
            - Food delivery services (DoorDash, Uber Eats, Grubhub, etc.)
            - Coffee shops and cafes
            - Grocery stores and food markets
            - Bars and breweries
            - Food trucks and street vendors
            
            For each food transaction, extract:
            - date (in YYYY-MM-DD format)
            - amount (as a positive number)
            - merchant name
            - transaction type/description
            
            Return a JSON array of transactions. Only include transactions that are clearly food-related.
            Format: [{"date": "2024-01-15", "amount": 12.50, "merchant": "McDonald's", "description": "Fast food - lunch"}]`
          },
          {
            role: 'user',
            content: `Extract food and dining transactions from this credit card/bank statement: ${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content;
    
    if (!result) {
      logStep("No response from OpenAI for food extraction");
      return [];
    }

    let transactions: any[];
    try {
      transactions = JSON.parse(result);
    } catch (parseError) {
      logStep("Failed to parse food transactions JSON", { error: parseError.message, result });
      return [];
    }

    if (!Array.isArray(transactions)) {
      logStep("Food transactions result is not an array", { result });
      return [];
    }

    // Filter and validate transactions
    const validTransactions = transactions.filter(t => 
      t.date && t.amount && t.merchant && 
      typeof t.amount === 'number' && t.amount > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(t.date)
    );

    logStep("Valid food transactions found", { count: validTransactions.length });

    // Save transactions to takeout calendar
    if (validTransactions.length > 0) {
      // Load existing takeout data
      const { data: existingData } = await supabaseClient
        .from('budget_data')
        .select('*')
        .eq('user_id', userId)
        .eq('page_type', 'takeout')
        .order('created_at', { ascending: false })
        .limit(1);

      let currentSpendingData = [];
      if (existingData && existingData.length > 0) {
        const expensesData = existingData[0].expenses;
        if (expensesData && expensesData.spendingData) {
          currentSpendingData = expensesData.spendingData;
        }
      }

      // Add new transactions (avoid duplicates by checking date + amount + merchant)
      const newEntries = [];
      for (const transaction of validTransactions) {
        const exists = currentSpendingData.some((existing: any) => 
          existing.date === transaction.date && 
          Math.abs(existing.amount - transaction.amount) < 0.01 &&
          existing.notes && existing.notes.toLowerCase().includes(transaction.merchant.toLowerCase())
        );

        if (!exists) {
          newEntries.push({
            date: transaction.date,
            amount: transaction.amount,
            notes: `${transaction.merchant} - ${transaction.description || 'Food/Dining'}`
          });
        }
      }

      if (newEntries.length > 0) {
        const updatedSpendingData = [...currentSpendingData, ...newEntries];

        // Save to database
        await supabaseClient
          .from('budget_data')
          .upsert({
            user_id: userId,
            page_type: 'takeout',
            calculator_id: 'takeout',
            income: 0,
            expenses: { spendingData: updatedSpendingData }
          });

        logStep("Food transactions saved to takeout calendar", { newEntries: newEntries.length });
      }
    }

    return validTransactions;
    
  } catch (error) {
    logStep("Error extracting food transactions", { error: error.message });
    return [];
  }