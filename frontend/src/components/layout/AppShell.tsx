import { Outlet } from 'react-router'
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
