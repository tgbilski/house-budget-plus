import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Store, Heart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
      // Note: This would need a backend endpoint to handle Etsy API calls
      // due to CORS restrictions and API key security
      // For now, we'll use demo data
      
      console.log(`Would fetch products for shop: ${shop}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(demoProducts);
      setCurrentShopName(shop);
      
      toast({
        title: "Products loaded",
        description: `Showing demo products for ${shop}`,
      });
    } catch (error) {
      console.error('Error fetching Etsy products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Using demo data.",
        variant: "destructive",
      });
      setProducts(demoProducts);
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
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Store className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>My Etsy Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showcase your handmade creations
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Enter your Etsy shop name"
            value={inputShopName}
            onChange={(e) => setInputShopName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => fetchEtsyProducts(inputShopName)}
            disabled={loading}
            className="gap-2"
          >
            <Store className="h-4 w-4" />
            {loading ? 'Loading...' : 'Load Products'}
          </Button>
        </div>

        {currentShopName && (
          <div className="mb-4">
            <Badge variant="outline" className="gap-2">
              <Store className="h-3 w-3" />
              {currentShopName}
            </Badge>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.listing_id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0]?.url_170x135 || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm line-clamp-2 mb-2">
                    {product.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {product.quantity} left
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(product.url, '_blank')}
                      className="flex-1 gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToGiftList(product)}
                      className="flex-1 gap-1"
                    >
                      <Heart className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && currentShopName && (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No products found for this shop</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 mb-1">Connect Your Etsy Shop</p>
              <p className="text-orange-700">
                Enter your Etsy shop name to display your products here. Visitors can easily add your items to their gift lists. 
                <span className="block mt-1 text-xs">
                  Note: Currently showing demo products. Full Etsy API integration requires backend setup.
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};