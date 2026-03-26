<<<<<<< HEAD
import { NavLink, useNavigate } from 'react-router'
import {
  Home, User, Settings, FileBarChart, MessageSquare,
  Moon, Sun, Briefcase, Building2, Award, Users, ScrollText, Lock,
  FolderKanban, UserPlus, Bell, Calendar, CreditCard, UserSearch,
  LogOut, PanelLeftClose, Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { OrgSwitcher } from './OrgSwitcher'
import { useState } from 'react'

// Roles that can see the admin/management section
const MANAGEMENT_ROLES = new Set(['super_ceo', 'ceo'])
const ADMIN_ROLES = new Set(['super_ceo', 'ceo', 'superadmin'])
const HR_ROLES = new Set(['super_ceo', 'ceo', 'hr'])
const PROJECT_ROLES = new Set(['super_ceo', 'ceo', 'team_lead', 'project_manager'])
const SYSADMIN_ROLES = new Set(['super_ceo', 'ceo', 'superadmin', 'sysadmin'])

export function Sidebar() {
  const { t } = useTranslation()
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const fullName = useAuthStore((s) => s.fullName)
  const email = useAuthStore((s) => s.email)
  const avatarUrl = useAuthStore((s) => s.avatarUrl)
  const logout = useAuthStore((s) => s.logout)
  const { activeOrgId, activeOrg } = useOrgStore()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)

  const current = activeOrg()
  const orgRole = current?.role ?? null
  const isManagement = orgRole ? MANAGEMENT_ROLES.has(orgRole) : false
  const isAdmin = orgRole ? ADMIN_ROLES.has(orgRole) : false
  const isHR = orgRole ? HR_ROLES.has(orgRole) : false
  const isProjectLead = orgRole ? PROJECT_ROLES.has(orgRole) : false
  const isSysadmin = orgRole ? SYSADMIN_ROLES.has(orgRole) : false
  const isFounder = orgRole === 'founder'

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const personalNavItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/vacancies', label: t('nav.vacancies'), icon: Briefcase },
    { to: '/messenger', label: t('nav.messenger'), icon: MessageSquare },
  ]

  const orgNavItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { to: '/admin/projects', label: t('nav.projects'), icon: FolderKanban },
    { to: '/reports', label: t('nav.reports'), icon: FileBarChart },
  ]

  // Build admin nav items based on role
  const adminNavItems: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = []

  if (isManagement || isHR) {
    adminNavItems.push({ to: '/admin/join-requests', label: t('nav.joinRequests'), icon: UserPlus })
  }
  if (isProjectLead) {
    adminNavItems.push({ to: '/admin/projects', label: t('nav.projects'), icon: FolderKanban })
    adminNavItems.push({ to: '/admin/teams', label: t('nav.teams'), icon: Users })
  }
  if (isManagement || isHR) {
    adminNavItems.push({ to: '/admin/users', label: t('nav.users'), icon: User })
  }
  if (isHR) {
    adminNavItems.push({ to: '/admin/hr', label: t('nav.hr'), icon: UserSearch })
  }
  if (isAdmin) {
    adminNavItems.push({ to: '/admin/privacy', label: t('nav.privacy'), icon: Lock })
  }
  if (isManagement || isAdmin || isFounder) {
    adminNavItems.push({ to: '/admin/audit', label: t('nav.audit'), icon: ScrollText })
  }
  if (isAdmin) {
    adminNavItems.push({ to: '/admin/schedules', label: t('nav.schedules'), icon: Calendar })
    adminNavItems.push({ to: '/admin/notifications', label: t('nav.notifications'), icon: Bell })
  }
  if (isManagement) {
    adminNavItems.push({ to: '/admin/subscription', label: t('nav.subscription'), icon: CreditCard })
  }
  if (isSysadmin) {
    adminNavItems.push({ to: '/admin/sysadmin', label: t('nav.sysadmin', 'Тех. поддержка'), icon: Wrench })
  }

  const superAdminNavItems = [
    { to: '/superadmin/companies', label: t('nav.companies'), icon: Building2 },
    { to: '/superadmin/certificates', label: t('nav.certificates'), icon: Award },
  ]

  const mainItems = activeOrgId ? orgNavItems : personalNavItems
  const showAdminSection = activeOrgId && adminNavItems.length > 0

  function handleLogout() {
    logout()
    navigate('/login')
  }
=======
import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  User,
  Activity,
  BarChart3,
  Shield,
  Settings,
  FileBarChart,
  ShieldCheck,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

