# Mobile App Setup Guide

This guide will help you set up and build the native iOS/Android mobile app for House Budget Plus.

## Overview

The mobile app is a simplified version that includes:
- Login/Sign Up page
- Voice Expense Tracker (for subscribed users only)
- Non-subscribers see a message directing them to housebudgetcalculator.com

## Prerequisites

### For iOS Development:
- Mac computer with macOS
- Xcode installed (download from App Store)
- iOS device or iOS Simulator

### For Android Development:
- Mac, Windows, or Linux computer
- Android Studio installed
- Android device or Android Emulator

## Step 1: Export Project to GitHub

1. In your Lovable project, click the GitHub button in the top right
2. Connect your GitHub account if not already connected
3. Export/transfer your project to a new or existing GitHub repository

## Step 2: Clone Project Locally

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install
```

## Step 3: Initialize Capacitor

The Capacitor configuration is already set up in `capacitor.config.ts`. You just need to add the native platforms:

### Add iOS Platform (Mac only):
```bash
npx cap add ios
```

### Add Android Platform:
```bash
npx cap add android
```

## Step 4: Update Native Platform Dependencies

After adding platforms, update the dependencies:

```bash
# For iOS
npx cap update ios

# For Android
npx cap update android
```

## Step 5: Build the Web App

Before running on mobile, build the web application:

```bash
npm run build
```

## Step 6: Sync Changes to Native Projects

Whenever you make code changes, sync them to the native platforms:

```bash
npx cap sync
```

This command:
- Copies web assets to native projects
- Updates native dependencies
- Syncs configuration changes

## Step 7: Run on Device/Emulator

### For iOS:

**Option 1: Using Command Line**
```bash
npx cap run ios
```

**Option 2: Using Xcode**
```bash
# Open Xcode
npx cap open ios
```
Then in Xcode:
1. Select your target device/simulator
2. Click the "Play" button to build and run

**Note**: For physical iOS devices, you'll need:
- An Apple Developer account
- Proper code signing certificates
- Your device added to Xcode

### For Android:

**Option 1: Using Command Line**
```bash
npx cap run android
```

**Option 2: Using Android Studio**
```bash
# Open Android Studio
npx cap open android
```
Then in Android Studio:
1. Select your target device/emulator
2. Click the "Run" button to build and run

## Development Workflow

### Testing During Development

The app is configured to connect to your Lovable preview URL for hot-reload during development:
```
https://0a1c5ef3-a0c1-4de2-8f49-9b0a9540368a.lovableproject.com
```

This means:
- You can make changes in Lovable
- Changes appear immediately in the mobile app
- No need to rebuild constantly

### For Production Build

When ready to deploy, update `capacitor.config.ts`:

1. Remove or comment out the `server` section:
```typescript
// server: {
//   url: 'https://0a1c5ef3-a0c1-4de2-8f49-9b0a9540368a.lovableproject.com',
//   cleartext: true
// },
```

2. Build and sync:
```bash
npm run build
npx cap sync
```

3. The app will now use the locally bundled web assets

## App Store Deployment

### iOS App Store:
1. Configure signing in Xcode
2. Create App Store Connect listing
3. Archive and upload through Xcode
4. Submit for review

### Google Play Store:
1. Generate signed APK/AAB in Android Studio
2. Create Play Console listing
3. Upload release build
4. Submit for review

## Troubleshooting

### iOS Build Errors:
- Make sure Xcode Command Line Tools are installed: `xcode-select --install`
- Clean build folder: In Xcode, Product → Clean Build Folder
- Update CocoaPods: `cd ios/App && pod install`

### Android Build Errors:
- Make sure Android SDK is properly installed
- Clean project: In Android Studio, Build → Clean Project
- Invalidate caches: File → Invalidate Caches / Restart

### Sync Issues:
```bash
# Force clean and rebuild
rm -rf node_modules
rm -rf dist
npm install
npm run build
npx cap sync
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Lovable Documentation](https://docs.lovable.dev/)

## Support

For issues specific to:
- **Mobile app setup**: Check Capacitor documentation
- **Web functionality**: Use Lovable support
- **App store submission**: Check Apple/Google developer documentation
