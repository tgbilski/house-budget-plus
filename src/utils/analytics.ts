// Google Analytics event tracking utility
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-TP66P3R9YC', {
      page_path: url,
    });
  }
};

// Google Ads Conversion Tracking
// Replace these with your actual Google Ads Conversion ID and Label from your Google Ads account
// Find these in: Google Ads > Tools & Settings > Conversions > Your conversion action > Tag setup
const GOOGLE_ADS_CONVERSION_ID = 'AW-XXXXXXXXXX'; // e.g., 'AW-123456789'
const GOOGLE_ADS_SIGNUP_LABEL = 'XXXXXXXXXXX'; // e.g., 'AbCdEfGhIjK'

export const trackGoogleAdsConversion = (conversionLabel: string = GOOGLE_ADS_SIGNUP_LABEL, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_CONVERSION_ID}/${conversionLabel}`,
      ...(value && { value, currency: 'USD' }),
    });
  }
};

// Track sign-up conversion for Google Ads
export const trackSignUpConversion = () => {
  // Track in Google Analytics
  trackEvent('sign_up', {
    method: 'email',
  });
  
  // Track in Google Ads
  trackGoogleAdsConversion();
};

// Track Google sign-up conversion
export const trackGoogleSignUpConversion = () => {
  trackEvent('sign_up', {
    method: 'google',
  });
  
  trackGoogleAdsConversion();
};

// Common event tracking functions
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

export const trackFormSubmit = (formName: string) => {
  trackEvent('form_submit', {
    form_name: formName,
  });
};

export const trackCalculatorUse = (calculatorType: string) => {
  trackEvent('calculator_use', {
    calculator_type: calculatorType,
  });
};

export const trackFeatureView = (featureName: string) => {
  trackEvent('feature_view', {
    feature_name: featureName,
  });
};
