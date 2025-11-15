# PWA Features

Your MG AutoCare Invoice Management System is now a Progressive Web App (PWA)!

## Features Added

### 📱 Install on Mobile & Desktop
- Users can install the app directly to their home screen
- Works like a native app with its own icon
- Launches in standalone mode (no browser UI)

### 🔌 Offline Support
- Service worker caches essential assets
- App continues to work without internet connection
- Automatic sync when connection is restored

### 🔔 Install Prompt
- Shows an install banner to eligible users
- Easy one-click installation
- Dismissible for users who prefer browser access

### 📊 Online/Offline Indicator
- Visual indicator when connection is lost
- Automatic notification when back online
- Helps users understand app state

### ⚡ Performance
- Faster load times with caching
- Instant app launch from home screen
- Reduced data usage

## Testing PWA Features

### On Mobile (Chrome/Safari):
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or install prompt
3. Follow the prompts to install
4. Launch from your home screen

### On Desktop (Chrome/Edge):
1. Look for the install icon in the address bar
2. Click to install
3. App opens in its own window

### Testing Offline:
1. Open the app
2. Turn on airplane mode or disable network
3. Navigate around - cached pages still work
4. Turn network back on to see "Back Online" indicator

## Files Added

- `/public/manifest.json` - PWA configuration
- `/public/service-worker.js` - Offline caching logic
- `/public/icon-192x192.svg` - App icon (small)
- `/public/icon-512x512.svg` - App icon (large)
- `/src/hooks/usePWA.ts` - PWA installation hook
- `/src/hooks/useOnlineStatus.ts` - Network status detection
- `/src/components/InstallPWA.tsx` - Install prompt banner
- `/src/components/OnlineStatusIndicator.tsx` - Connection status
- `/src/components/OfflinePage.tsx` - Offline fallback page

## Customization

### Change App Icons
Replace the SVG files in `/public/` with your custom icons:
- `icon-192x192.svg` (minimum 192x192px)
- `icon-512x512.svg` (minimum 512x512px)

### Modify App Name/Colors
Edit `/public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name",
  "theme_color": "#DC2626",
  "background_color": "#0F172A"
}
```

### Adjust Cache Strategy
Edit `/public/service-worker.js` to customize what gets cached offline.

## Deployment Notes

When deploying to Vercel:
1. The service worker will be automatically served
2. Manifest is automatically linked
3. HTTPS is required for PWA features (Vercel provides this)
4. Users will see install prompt after second visit

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox
- ✅ Samsung Internet
- ⚠️ Some features limited on iOS Safari

## Benefits

1. **Better User Experience**: Feels like a native app
2. **Offline Access**: Works without internet
3. **Easy Access**: Install to home screen
4. **Performance**: Faster loading with caching
5. **Engagement**: Push notifications (can be added later)
