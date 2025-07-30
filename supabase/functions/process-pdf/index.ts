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
          foodTransactions = await extractAndSaveFoodTransactions(text, user.id, supabaseClient, file.name);
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
  logStep("Starting PDF text extraction", { bufferSize: arrayBuffer.byteLength });
  
  const uint8Array = new Uint8Array(arrayBuffer);
  const text = new TextDecoder().decode(uint8Array);
  
  let extractedText = '';
  
  // Method 1: Look for text between parentheses - improved to handle encoded text
  const parenthesesMatches = text.match(/\([^)]+\)/g);
  if (parenthesesMatches) {
    logStep("Found parentheses text matches", { count: parenthesesMatches.length });
    const cleanText = parenthesesMatches
      .map(match => {
        let cleaned = match.replace(/[()]/g, '');
        // Handle common PDF encoding issues
        cleaned = cleaned.replace(/\\(\d{3})/g, (match, oct) => String.fromCharCode(parseInt(oct, 8)));
        cleaned = cleaned.replace(/\\([nrtbf\\()])/g, (match, char) => {
          const replacements = { 'n': '\n', 'r': '\r', 't': '\t', 'b': '\b', 'f': '\f', '\\': '\\', '(': '(', ')': ')' };
          return replacements[char] || char;
        });
        return cleaned;
      })
      .filter(text => text.length > 1 && /[a-zA-Z0-9]/.test(text))
      .join(' ');
    extractedText = cleanText;
  }
  
  // Method 2: Look for stream content between stream/endstream markers
  if (!extractedText || extractedText.length < 50) {
    logStep("Trying stream content extraction");
    const streamMatches = text.match(/stream\s+([\s\S]*?)\s+endstream/g);
    if (streamMatches) {
      let streamText = '';
      streamMatches.forEach(stream => {
        const content = stream.replace(/stream\s+|\s+endstream/g, '');
        // Look for readable patterns in stream content
        const readableMatches = content.match(/[A-Za-z][A-Za-z0-9\s\$\.\,\-\(\)\/\:]{3,}/g);
        if (readableMatches) {
          streamText += readableMatches.join(' ') + ' ';
        }
      });
      if (streamText.length > extractedText.length) {
        extractedText = streamText;
      }
    }
  }
  
  // Method 3: Advanced text pattern extraction for financial documents
  if (!extractedText || extractedText.length < 50) {
    logStep("Trying financial document pattern extraction");
    const patterns = [
      // Look for merchant names (common restaurant/food patterns)
      /(?:MCDONALD|BURGER|PIZZA|STARBUCKS|SUBWAY|KFC|TACO|DOMINO|WENDY|CHIPOTLE|PANERA|DUNKIN)[A-Z0-9\s#]{0,20}/gi,
      // Food delivery services
      /(?:DOORDASH|UBEREATS|GRUBHUB|POSTMATES|DELIVEROO)[A-Z0-9\s#]{0,20}/gi,
      // Payment amounts with context
      /\$\s*\d{1,4}[\.\,]\d{2}(?:\s|$)/g,
      // Dates in various formats
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
      // Transaction descriptions
      /(?:PURCHASE|PAYMENT|DEBIT|CREDIT)\s+[A-Z0-9\s]{5,30}/gi,
      // General merchant patterns with context
      /[A-Z]{3,}(?:\s+[A-Z]{2,}){0,2}\s+\$?\d+[\.\,]\d{2}/g,
      // Look for any text that might be merchant names followed by amounts
      /[A-Z][A-Za-z\s]{4,20}\s+\$?\d{1,4}[\.\,]\d{2}/g
    ];
    
    let patternText = '';
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        patternText += matches.join(' ') + ' ';
      }
    });
    
    if (patternText.length > extractedText.length) {
      extractedText = patternText;
    }
  }
  
  // Method 4: Look for BT/ET text objects with better handling
  if (!extractedText || extractedText.length < 50) {
    logStep("Trying BT/ET text object extraction");
    const btEtMatches = text.match(/BT\s+([\s\S]*?)\s+ET/g);
    if (btEtMatches) {
      const btEtText = btEtMatches
        .map(match => {
          let content = match.replace(/BT\s+|\s+ET/g, '');
          // Remove PDF operators and keep readable content
          content = content.replace(/\b(?:Tf|Td|TD|Tm|TL|Tc|Tw|Tz|TZ|Tr|Ts)\b\s*[^\s]*/g, '');
          content = content.replace(/\b\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s+(?:m|l|c|v|y|h|re|S|s|f|F|B|b|W|w)\b/g, '');
          return content;
        })
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');
      
      if (btEtText.length > extractedText.length) {
        extractedText = btEtText;
      }
    }
  }
  
  // Method 5: Last resort - try to find any recognizable patterns in the raw text
  if (!extractedText || extractedText.length < 50) {
    logStep("Trying last resort text extraction");
    // Look for any sequences that might be readable
    const fallbackMatches = text.match(/[A-Za-z]{4,}(?:\s+[A-Za-z0-9\$\.\,\-]{1,15}){0,5}/g);
    if (fallbackMatches) {
      const fallbackText = fallbackMatches
        .filter(match => match.length > 5 && /[A-Za-z]/.test(match))
        .slice(0, 50) // Limit to prevent too much noise
        .join(' ');
      if (fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }
  }
  
  // Clean and normalize the result
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\$\.\,\-\(\)\/\:\#]/g, ' ')
    .replace(/\b[A-Z]{1}\b/g, '') // Remove single capital letters
    .replace(/\b\d{10,}\b/g, '') // Remove very long numbers (likely not amounts)
    .trim()
    .substring(0, 5000);
  
  logStep("PDF text extraction completed", { 
    extractedLength: extractedText.length, 
    preview: extractedText.substring(0, 200),
    hasReadableContent: /[a-zA-Z]{3,}/.test(extractedText),
    containsFinancialTerms: /(?:MCDONALD|BURGER|PIZZA|STARBUCKS|\$\d+|\d{1,2}\/\d{1,2}\/\d{2,4})/i.test(extractedText)
  });
  
  return extractedText;
}

