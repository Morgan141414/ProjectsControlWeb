import { Navigate, Outlet, useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { AccessDenied } from '@/components/shared/AccessDenied'
import type { ShellType } from '@/types'

interface ShellGuardProps {
  /** Which shell this route group belongs to */
  shell: ShellType
}

/**
 * Route guard that checks if the current user can access a given shell.
 * Wraps shell route groups (e.g. /platform/*, /company/*, etc.)
 */
export function ShellGuard({ shell }: ShellGuardProps) {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const { activeOrgId, activeOrg } = useOrgStore()
  const canAccessShell = useContextStore((s) => s.canAccessShell)
  const navigate = useNavigate()

  const current = activeOrg()
  const role = current?.role ?? null

  const hasAccess = canAccessShell(role, isSuperAdmin, shell)

  // Company/project/governance shells require an active org
  if (['company', 'project', 'governance'].includes(shell) && !activeOrgId) {
    return <Navigate to="/dashboard" replace />
  }

  if (!hasAccess) {
    const grantedByMap: Record<ShellType, string> = {
      platform: 'Super CEO',
      company: 'CEO',
      project: 'Team Lead / CEO',
      governance: 'Super CEO / Учредители',
      emergency: 'Super CEO',
    }

    const reasonMap: Record<ShellType, string> = {
      platform: 'Этот раздел доступен только для администраторов платформы (Super CEO, Superadmin, SysAdmin).',
      company: 'Для доступа к управлению компанией необходима соответствующая роль в организации.',
      project: 'Для доступа к проекту необходимо быть участником проекта или руководителем.',
      governance: 'Раздел корпоративного управления доступен только учредителям и CEO.',
      emergency: 'Режим ЧП доступен только для Superadmin и SysAdmin.',
    }

    return (
      <AccessDenied
        type={shell === 'emergency' ? 'emergency_only' : 'denied'}
        reason={reasonMap[shell]}
        grantedBy={grantedByMap[shell]}
        canRequest
        onRequest={() => navigate(-1)}
      />
    )
  }

  return <Outlet />
}
