import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Domains that need Firecrawl (they block simple fetches)
const FIRECRAWL_DOMAINS = ['zillow.com', 'realtor.com', 'redfin.com', 'trulia.com'];

function needsFirecrawl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return FIRECRAWL_DOMAINS.some(d => hostname.includes(d));
  } catch {
    return false;
  }
}

async function fetchWithFirecrawl(url: string) {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return null;
  }

  console.log('Using Firecrawl for:', url);

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 5000,
    }),
  });

  if (!response.ok) {
    console.error('Firecrawl error:', response.status);
    return null;
  }

  const result = await response.json();
  const markdown = result?.data?.markdown || result?.markdown || '';
  const metadata = result?.data?.metadata || result?.metadata || {};

  console.log('Firecrawl metadata keys:', Object.keys(metadata));

  // Extract from metadata first
  const title = metadata?.title || metadata?.ogTitle || '';
  const description = metadata?.description || metadata?.ogDescription || '';
  const image = metadata?.ogImage || '';

  // Parse property details from markdown content
  const details: Record<string, string> = {};

  // Price patterns
  const priceMatch = markdown.match(/\$[\d,]+(?:,\d{3})*/) || 
                     title.match(/\$[\d,]+/) ||
                     description.match(/\$[\d,]+/);
  if (priceMatch) details.price = priceMatch[0];

  // Beds
  const bedMatch = markdown.match(/(\d+)\s*(?:bed|bd|br|bedroom)/i) ||
                   title.match(/(\d+)\s*(?:bed|bd|br|bedroom)/i);
  if (bedMatch) details.beds = bedMatch[1];

  // Baths
  const bathMatch = markdown.match(/(\d+\.?\d*)\s*(?:bath|ba|bathroom)/i) ||
                    title.match(/(\d+\.?\d*)\s*(?:bath|ba|bathroom)/i);
  if (bathMatch) details.baths = bathMatch[1];

  // Sqft
  const sqftMatch = markdown.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i) ||
                    title.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
  if (sqftMatch) details.sqft = sqftMatch[1];

  // Address - try to extract from title or markdown
  const addressMatch = title.match(/^(.+?)(?:\s*[-|,]\s*\$|\s*\|)/);
  if (addressMatch) details.address = addressMatch[1].trim();

  return { title, description, image, ...details };
}

async function fetchSimple(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)' },
    });

    if (!response.ok) {
      console.log(`URL returned ${response.status}: ${url}`);
      return { title: '', description: '', image: '' };
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                            html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);

    const metadata = {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || '',
      description: descriptionMatch?.[1] || '',
      image: ogImageMatch?.[1] || '',
    };

    // Make image URL absolute
    if (metadata.image && !metadata.image.startsWith('http')) {
      const urlObj = new URL(url);
      if (metadata.image.startsWith('//')) {
        metadata.image = `${urlObj.protocol}${metadata.image}`;
      } else if (metadata.image.startsWith('/')) {
        metadata.image = `${urlObj.origin}${metadata.image}`;
      } else {
        metadata.image = `${urlObj.origin}/${metadata.image}`;
      }
    }

    return metadata;
  } catch (fetchError) {
    console.log(`Failed to fetch URL: ${url}`, fetchError);
    return { title: '', description: '', image: '' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: any = await req.json()
    const url = body?.url

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let metadata;
    if (needsFirecrawl(url)) {
      metadata = await fetchWithFirecrawl(url);
      if (!metadata) {
        // Fallback to simple fetch
        metadata = await fetchSimple(url);
      }
    } else {
      metadata = await fetchSimple(url);
    }

    return new Response(
      JSON.stringify({ ...metadata, url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to fetch URL metadata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
