import { NavLink, useNavigate } from 'react-router'
import {
  Moon, Sun, Settings, MessageSquare, LogOut, PanelLeftClose,
  Building2, AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { ContextSwitcher } from './ContextSwitcher'
import { getNavForShell, filterNavByRole } from '@/config/navigation'
import type { NavItem } from '@/config/navigation'

export function ShellSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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

  const [collapsed, setCollapsed] = useState(false)

  const current = activeOrg()
  const orgRole = current?.role ?? null
  const currentShell = shell ?? 'company'

  // Get navigation for current shell, filtered by role
  const rawNav = getNavForShell(currentShell)
  const filteredNav = filterNavByRole(rawNav, orgRole, isSuperAdmin)

  // Replace :id placeholders with actual project id
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Shell visual indicator
  const shellColors: Record<string, string> = {
    platform: 'border-blue-500/20',
    company: 'border-border',
    project: 'border-violet-500/20',
    governance: 'border-amber-500/20',
    emergency: 'border-red-500/30',
  }

  return (
    <aside
      className={cn(
        'group/sidebar flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out',
        shellColors[currentShell] || 'border-border',
        collapsed ? 'w-[60px]' : 'w-[260px]',
        emergencyMode && 'bg-red-500/[0.02]',
      )}
      onMouseEnter={() => { if (collapsed) setCollapsed(false) }}
      onMouseLeave={() => { if (!collapsed) setCollapsed(true) }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            emergencyMode ? 'bg-red-500' : 'bg-primary',
          )}>
            {emergencyMode
              ? <AlertTriangle className="h-4 w-4 text-white" />
              : <Building2 className="h-4 w-4 text-primary-foreground" />
            }
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-foreground tracking-tight whitespace-nowrap">
              {emergencyMode ? t('shell.emergencyMode') : 'ProjectsControl'}
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(true) }}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Context Switcher */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <ContextSwitcher onCreateOrg={() => navigate('/dashboard')} />
        </div>
      )}

      {/* Emergency mode banner */}
      {emergencyMode && !collapsed && (
        <div className="mx-3 mb-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
          <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
            {t('emergency.activeMode')}
          </p>
          <p className="text-[10px] text-red-400 mt-0.5">
            {t('emergency.allActionsLogged')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1">
        {navSections.map((section, idx) => (
          <div key={section.labelKey}>
            {!collapsed && (
              <div className="px-2.5 pt-5 pb-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {t(section.labelKey)}
                </span>
              </div>
            )}
            {collapsed && idx > 0 && <div className="my-2 mx-2 h-px bg-border" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <ShellNavLink key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom utilities */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        <SidebarLink to="/profile/settings" icon={Settings} label={t('nav.settings')} collapsed={collapsed} />
        <SidebarLink to="/support" icon={MessageSquare} label={t('nav.support')} collapsed={collapsed} />

        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? (isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')) : undefined}
        >
          {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>}
        </button>
      </div>

      {/* User area */}
      <div className="border-t border-border px-2 py-3">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{fullName ?? t('common.user')}</p>
                <p className="truncate text-[11px] text-muted-foreground">{email ?? ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={t('auth.logout')}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

function ShellNavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { t } = useTranslation()
  const badgeStyles: Record<string, string> = {
    emergency: 'bg-red-500/10 text-red-500',
    governance: 'bg-amber-500/10 text-amber-500',
    count: 'bg-primary/10 text-primary',
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/platform' || item.to === '/company' || item.to === '/governance' || item.to === '/emergency'}
      title={collapsed ? t(item.labelKey) : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary/8 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{t(item.labelKey)}</span>
          {item.badge && (
            <span className={cn('rounded px-1 py-px text-[9px] font-semibold', badgeStyles[item.badge])}>
              {item.badge === 'emergency' ? '!' : item.badge === 'governance' ? '§' : ''}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function SidebarLink({ to, icon: Icon, label, collapsed }: {
  to: string; icon: LucideIcon; label: string; collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary/8 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}
