# PWA Troubleshooting Checklist

## Why you might not see PWA features yet:

### 1. Restart Dev Server ⚠️ MOST IMPORTANT
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

### 2. Hard Refresh Browser
- **Chrome/Edge**: Ctrl+Shift+R or Ctrl+F5
- **Mac**: Cmd+Shift+R
- **Or**: Clear cache and reload

### 3. Check Browser Console
Open DevTools (F12) and look for:
- ✅ "Service Worker registered successfully"
- ✅ No red errors
- Check the **Application** tab > **Service Workers** section

### 4. Verify PWA Installation Criteria
The install prompt will only show if:
- ✅ Site is served over HTTPS (or localhost)
- ✅ Has a valid manifest.json
- ✅ Has a registered service worker
- ✅ User has visited twice (or manually trigger in Chrome DevTools)
- ✅ Not already installed

### 5. Manually Trigger Install (Chrome)
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** - verify it loads
4. Click **Service Workers** - verify it's registered
5. Look for **Install** button in address bar

### 6. Check Console Logs
You should see:
```
Service Worker registered successfully: ...
```

### 7. Force Service Worker Registration
In DevTools Console, run:
```javascript
navigator.serviceWorker.register('/sw.js')
```

## Current Setup Status:

✅ vite.config.ts - Updated with VitePWA plugin
✅ InstallPWA component - Created and added to Layout
✅ OnlineStatusIndicator - Created and added to Layout  
✅ usePWA hook - Created with install logic
✅ Service worker registration - Added to main.tsx
✅ Manifest.json - Created in public folder
✅ App icons - Created as SVG files

## Next Steps:

1. **Stop current dev server** (if running)
2. **Run: `npm run dev`**
3. **Open browser to localhost**
4. **Check DevTools Console for SW registration**
5. **Visit the page twice** (PWA requirement)
6. **Look for install banner at bottom of screen**

## Testing on Mobile:

1. Deploy to Vercel (HTTPS required)
2. Visit on mobile device
3. Install prompt will appear automatically
4. Or use browser menu: "Add to Home Screen"

## Debug Mode:

The PWA plugin is configured with `devOptions: { enabled: true }` so you should see PWA features even in development mode!
