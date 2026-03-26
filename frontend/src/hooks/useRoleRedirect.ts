import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { ROLE_DEFAULT_SHELL } from '@/types'
import type { ShellType } from '@/types'

const SHELL_ROUTES: Record<ShellType, string> = {
  platform: '/platform',
  company: '/company',
  project: '/project',
  governance: '/governance',
  emergency: '/emergency',
}

/**
 * Redirects the user from /dashboard to their role-appropriate shell dashboard.
 * Called on DashboardPage when an org is selected.
 *
 * - Super CEO / Superadmin / SysAdmin → /platform
 * - CEO / HR → /company
 * - Founder → /governance
 * - Team Lead / Developer / PM → /company/projects (project shell entry)
 * - Member → /company
 *
 * If no org is selected, stays on personal dashboard.
 */
export function useRoleRedirect() {
  const navigate = useNavigate()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const { activeOrgId, activeOrg } = useOrgStore()
  const { setShell } = useContextStore()

  useEffect(() => {
    if (!activeOrgId) return // personal dashboard, no redirect

    const current = activeOrg()
    if (!current) return

    const role = current.role
    const targetShell = ROLE_DEFAULT_SHELL[role]
    const targetRoute = SHELL_ROUTES[targetShell]

    setShell(targetShell)
    navigate(targetRoute, { replace: true })
  }, [activeOrgId])
}
