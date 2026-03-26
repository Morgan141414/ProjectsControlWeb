import { Outlet } from 'react-router'
<<<<<<< HEAD
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShellSidebar } from './ShellSidebar'
import { ShellHeader } from './ShellHeader'
import { MobileDrawer } from './MobileDrawer'
import { useContextStore } from '@/stores/contextStore'
import { useShellSync } from '@/hooks/useShellSync'
import { cn } from '@/lib/utils'

export function AppShell() {
  const { t } = useTranslation()
  useShellSync()
  const emergencyMode = useContextStore((s) => s.emergencyMode)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  return (
    <div className={cn(
      'flex h-screen overflow-hidden bg-background',
      emergencyMode && 'ring-1 ring-inset ring-red-500/20',
    )}>
      <a href="#main-content" className="skip-to-content">
        {t('a11y.skipToContent', 'Skip to content')}
      </a>

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block" role="complementary" aria-label="Sidebar">
        <ShellSidebar />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ShellHeader onMobileMenuToggle={() => setMobileDrawerOpen(true)} />
        <main id="main-content" className="page-enter flex-1 overflow-auto p-4 md:p-6" role="main">
=======
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#060B26' }}>
      {/* Subtle animated background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#0075FF]/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-[#7551FF]/[0.03] blur-[120px]" />

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="page-enter relative flex-1 overflow-auto px-6 pb-6">
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          <Outlet />
        </main>
      </div>
    </div>
  )
}
