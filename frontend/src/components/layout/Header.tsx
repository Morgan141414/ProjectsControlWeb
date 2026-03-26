import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
<<<<<<< HEAD
import { Bell, HelpCircle, Inbox, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const pageKeys: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/profile': 'profile',
  '/profile/settings': 'settings',
  '/reports': 'reports',
  '/settings': 'settings',
  '/support': 'support',
  '/faq': 'faq',
  '/messenger': 'messenger',
  '/vacancies': 'vacancies',
}

export function Header() {
  const { t } = useTranslation()
  const fullName = useAuthStore((s) => s.fullName)
  const avatarUrl = useAuthStore((s) => s.avatarUrl)
  const { activeOrg } = useOrgStore()
  const location = useLocation()
  const navigate = useNavigate()

  const current = activeOrg()

  const adminMatch = location.pathname.match(/^\/admin\/(.+)/)
  const superAdminMatch = location.pathname.match(/^\/superadmin\/(.+)/)

  let breadcrumb: string
  let title: string

  if (adminMatch) {
    const section = current ? current.orgName : t('nav.admin')
    breadcrumb = `${section} / ${adminMatch[1].replace(/-/g, ' ')}`
    title = adminMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  } else if (superAdminMatch) {
    breadcrumb = `${t('sidebar.superAdmin')} / ${superAdminMatch[1]}`
    title = superAdminMatch[1].replace(/\b\w/g, (c) => c.toUpperCase())
  } else {
    const navKey = pageKeys[location.pathname]
    breadcrumb = current
      ? `${current.orgName} / ${navKey ? t(`nav.${navKey}`) : ''}`
      : navKey ? t(`nav.${navKey}`) : ''
    title = navKey ? t(`nav.${navKey}`) : ''
  }

=======
import { Search, Bell, Settings, User, Inbox } from 'lucide-react'
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
  const [searchFocused, setSearchFocused] = useState(false)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return (
<<<<<<< HEAD
    <header className="flex items-center justify-between border-b border-border bg-card px-6 h-14">
      {/* Left: title */}
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{breadcrumb}</p>
        <h1 className="text-[15px] font-semibold text-foreground leading-tight">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="h-8 w-48 rounded-lg border border-border bg-background pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:w-64 transition-all duration-200"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </div>

        <LanguageSwitcher />

        {/* Support */}
        <button
          onClick={() => navigate('/support')}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={t('nav.support')}
        >
          <HelpCircle className="h-4 w-4" />
=======
    <header
      className="relative z-10 flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(180deg, rgba(6,11,38,0.8) 0%, rgba(6,11,38,0.4) 60%, transparent 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-white/35 transition-colors">
          {page.breadcrumb.split(' / ').map((part, i, arr) => (
            <span key={part} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-white/20">/</span>
              )}
              <span className={i === arr.length - 1 ? 'text-white/50' : ''}>
                {part}
              </span>
            </span>
          ))}
        </p>
        <h1 className="mt-0.5 text-sm font-bold tracking-wide text-white">{page.title}</h1>
      </div>

      {/* Right: search + icons + user */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`h-9 rounded-xl border bg-white/[0.04] pl-9 pr-4 text-xs text-white placeholder:text-white/25 transition-all duration-400 ease-out focus:outline-none ${
              searchFocused
                ? 'w-64 border-[#0075FF]/50 bg-white/[0.07] shadow-[0_0_20px_rgba(0,117,255,0.12)]'
                : 'w-44 border-white/[0.06] hover:border-white/10'
            }`}
          />
        </div>

        {/* User avatar */}
        <button className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-white/[0.04]">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(0,117,255,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 100%)',
            }}
          >
            {initials}
          </div>
          <span className="hidden text-xs font-medium text-white/60 transition-colors duration-300 group-hover:text-white/90 sm:inline">
            {fullName ?? 'Пользователь'}
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="group relative rounded-xl p-2 text-white/40 transition-all duration-300 hover:text-white"
          title="Настройки"
        >
          <div className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]" />
          <Settings className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications((v) => !v)}
<<<<<<< HEAD
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title={t('header.notificationsTooltip')}
          >
            <Bell className="h-4 w-4" />
          </button>

          {showNotifications && (
            <div
              ref={dropdownRef}
              className="notification-dropdown absolute right-0 top-full mt-1.5 w-72 rounded-lg border border-border bg-card p-1 z-50 shadow-lg shadow-black/8"
            >
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('header.notifications')}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  0
                </span>
              </div>
              <div className="h-px bg-border mx-2 my-1" />
              <div className="flex flex-col items-center gap-2 px-3 py-8">
                <Inbox className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  {t('header.noNotifications')}
                </p>
=======
            className="group relative rounded-xl p-2 text-white/40 transition-all duration-300 hover:text-white"
            title="Уведомления"
          >
            <div className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]" />
            <Bell className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div
              ref={dropdownRef}
              className="notification-dropdown absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] p-1 z-50 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(11,20,55,0.97) 0%, rgba(6,11,38,0.95) 100%)',
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-xs font-bold tracking-wide text-white/70">Уведомления</span>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/30">
                  0
                </span>
              </div>

              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              {/* Empty state */}
              <div className="flex flex-col items-center gap-2 px-4 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                  <Inbox className="h-5 w-5 text-white/20" />
                </div>
                <p className="text-xs text-white/30">Нет уведомлений</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD

        {/* User */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </div>
          )}
          <span className="hidden text-[13px] font-medium text-foreground sm:inline">
            {fullName ?? t('common.user')}
          </span>
        </button>
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      </div>
    </header>
  )
}
