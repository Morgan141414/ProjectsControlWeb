import { useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router'
import { X, LogOut, Settings, MessageSquare, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { ContextSwitcher } from './ContextSwitcher'
import { getNavForShell, filterNavByRole } from '@/config/navigation'
import type { NavItem } from '@/config/navigation'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const drawerRef = useRef<HTMLDivElement>(null)

  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const fullName = useAuthStore((s) => s.fullName)
  const email = useAuthStore((s) => s.email)
  const avatarUrl = useAuthStore((s) => s.avatarUrl)
  const logout = useAuthStore((s) => s.logout)
  const { activeOrg } = useOrgStore()
  const { shell, emergencyMode, activeProjectId } = useContextStore()

  const current = activeOrg()
  const orgRole = current?.role ?? null
  const currentShell = shell ?? 'company'

  const rawNav = getNavForShell(currentShell)
  const filteredNav = filterNavByRole(rawNav, orgRole, isSuperAdmin)
  const navSections = filteredNav.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      to: item.to.replace(':id', activeProjectId ?? ''),
    })),
  }))

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  // Close on route change
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function handleLogout() {
    logout()
    navigate('/login')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border flex flex-col drawer-enter',
          emergencyMode && 'bg-red-500/[0.02]',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-[15px] font-semibold text-foreground">
            {emergencyMode ? t('shell.emergencyMode') : 'ProjectsControl'}
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Context Switcher */}
        <div className="px-3 py-2 border-b border-border">
          <ContextSwitcher onCreateOrg={() => { navigate('/dashboard'); onClose() }} />
        </div>

        {/* Emergency banner */}
        {emergencyMode && (
          <div className="mx-3 mt-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
              {t('emergency.activeMode')}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pt-2" aria-label="Shell navigation">
          {navSections.map((section) => (
            <div key={section.labelKey}>
              <div className="px-2.5 pt-4 pb-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {t(section.labelKey)}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <MobileNavLink key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border px-3 py-2 space-y-0.5">
          <button
            onClick={() => { navigate('/profile/settings'); onClose() }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            {t('nav.settings')}
          </button>
          <button
            onClick={() => { navigate('/support'); onClose() }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            {t('nav.support')}
          </button>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
          </button>
        </div>

        {/* User area */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{fullName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={t('auth.logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function MobileNavLink({ item }: { item: NavItem }) {
  const { t } = useTranslation()

  return (
    <NavLink
      to={item.to}
      end={item.to === '/platform' || item.to === '/company' || item.to === '/governance' || item.to === '/emergency'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors',
          isActive
            ? 'bg-primary/8 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{t(item.labelKey)}</span>
      {item.badge && (
        <span className={cn(
          'rounded px-1 py-px text-[9px] font-semibold',
          item.badge === 'emergency' ? 'bg-red-500/10 text-red-500' :
          item.badge === 'governance' ? 'bg-amber-500/10 text-amber-500' :
          'bg-primary/10 text-primary',
        )}>
          {item.badge === 'emergency' ? '!' : item.badge === 'governance' ? '§' : ''}
        </span>
      )}
    </NavLink>
  )
}
