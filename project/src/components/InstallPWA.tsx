import { X, Download } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  
  // Debug logging
  useEffect(() => {
    console.log('InstallPWA Component Mounted')
    console.log('PWA Status:', { 
      isInstallable, 
      isInstalled, 
      dismissed,
      isDev: import.meta.env.DEV
    })
  }, [isInstallable, isInstalled, dismissed])

  // Force show in development for testing
  const isDevelopment = import.meta.env.DEV
  
  // Always show in dev mode unless dismissed or installed
  if (isInstalled) {
    console.log('PWA: Not showing - already installed')
    return null
  }
  
  if (dismissed) {
    console.log('PWA: Not showing - user dismissed')
    return null
  }

  // In development, always show for testing
  // In production, only show if installable
  if (!isDevelopment && !isInstallable) {
    console.log('PWA: Not showing - not installable and not in dev mode')
    return null
  }

  console.log('PWA: Rendering install banner')

  const handleInstall = async () => {
    if (!isInstallable) {
      // In development without real install prompt
      console.log('PWA: No install prompt available (development mode)')
      alert('✅ PWA is configured!\n\nIn production:\n- Deploy to Vercel\n- Visit twice\n- Real install prompt will appear\n\nService worker is already active!')
      setDismissed(true)
      return
    }
    
    const success = await installApp()
    if (success) {
      console.log('PWA: App installed successfully')
      setDismissed(true)
    }
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-accent text-white shadow-2xl border-t-4 border-white md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border-4"
      style={{ boxShadow: '0 0 30px rgba(220, 38, 38, 0.8)' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Download className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Install MG AutoCare</h3>
                <p className="text-sm text-white/90 mt-1">
                  Install our app for quick access and offline support
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-white text-accent rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 bg-transparent border border-white/30 rounded-md font-medium hover:bg-white/10 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="ml-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
