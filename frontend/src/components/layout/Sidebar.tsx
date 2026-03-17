import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  User,
  Activity,
  BarChart3,
  Shield,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

const navItems = [
  { to: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { to: '/profile', label: 'Профиль', icon: User },
  { to: '/activity', label: 'Активность', icon: Activity },
  { to: '/reports', label: 'Отчёты', icon: BarChart3 },
  { to: '/admin', label: 'Админ', icon: Shield },
  { to: '/settings', label: 'Настройки', icon: Settings },
]

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <LayoutDashboard className="size-5 shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">
            ProjectsControl
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
