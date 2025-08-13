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
  return text.replace(/<[^>]*>/g, '').trim();
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

    // Extract items using regex (more reliable in edge functions)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    
    let matches = [...xmlContent.matchAll(itemRegex)];
    if (matches.length === 0) {
      matches = [...xmlContent.matchAll(entryRegex)];
    }

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

    return items;
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