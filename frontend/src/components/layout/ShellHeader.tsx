import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Bell, HelpCircle, Inbox, Search, AlertTriangle, Shield, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/types'
import type { ShellType } from '@/types'

const SHELL_META: Record<ShellType, { label: string; color: string; bgColor: string }> = {
  platform: { label: 'Platform', color: 'text-shell-platform', bgColor: 'bg-shell-platform/10' },
  company: { label: 'Company', color: 'text-shell-company', bgColor: 'bg-shell-company/10' },
  project: { label: 'Project', color: 'text-shell-project', bgColor: 'bg-shell-project/10' },
  governance: { label: 'Governance', color: 'text-shell-governance', bgColor: 'bg-shell-governance/10' },
  emergency: { label: 'Emergency', color: 'text-shell-emergency', bgColor: 'bg-shell-emergency/10' },
}

interface ShellHeaderProps {
  onMobileMenuToggle?: () => void
}

export function ShellHeader({ onMobileMenuToggle }: ShellHeaderProps) {
  const { t } = useTranslation()
  const fullName = useAuthStore((s) => s.fullName)
  const avatarUrl = useAuthStore((s) => s.avatarUrl)
  const { activeOrg } = useOrgStore()
  const { shell, emergencyMode } = useContextStore()
  const location = useLocation()
  const navigate = useNavigate()

  const current = activeOrg()
  const currentShell = shell ?? 'company'
  const shellMeta = SHELL_META[currentShell]
  const role = current?.role ?? null

  // Build breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean)
  const contextName = current?.orgName || shellMeta.label

  let breadcrumb = contextName
  let title = ''

  if (pathParts.length > 1) {
    const pageName = pathParts[pathParts.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    breadcrumb = `${contextName} / ${pageName}`
    title = pageName
  } else {
    title = t(`shell.${currentShell}`)
  }

  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header
      className={cn(
        'flex items-center justify-between border-b bg-card px-4 md:px-6 h-14',
        emergencyMode ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-border',
      )}
      role="banner"
    >
      {/* Left: mobile menu + shell indicator + breadcrumb */}
      <div className="min-w-0 flex items-center gap-2 md:gap-3">
        {/* Mobile hamburger */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {emergencyMode && (
          <div className="flex h-6 items-center gap-1 rounded bg-red-500/10 px-2 text-[10px] font-bold text-red-500 uppercase">
            <AlertTriangle className="h-3 w-3" />
            <span className="hidden sm:inline">{t('emergency.label', 'Emergency')}</span>
          </div>
        )}

        {!emergencyMode && (
          <div className={cn('hidden sm:flex h-6 items-center gap-1.5 rounded-md px-2', shellMeta.bgColor)}>
            <div className={cn('h-1.5 w-1.5 rounded-full', shellMeta.color.replace('text-', 'bg-'))} />
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider', shellMeta.color)}>
              {shellMeta.label}
            </span>
          </div>
        )}

        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{breadcrumb}</p>
          <h1 className="text-[15px] font-semibold text-foreground leading-tight truncate">{title}</h1>
        </div>

        {role && !emergencyMode && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">
              {ROLE_LABELS[role]}
            </span>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Search — desktop only */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="h-8 w-48 rounded-lg border border-border bg-background pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:w-64 transition-all duration-200"
            aria-label={t('common.search')}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </div>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* Support */}
        <button
          onClick={() => navigate('/support')}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={t('nav.support')}
          aria-label={t('nav.support')}
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
            aria-label={t('header.notificationsTooltip', 'Notifications')}
            aria-expanded={showNotifications}
          >
            <Bell className="h-4 w-4" />
          </button>

          {showNotifications && (
            <div
              ref={dropdownRef}
              className="notification-dropdown absolute right-0 top-full mt-1.5 w-72 rounded-lg border border-border bg-card p-1 z-50 shadow-lg"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('header.notifications')}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">0</span>
              </div>
              <div className="h-px bg-border mx-2 my-1" />
              <div className="flex flex-col items-center gap-2 px-3 py-8">
                <Inbox className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">{t('header.noNotifications')}</p>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 rounded-lg px-1.5 md:px-2 py-1.5 transition-colors hover:bg-accent"
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </div>
          )}
          <span className="hidden text-[13px] font-medium text-foreground sm:inline max-w-24 truncate">
            {fullName ?? t('common.user')}
          </span>
        </button>
      </div>
    </header>
  )
}