async function categorizeExpenses(text: string): Promise<any> {
  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      logStep("OpenAI API key not configured - categorization disabled");
      return null;
    }
    logStep("OpenAI API key found, proceeding with categorization");

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

async function extractAndSaveFoodTransactions(text: string, userId: string, supabaseClient: any, fileName: string): Promise<any[]> {
  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      logStep("OpenAI API key not configured for food extraction - skipping");
      return [];
    }
    logStep("OpenAI API key found, proceeding with food transaction extraction");

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
      // Clean up the result to remove any markdown formatting
      const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      transactions = JSON.parse(cleanedResult);
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

    // Save transactions to the new dedicated takeout_transactions table
    const savedTransactions = [];
    for (const transaction of validTransactions) {
      try {
        // Check if this transaction already exists to avoid duplicates
        const { data: existingData, error: checkError } = await supabaseClient
          .from('takeout_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('date', transaction.date)
          .eq('merchant', transaction.merchant)
          .eq('amount', transaction.amount);
        
        if (checkError) {
          logStep("Error checking for existing transaction", { error: checkError.message });
          continue;
        }
        
        // If no existing transaction found, save it
        if (!existingData || existingData.length === 0) {
          const { data: insertData, error: insertError } = await supabaseClient
            .from('takeout_transactions')
            .insert({
              user_id: userId,
              date: transaction.date,
              amount: transaction.amount,
              merchant: transaction.merchant,
              description: transaction.description,
              category: 'Food & Dining',
              pdf_source: fileName
            });
          
          if (insertError) {
            logStep("Error saving food transaction", { error: insertError.message });
          } else {
            savedTransactions.push(transaction);
            logStep("Saved food transaction", { transaction });
          }
        } else {
          logStep("Duplicate transaction skipped", { merchant: transaction.merchant });
        }
      } catch (saveError) {
        logStep("Error processing food transaction", { error: saveError.message });
      }
    }

    logStep("Food transactions saved to dedicated table", { savedCount: savedTransactions.length, totalFound: validTransactions.length });
    return savedTransactions;
    
  } catch (error) {
    logStep("Error extracting food transactions", { error: error.message });
    return [];
  }
}