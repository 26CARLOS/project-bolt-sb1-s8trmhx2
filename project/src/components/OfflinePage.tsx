import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <WifiOff className="h-12 w-12 text-accent" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Your previously loaded invoices and clients may still be accessible from the cache.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-accent text-white rounded-md font-medium hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
