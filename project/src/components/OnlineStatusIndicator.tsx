import { Wifi, WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useState, useEffect } from 'react'

export default function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus()
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
    } else {
      // Hide the indicator after a brief "back online" message
      const timer = setTimeout(() => setShowOffline(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showOffline) return null

  return (
    <div
      className={`fixed top-16 md:top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're Offline</span>
        </>
      )}
    </div>
  )
}
