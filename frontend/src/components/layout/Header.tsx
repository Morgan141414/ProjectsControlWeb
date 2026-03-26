import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
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
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications((v) => !v)}
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
              </div>
            </div>
          )}
        </div>

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
      </div>
    </header>
  )
}
