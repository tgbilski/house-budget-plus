// Google Analytics event tracking utility
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }
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
