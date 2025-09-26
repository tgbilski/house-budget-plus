
// @ts-nocheck

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

interface RSSResponse {
  success: boolean;
  data?: RSSItem[];
  error?: string;
}

function cleanText(text: string | null): string {
  if (!text) return '';
  
  // First remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const entityMap: { [key: string]: string } = {
    '&#x2019;': "'",
    '&#x2018;': "'", 
    '&#x201C;': '"',
    '&#x201D;': '"',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#39;': "'",
    '&apos;': "'"
  };
  
  // Replace HTML entities
  for (const [entity, replacement] of Object.entries(entityMap)) {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
  }
  
  // Handle numeric HTML entities (like &#8217; for apostrophe)
  cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Handle hex HTML entities (like &#x2019;)
  cleaned = cleaned.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return cleaned.trim();
}

function parseRSSFeed(xmlContent: string, feedUrl: string): RSSItem[] {
  try {
    const items: RSSItem[] = [];
    let sourceName = new URL(feedUrl).hostname;
    
    // Extract channel/feed title
    const channelTitleMatch = xmlContent.match(/<channel[^>]*>[\s\S]*?<title[^>]*>(.*?)<\/title>/i) ||
                             xmlContent.match(/<feed[^>]*>[\s\S]*?<title[^>]*>(.*?)<\/title>/i);
    if (channelTitleMatch) {
      sourceName = cleanText(channelTitleMatch[1]);
    }
    
    console.log(`Source name extracted: ${sourceName}`);

    // Extract items using regex (more reliable in edge functions)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    
    let matches = [...xmlContent.matchAll(itemRegex)];
    if (matches.length === 0) {
      matches = [...xmlContent.matchAll(entryRegex)];
    }
    
    console.log(`Found ${matches.length} items/entries in RSS feed`);

    for (const match of matches.slice(0, 10)) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title[^>]*>(.*?)<\/title>/i);
      const descMatch = itemContent.match(/<description[^>]*>(.*?)<\/description>/i) ||
                       itemContent.match(/<summary[^>]*>(.*?)<\/summary>/i) ||
                       itemContent.match(/<content[^>]*>(.*?)<\/content>/i);
      const linkMatch = itemContent.match(/<link[^>]*>(.*?)<\/link>/i) ||
                       itemContent.match(/<link[^>]*href=["'](.*?)["']/i);
      const pubDateMatch = itemContent.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i) ||
                          itemContent.match(/<published[^>]*>(.*?)<\/published>/i) ||
                          itemContent.match(/<updated[^>]*>(.*?)<\/updated>/i);

      const title = titleMatch ? cleanText(titleMatch[1]) : '';
      const description = descMatch ? cleanText(descMatch[1]) : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

      if (title) {
        console.log(`Adding item: ${title.substring(0, 50)}...`);
        items.push({
          title,
          description: description || title.substring(0, 100) + '...', // Use title as fallback
          link,
          pubDate,
          source: sourceName
        });
      } else {
        console.log(`Skipping item - no title found in: ${itemContent.substring(0, 100)}`);
      }
    }

    return items;
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error(`Failed to parse RSS feed: ${error.message}`);
  }
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} to fetch: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        return response;
      }
      
      console.log(`Attempt ${i + 1} failed with status: ${response.status}`);
      if (i === maxRetries - 1) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedUrl } = await req.json();
    
    // Fallback feeds if none provided or if primary fails
    const fallbackFeeds = [
      feedUrl || "https://rss.cnn.com/rss/money_news_international.rss",
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://www.marketwatch.com/rss/topstories",
      "https://finance.yahoo.com/news/rssindex"
    ];

    let lastError: Error | null = null;
    
    // Try each feed until one works
    for (const currentFeedUrl of fallbackFeeds) {
      try {
        // Validate URL
        new URL(currentFeedUrl);
        
        console.log(`Trying RSS feed: ${currentFeedUrl}`);

        // Fetch the RSS feed with retry logic
        const response = await fetchWithRetry(currentFeedUrl);
        const xmlContent = await response.text();
        console.log(`Fetched XML content length: ${xmlContent.length}`);

        // Basic validation that we got XML content
        if (!xmlContent.includes('<') || xmlContent.length < 100) {
          throw new Error('Invalid XML content received');
        }

        // Parse the RSS feed
        const items = parseRSSFeed(xmlContent, currentFeedUrl);
        console.log(`Successfully parsed ${items.length} items from RSS feed`);

        if (items.length > 0) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: items 
            } as RSSResponse),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          throw new Error('No items found in feed');
        }

      } catch (error) {
        console.error(`Failed to fetch from ${currentFeedUrl}:`, error.message);
        lastError = error;
        continue; // Try next feed
      }
    }

    // If all feeds failed, return the last error
    throw lastError || new Error('All RSS feeds failed');

  } catch (error) {
    console.error('Error in fetch-rss function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      } as RSSResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
