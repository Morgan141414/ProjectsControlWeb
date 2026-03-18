import { useLocation } from 'react-router'
import { Search, Bell, Settings, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const pageTitles: Record<string, { breadcrumb: string; title: string }> = {
  '/dashboard': { breadcrumb: 'Pages / Dashboard', title: 'Dashboard' },
  '/profile': { breadcrumb: 'Pages / Profile', title: 'Profile' },
  '/activity': { breadcrumb: 'Pages / Activity', title: 'Activity' },
  '/reports': { breadcrumb: 'Pages / Tables', title: 'Tables' },
  '/admin': { breadcrumb: 'Pages / Billing', title: 'Billing' },
  '/settings': { breadcrumb: 'Pages / Settings', title: 'Settings' },
}

export function Header() {
  const fullName = useAuthStore((s) => s.fullName)
  const location = useLocation()
  const page = pageTitles[location.pathname] ?? { breadcrumb: 'Pages', title: '' }

  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Left: breadcrumb + title */}
      <div>
        <p className="text-xs text-white/50">{page.breadcrumb}</p>
        <h1 className="text-sm font-bold text-white">{page.title}</h1>
      </div>

      {/* Right: search + icons + user */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Type here..."
            className="h-10 w-56 rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none transition-colors"
          />
        </div>

        {/* User name */}
        <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{fullName ?? 'User'}</span>
        </button>

        {/* Settings */}
        <button className="rounded-xl p-2 text-white/50 transition-colors hover:text-white">
          <Settings className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="rounded-xl p-2 text-white/50 transition-colors hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
