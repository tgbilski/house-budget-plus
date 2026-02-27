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
    const { address } = await req.json()

    if (!address || typeof address !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // First check if Street View imagery exists for this address
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(address)}&key=${apiKey}`
    const metaResponse = await fetch(metadataUrl)
    const metaData = await metaResponse.json()

    if (metaData.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: 'No Street View imagery available', status: metaData.status }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Proxy the actual Street View image to avoid exposing the API key
    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${apiKey}`
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Street View image' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to get Street View image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
