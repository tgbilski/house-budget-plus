import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    let metadata = { title: '', description: '', image: '' };

    // Attempt 1: Direct fetch for OG tags
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)' },
      });

      if (response.ok) {
        const html = await response.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
        const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                                html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);

        metadata = {
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
      }
    } catch (fetchError) {
      console.log(`Direct fetch failed: ${url}`, fetchError);
    }

    // Attempt 2: If direct fetch returned no useful data, try Microlink API
    const hasUsefulData = metadata.title || metadata.image;
    if (!hasUsefulData) {
      try {
        console.log(`Direct fetch empty, trying Microlink for: ${url}`);
        const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
        const mlResponse = await fetch(microlinkUrl);
        
        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          if (mlData.status === 'success' && mlData.data) {
            const d = mlData.data;
            metadata.title = metadata.title || d.title || '';
            // Filter out bot-block descriptions
            const desc = d.description || '';
            const isBlockPage = desc.toLowerCase().includes('could not be processed') || 
                               desc.toLowerCase().includes('blocked') ||
                               desc.toLowerCase().includes('captcha');
            metadata.description = metadata.description || (isBlockPage ? '' : desc);
            // Prefer OG image, fall back to Microlink screenshot
            metadata.image = d.image?.url || d.screenshot?.url || '';
          }
        }
      } catch (mlError) {
        console.log(`Microlink fallback failed: ${url}`, mlError);
      }
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
