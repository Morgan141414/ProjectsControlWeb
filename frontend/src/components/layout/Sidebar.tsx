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

  return (
    <aside
      className={cn(
        'flex h-screen flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
      )}
      style={{
        background: 'linear-gradient(180deg, #0B1437 0%, #060B26 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)' }}
        >
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-wider text-white uppercase">
            Vision UI Free
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10" />

      {/* Main Navigation */}
      <nav className="flex-1 px-4 pt-6">
        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 mb-1 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-3',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all',
                    isActive
                      ? 'bg-[#0075FF] shadow-[0_0_12px_rgba(0,117,255,0.4)]'
                      : 'bg-white/10',
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Account Pages Section */}
        {!collapsed && (
          <p className="mt-6 mb-3 px-4 text-xs font-bold uppercase tracking-wider text-white/40">
            Аккаунт
          </p>
        )}
        {collapsed && <div className="my-4 h-px bg-white/10" />}

        {accountNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 mb-1 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-3',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all',
                    isActive
                      ? 'bg-[#0075FF] shadow-[0_0_12px_rgba(0,117,255,0.4)]'
                      : 'bg-white/10',
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Help card */}
      {!collapsed && (
        <div className="mx-4 mb-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 100%)',
            }}
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs font-bold text-white">Нужна помощь?</p>
            <p className="mt-1 text-[10px] text-white/70">Ознакомьтесь с документацией</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full rounded-xl bg-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/30"
            >
              ДОКУМЕНТАЦИЯ
            </a>
          </div>
        </div>
      )}
    </aside>
  )
}
