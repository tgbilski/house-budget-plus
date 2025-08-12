import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
  return text.replace(/<[^>]*>/g, '').trim();
}

function parseRSSFeed(xmlContent: string, feedUrl: string): RSSItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "text/xml");
    
    if (!doc) {
      throw new Error("Failed to parse XML");
    }

    const items: RSSItem[] = [];
    
    // Try RSS 2.0 format first
    let itemElements = doc.querySelectorAll("item");
    let sourceName = cleanText(doc.querySelector("channel > title")?.textContent) || new URL(feedUrl).hostname;
    
    // If no items found, try Atom format
    if (itemElements.length === 0) {
      itemElements = doc.querySelectorAll("entry");
      sourceName = cleanText(doc.querySelector("feed > title")?.textContent) || new URL(feedUrl).hostname;
    }

    for (const item of itemElements) {
      const title = cleanText(
        item.querySelector("title")?.textContent
      );
      
      const description = cleanText(
        item.querySelector("description")?.textContent || 
        item.querySelector("summary")?.textContent ||
        item.querySelector("content")?.textContent
      );
      
      const link = item.querySelector("link")?.textContent?.trim() || 
                  item.querySelector("link")?.getAttribute("href") || '';
      
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || 
                     item.querySelector("published")?.textContent?.trim() ||
                     item.querySelector("updated")?.textContent?.trim() ||
                     new Date().toISOString();

      if (title && description) {
        items.push({
          title,
          description,
          link,
          pubDate,
          source: sourceName
        });
      }
    }

    return items.slice(0, 10); // Limit to 10 items
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error(`Failed to parse RSS feed: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedUrl } = await req.json();
    
    if (!feedUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Feed URL is required' 
        } as RSSResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate URL
    try {
      new URL(feedUrl);
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid URL format' 
        } as RSSResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching RSS feed from: ${feedUrl}`);

    // Fetch the RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'RSS-Reader/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlContent = await response.text();
    console.log(`Fetched XML content length: ${xmlContent.length}`);

    // Parse the RSS feed
    const items = parseRSSFeed(xmlContent, feedUrl);
    console.log(`Parsed ${items.length} items from RSS feed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: items 
      } as RSSResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

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