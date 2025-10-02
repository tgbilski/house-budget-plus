import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Mapbox Geocoding API
    const encodedAddress = encodeURIComponent(address);
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;

    console.log('Geocoding address:', address);

    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (!response.ok || !data.features || data.features.length === 0) {
      console.error('Geocoding failed:', data);
      return new Response(
        JSON.stringify({ error: 'Address not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    // Extract location components
    let city = '';
    let state = '';
    let country = '';

    for (const context of feature.context || []) {
      if (context.id.startsWith('place.')) {
        city = context.text;
      } else if (context.id.startsWith('region.')) {
        state = context.text;
      } else if (context.id.startsWith('country.')) {
        country = context.text;
      }
    }

    // If no city in context, try to get it from the place name
    if (!city && feature.place_type.includes('place')) {
      city = feature.text;
    }

    console.log('Geocoding successful:', { latitude, longitude, city, state, country });

    return new Response(
      JSON.stringify({
        latitude,
        longitude,
        city,
        state,
        country,
        formatted_address: feature.place_name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geocode-address function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to geocode address' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
