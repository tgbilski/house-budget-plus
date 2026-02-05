 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { query } = await req.json();
     
     if (!query || query.length < 2) {
       return new Response(
         JSON.stringify({ features: [] }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const mapboxToken = Deno.env.get("MAPBOX_ACCESS_TOKEN");
     if (!mapboxToken) {
       throw new Error("MAPBOX_ACCESS_TOKEN not configured");
     }
 
     const response = await fetch(
       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
       `access_token=${mapboxToken}&types=place,locality,region,country&limit=5`
     );
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error("Mapbox API error:", errorText);
       throw new Error(`Mapbox API returned ${response.status}`);
     }
 
     const data = await response.json();
     
     return new Response(
       JSON.stringify(data),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Geocoding error:", error);
     return new Response(
       JSON.stringify({ error: error.message, features: [] }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });