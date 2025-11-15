import { X, Download } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import { useState } from 'react'

export default function InstallPWA() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      console.log('App installed successfully')
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-accent text-white shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg">
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
