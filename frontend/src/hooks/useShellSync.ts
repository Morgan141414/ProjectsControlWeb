import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useContextStore } from '@/stores/contextStore'
import { useOrgStore } from '@/stores/orgStore'
import { useAuthStore } from '@/stores/authStore'
import type { ShellType } from '@/types'

/**
 * Syncs the active shell based on the current route.
 * This ensures the sidebar navigation matches the current page context.
 */
export function useShellSync() {
  const location = useLocation()
  const { shell, setShell, resolveShell } = useContextStore()
  const { activeOrg } = useOrgStore()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)

  useEffect(() => {
    const path = location.pathname

    let targetShell: ShellType | null = null

    if (path.startsWith('/platform')) {
      targetShell = 'platform'
    } else if (path.startsWith('/company')) {
      targetShell = 'company'
    } else if (path === '/project' || path.startsWith('/project/')) {
      targetShell = 'project'
    } else if (path.startsWith('/governance')) {
      targetShell = 'governance'
    } else if (path.startsWith('/emergency')) {
      targetShell = 'emergency'
    } else if (path === '/dashboard' || path === '/') {
      // On personal dashboard, resolve based on role
      const current = activeOrg()
      const role = current?.role ?? null
      targetShell = resolveShell(role, isSuperAdmin)
    }

    if (targetShell && targetShell !== shell) {
      setShell(targetShell)
    }
  }, [location.pathname])

  // Also extract projectId from URL and sync it
  useEffect(() => {
    const match = location.pathname.match(/^\/project\/([^/]+)/)
    if (match) {
      const projectId = match[1]
      const { activeProjectId, setActiveProject } = useContextStore.getState()
      if (projectId !== activeProjectId) {
        setActiveProject(projectId)
      }
    }
  }, [location.pathname])
}
