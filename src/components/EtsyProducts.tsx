import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Store, Heart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  shop_section_id?: number;
  tags: string[];
  quantity: number;
  state: string;
}

interface EtsyProductsProps {
  shopName?: string;
}

export const EtsyProducts: React.FC<EtsyProductsProps> = ({ shopName = '' }) => {
  const [products, setProducts] = useState<EtsyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentShopName, setCurrentShopName] = useState(shopName);
  const [inputShopName, setInputShopName] = useState(shopName);
  const { toast } = useToast();

  // Demo products for when API is not available
  const demoProducts: EtsyProduct[] = [
    {
      listing_id: 1,
      title: "Handcrafted Wooden Photo Frame",
      description: "Beautiful rustic wooden frame perfect for your favorite memories",
      price: { amount: 2500, divisor: 100, currency_code: "USD" },
      images: [{ url_570xN: "/placeholder.svg", url_170x135: "/placeholder.svg" }],
      url: "https://etsy.com/listing/demo1",
      tags: ["wooden", "rustic", "photo frame"],
      quantity: 5,
      state: "active"
    },
    {
      listing_id: 2,
      title: "Custom Leather Wallet",
      description: "Personalized leather wallet with your initials",
      price: { amount: 4500, divisor: 100, currency_code: "USD" },
      images: [{ url_570xN: "/placeholder.svg", url_170x135: "/placeholder.svg" }],
      url: "https://etsy.com/listing/demo2",
      tags: ["leather", "custom", "wallet"],
      quantity: 3,
      state: "active"
    },
    {
      listing_id: 3,
      title: "Vintage Style Ceramic Mug",
      description: "Handmade ceramic mug with vintage-inspired design",
      price: { amount: 1800, divisor: 100, currency_code: "USD" },
      images: [{ url_570xN: "/placeholder.svg", url_170x135: "/placeholder.svg" }],
      url: "https://etsy.com/listing/demo3",
      tags: ["ceramic", "vintage", "mug"],
      quantity: 12,
      state: "active"
    },
    {
      listing_id: 4,
      title: "Artisan Jewelry Box",
      description: "Elegant wooden jewelry box with velvet interior",
      price: { amount: 6500, divisor: 100, currency_code: "USD" },
      images: [{ url_570xN: "/placeholder.svg", url_170x135: "/placeholder.svg" }],
      url: "https://etsy.com/listing/demo4",
      tags: ["jewelry", "wooden", "artisan"],
      quantity: 2,
      state: "active"
    }
  ];

  const fetchEtsyProducts = async (shop: string) => {
    if (!shop.trim()) {
      toast({
        title: "Shop name required",
        description: "Please enter your Etsy shop name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching products for shop: ${shop}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-etsy-products', {
        body: { shopName: shop }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch products');
      }

      if (data.error) {
        console.error('Etsy API error:', data.error);
        throw new Error(data.error);
      }

      if (data.success && data.products) {
        setProducts(data.products);
        setCurrentShopName(shop);
        
        toast({
          title: "Products loaded successfully!",
          description: `Found ${data.products.length} products from ${shop}`,
        });
      } else {
        throw new Error('No products found');
      }
    } catch (error) {
      console.error('Error fetching Etsy products:', error);
      toast({
        title: "Error loading products",
        description: error.message || "Failed to fetch products. Please check your shop name and try again.",
        variant: "destructive",
      });
      
      // Don't set demo products on error - let user know it failed
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: EtsyProduct['price']) => {
    const amount = price.amount / price.divisor;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency_code
    }).format(amount);
  };

  const addToGiftList = (product: EtsyProduct) => {
    // Dispatch custom event that GiftCard components can listen to
    const event = new CustomEvent('autofillGiftItem', {
      detail: {
        gift_idea: product.title,
        price: formatPrice(product.price),
        url: product.url
      }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Added to list",
      description: `${product.title} info ready to add to a gift list`,
    });
  };

  useEffect(() => {
    if (shopName) {
      fetchEtsyProducts(shopName);
    }
  }, [shopName]);

  return (
    <Card className="mt-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-orange-900">Suggested Gifts</CardTitle>
              <p className="text-sm text-orange-700 font-medium">
                🎁 Handcrafted items perfect for gift-giving • Support our shop!
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-orange-200 text-orange-800 font-semibold">
            Exclusive
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {!currentShopName && (
          <div className="flex gap-3 mb-6 p-4 bg-white/60 rounded-lg border border-orange-200">
            <Input
              placeholder="Enter your Etsy shop name to showcase products"
              value={inputShopName}
              onChange={(e) => setInputShopName(e.target.value)}
              className="flex-1 border-orange-200 focus:border-orange-400"
            />
            <Button 
              onClick={() => fetchEtsyProducts(inputShopName)}
              disabled={loading}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Store className="h-4 w-4" />
              {loading ? 'Loading...' : 'Showcase Products'}
            </Button>
          </div>
        )}

        {currentShopName && (
          <div className="mb-6 text-center">
            <Badge variant="outline" className="gap-2 text-orange-700 border-orange-300 bg-white/80 px-4 py-2">
              <Store className="h-4 w-4" />
              Shop: {currentShopName}
            </Badge>
            <p className="text-sm text-orange-600 mt-2">
              Click any product to visit our Etsy shop and purchase!
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.listing_id} className="group hover:shadow-xl transition-all duration-300 border-orange-200 hover:border-orange-300 bg-white/90 backdrop-blur-sm">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <img
                    src={product.images[0]?.url_170x135 || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white shadow-lg">
                      Gift Idea
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900">
                    {product.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-lg text-orange-600">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                      {product.quantity} available
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(product.url, '_blank')}
                      className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy on Etsy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToGiftList(product)}
                      className="w-full gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Heart className="h-4 w-4" />
                      Save to List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && currentShopName && (
          <div className="text-center py-12 text-orange-600">
            <Store className="h-16 w-16 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm">Check your shop name or try again later</p>
          </div>
        )}

        <div className="mt-6 p-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500 rounded-full">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-2 text-lg">🛍️ Shop Owner?</h3>
              <p className="text-orange-800 mb-3 leading-relaxed">
                Showcase your handcrafted products as suggested gifts! Enter your Etsy shop name above to display your items. 
                When visitors click "Buy on Etsy", they'll go directly to your shop to make a purchase.
              </p>
              <div className="bg-white/60 p-3 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  <strong>💡 Pro tip:</strong> This drives real traffic and sales to your Etsy shop while providing gift inspiration to users.
                  <span className="block mt-1 text-xs opacity-75">
                    Currently showing demo products. Contact support for full Etsy API integration.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};