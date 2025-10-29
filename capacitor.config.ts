import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.housebudgetcalculator.app',
  appName: 'House Budget Plus',
  webDir: 'dist',
  server: {
    url: 'https://0a1c5ef3-a0c1-4de2-8f49-9b0a9540368a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