const mainNavItems = [
  { to: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/reports', label: 'Отчёты', icon: FileBarChart },
  { to: '/admin', label: 'Админ', icon: ShieldCheck },
]

const accountNavItems = [
  { to: '/profile', label: 'Профиль', icon: User },
  { to: '/activity', label: 'Активность', icon: Activity },
  { to: '/settings', label: 'Настройки', icon: Settings },
]

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

  return (
    <aside
      className={cn(
<<<<<<< HEAD
        'group/sidebar flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[60px]' : 'w-[260px]',
      )}
      onMouseEnter={() => { if (collapsed) setCollapsed(false) }}
      onMouseLeave={() => { if (!collapsed) setCollapsed(true) }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-foreground tracking-tight whitespace-nowrap">
              ProjectsControl
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

      {/* Org Switcher */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <OrgSwitcher onCreateOrg={() => navigate('/dashboard')} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1">
        <NavSection items={mainItems} collapsed={collapsed} />

        {showAdminSection && (
          <>
            {!collapsed && <SectionLabel label={t('sidebar.admin')} />}
            {collapsed && <div className="my-2 mx-2 h-px bg-border" />}
            <NavSection items={adminNavItems} collapsed={collapsed} />
          </>
        )}

        {isSuperAdmin && (
          <>
            {!collapsed && <SectionLabel label={t('sidebar.superAdmin')} />}
            {collapsed && <div className="my-2 mx-2 h-px bg-border" />}
            <NavSection items={superAdminNavItems} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* Bottom utilities */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        {activeOrgId && (
          <SidebarLink to="/profile" icon={User} label={t('nav.profile')} collapsed={collapsed} />
        )}
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
=======
        'relative flex h-screen flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-[78px]' : 'w-[260px]',
      )}
      style={{
        background: 'linear-gradient(195deg, #0f1a45 0%, #080e2e 40%, #060920 100%)',
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="group absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#111c44] text-white/50 shadow-lg transition-all duration-300 hover:border-[#0075FF]/50 hover:bg-[#0075FF]/20 hover:text-white hover:shadow-[0_0_12px_rgba(0,117,255,0.3)]"
      >
        {collapsed ? (
          <Menu className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-px" />
        )}
      </button>

      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-5 pt-7 pb-5 transition-all duration-500', collapsed && 'justify-center px-3')}>
        <div
          className="sidebar-logo-glow relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)',
          }}
        >
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-500',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <span className="whitespace-nowrap text-sm font-bold tracking-[0.15em] text-white uppercase">
            Vision UI
          </span>
          <span className="block whitespace-nowrap text-[10px] font-medium tracking-wider text-white/30">
            DASHBOARD PRO
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 pt-5">
        <div className="space-y-1">
          {mainNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300',
                      isActive
                        ? 'bg-[#0075FF] opacity-100 shadow-[0_0_12px_rgba(0,117,255,0.6),0_0_4px_rgba(0,117,255,0.8)]'
                        : 'bg-transparent opacity-0 group-hover:bg-white/20 group-hover:opacity-100',
                    )}
                  />

                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                  )}

                  {/* Icon container */}
                  <div
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-[#0075FF] to-[#4318FF] shadow-[0_4px_12px_rgba(0,117,255,0.4)]'
                        : 'bg-white/[0.06] group-hover:bg-white/10',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 transition-all duration-300', isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80')} />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'relative overflow-hidden whitespace-nowrap transition-all duration-500',
                      collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Section separator */}
        <div className={cn('my-4 flex items-center gap-3 px-2', collapsed && 'px-0')}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Аккаунт
            </span>
          )}
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Account Navigation */}
        <div className="space-y-1">
          {accountNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300',
                      isActive
                        ? 'bg-[#0075FF] opacity-100 shadow-[0_0_12px_rgba(0,117,255,0.6),0_0_4px_rgba(0,117,255,0.8)]'
                        : 'bg-transparent opacity-0 group-hover:bg-white/20 group-hover:opacity-100',
                    )}
                  />

                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                  )}

                  <div
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-[#0075FF] to-[#4318FF] shadow-[0_4px_12px_rgba(0,117,255,0.4)]'
                        : 'bg-white/[0.06] group-hover:bg-white/10',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 transition-all duration-300', isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80')} />
                  </div>

                  <span
                    className={cn(
                      'relative overflow-hidden whitespace-nowrap transition-all duration-500',
                      collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Help card with animated gradient border */}
      <div
        className={cn(
          'mx-3 mb-4 overflow-hidden transition-all duration-500',
          collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-60 opacity-100',
        )}
      >
        <div className="sidebar-help-card relative rounded-2xl p-px">
          {/* Animated gradient border */}
          <div className="sidebar-gradient-border absolute inset-0 rounded-2xl opacity-60" />

          <div
            className="relative rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,117,255,0.15) 0%, rgba(117,81,255,0.1) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0075FF]/30 to-[#7551FF]/30 shadow-[0_0_20px_rgba(0,117,255,0.2)]">
              <Shield className="h-5 w-5 text-[#868CFF]" />
            </div>
            <p className="text-xs font-bold text-white">Нужна помощь?</p>
            <p className="mt-1 text-[10px] text-white/40">Ознакомьтесь с документацией</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full rounded-xl bg-white/[0.08] px-4 py-2 text-[11px] font-bold tracking-wider text-white/80 transition-all duration-300 hover:bg-white/[0.14] hover:text-white hover:shadow-[0_0_16px_rgba(0,117,255,0.2)]"
            >
              ДОКУМЕНТАЦИЯ
            </a>
          </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </div>
      </div>
    </aside>
  )
}
<<<<<<< HEAD

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-2.5 pt-5 pb-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
    </div>
  )
}

function NavSection({ items, collapsed }: {
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
  collapsed: boolean
}) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <SidebarLink key={item.to} {...item} collapsed={collapsed} />
      ))}
    </div>
  )
}

function SidebarLink({ to, icon: Icon, label, collapsed }: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  collapsed: boolean
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
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
