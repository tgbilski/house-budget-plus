// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EtsyProduct {
  listing_id: number;
  title: string;
  description: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  images: Array<{
    url_570xN: string;
    url_170x135: string;
  }>;
  url: string;
  tags: string[];
  quantity: number;
  state: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopName } = await req.json();
    
    if (!shopName) {
      return new Response(
        JSON.stringify({ error: 'Shop name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('ETSY_API_KEY');
    if (!apiKey) {
      console.error('Etsy API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Etsy API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching products for shop: ${shopName}`);

    // First, get the shop ID from the shop name
    const shopResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops?shop_name=${encodeURIComponent(shopName)}`,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopResponse.ok) {
      console.error('Failed to fetch shop info:', shopResponse.status, shopResponse.statusText);
      const errorText = await shopResponse.text();
      console.error('Shop response error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to find shop: ${shopResponse.status} ${shopResponse.statusText}`,
          details: errorText
        }),
        { 
          status: shopResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const shopData = await shopResponse.json();
    console.log('Shop data:', shopData);

    if (!shopData.results || shopData.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const shopId = shopData.results[0].shop_id;
    console.log(`Found shop ID: ${shopId}`);

    // Now fetch the shop's active listings
    const listingsResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active?includes=Images&limit=20`,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listingsResponse.ok) {
      console.error('Failed to fetch listings:', listingsResponse.status, listingsResponse.statusText);
      const errorText = await listingsResponse.text();
      console.error('Listings response error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch products: ${listingsResponse.status} ${listingsResponse.statusText}`,
          details: errorText
        }),
        { 
          status: listingsResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const listingsData = await listingsResponse.json();
    console.log(`Found ${listingsData.results?.length || 0} listings`);

    // Transform Etsy API response to our format
    const products: EtsyProduct[] = (listingsData.results || []).map((listing: any) => ({
      listing_id: listing.listing_id,
      title: listing.title,
      description: listing.description || '',
      price: {
        amount: parseInt(listing.price.amount) || 0,
        divisor: parseInt(listing.price.divisor) || 100,
        currency_code: listing.price.currency_code || 'USD',
      },
      images: (listing.images || []).map((img: any) => ({
        url_570xN: img.url_570xN || '',
        url_170x135: img.url_170x135 || '',
      })),
      url: listing.url || `https://www.etsy.com/listing/${listing.listing_id}`,
      tags: listing.tags || [],
      quantity: listing.quantity || 0,
      state: listing.state || 'active',
    }));

    console.log(`Successfully transformed ${products.length} products`);

    return new Response(
      JSON.stringify({ 
        success: true,
        products,
        shop_name: shopName,
        shop_id: shopId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in fetch-etsy-products function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});