import React, { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto', 
  style = { display: 'block' },
  responsive = true 
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="adsense-container w-full max-w-sm mx-auto overflow-hidden px-2">
      <ins
        className="adsbygoogle w-full"
        style={{ ...style, maxWidth: '100%', overflow: 'hidden' }}
        data-ad-client="ca-pub-5656855326953521"
        data-ad-slot={adSlot}
        data-ad-format={responsive ? 'auto' : adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};