import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  FileText, 
  Users, 
  Settings, 
  Home, 
  Menu,
  X
} from 'lucide-react'
import InstallPWA from './InstallPWA'
import OnlineStatusIndicator from './OnlineStatusIndicator'

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Minimal layout for PDF rendering: if ?pdf=1, render only the outlet on white background
  const isPdf = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search)
      return params.get('pdf') === '1'
    } catch {
      return false
    }
  }, [location.search])

  if (isPdf) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <main className="min-h-screen">
          <div className="max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-primary text-brandwhite">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
  <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <FileText className="h-8 w-8 text-accent" />
            <span className="ml-2 text-xl font-semibold text-brandwhite">MG AutoCare</span>
          </div>
          <nav className="mt-5 flex-shrink-0 h-full overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-accent text-brandwhite'
                      : 'text-brandwhite hover:bg-primary/90 hover:text-brandwhite'
                  }`}
                  >
                    <Icon className="mr-3 flex-shrink-0 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-primary overflow-y-auto border-r border-accent/10">
          <div className="flex items-center flex-shrink-0 px-4">
            <FileText className="h-8 w-8 text-accent" />
            <span className="ml-2 text-xl font-semibold text-brandwhite">MG AutoCare</span>
          </div>
          <nav className="mt-5 flex-grow px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-accent text-brandwhite'
                      : 'text-brandwhite hover:bg-primary/90 hover:text-brandwhite'
                  }`}
                >
                  <Icon className="mr-3 flex-shrink-0 h-6 w-6 text-brandwhite" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 md:ml-64">
        {/* Mobile header */}
  <div className="relative z-10 flex-shrink-0 flex h-16 bg-white text-gray-900 shadow md:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <h1 className="text-lg font-medium text-gray-900">MG AUTO CARE INVOICE SYSTEM</h1>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      {/* PWA Install Banner */}
      <InstallPWA />
      
      {/* Online Status Indicator */}
      <OnlineStatusIndicator />
    </div>
  )
}