import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Search, Bell, Settings, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const pageTitles: Record<string, { breadcrumb: string; title: string }> = {
  '/dashboard': { breadcrumb: 'Страницы / Дашборд', title: 'Дашборд' },
  '/profile': { breadcrumb: 'Страницы / Профиль', title: 'Профиль' },
  '/activity': { breadcrumb: 'Страницы / Активность', title: 'Активность' },
  '/reports': { breadcrumb: 'Страницы / Отчёты', title: 'Отчёты' },
  '/admin': { breadcrumb: 'Страницы / Админ', title: 'Админ' },
  '/settings': { breadcrumb: 'Страницы / Настройки', title: 'Настройки' },
}

export function Header() {
  const fullName = useAuthStore((s) => s.fullName)
  const location = useLocation()
  const navigate = useNavigate()
  const page = pageTitles[location.pathname] ?? { breadcrumb: 'Страницы', title: '' }

  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-56 rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none transition-colors"
          />
        </div>

        {/* User name */}
        <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{fullName ?? 'Пользователь'}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="rounded-xl p-2 text-white/50 transition-colors hover:text-white"
          title="Настройки"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications((v) => !v)}
            className="rounded-xl p-2 text-white/50 transition-colors hover:text-white"
            title="Уведомления"
          >
            <Bell className="h-4 w-4" />
          </button>
          {showNotifications && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 p-4 z-50"
              style={{
                background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
                backdropFilter: 'blur(120px)',
              }}
            >
              <p className="text-sm text-white/50 text-center">Нет уведомлений</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
