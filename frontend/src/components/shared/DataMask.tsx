import { useTranslation } from 'react-i18next'
import { useContextStore } from '@/stores/contextStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataMaskProps {
  /** The actual data to display */
  children: React.ReactNode
  /** Fallback masked value (default: "••••••••") */
  maskedValue?: string
  /** If true, this field is always visible (override masking) */
  alwaysVisible?: boolean
  /** CSS class for the mask container */
  className?: string
}

/**
 * Masks sensitive data for superadmin users when NOT in emergency mode.
 *
 * Per spec: Superadmin cannot see confidential client/company info
 * unless emergency mode is active (with audit trail).
 *
 * For non-superadmin users: data is always shown (they see what their role allows).
 * For superadmin without emergency: data is masked.
 * For superadmin with emergency: data is shown (logged by emergency audit).
 */
export function DataMask({
  children,
  maskedValue = '••••••••',
  alwaysVisible = false,
  className,
}: DataMaskProps) {
  const { t } = useTranslation()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const emergencyMode = useContextStore((s) => s.emergencyMode)
  const { activeOrg } = useOrgStore()

  const current = activeOrg()
  const role = current?.role ?? null

  // Only mask for superadmin role (not platform-level superadmin flag)
  const isSuperadminRole = role === 'superadmin'
  const shouldMask = isSuperadminRole && !emergencyMode && !alwaysVisible

  if (!shouldMask) {
    return <>{children}</>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-muted-foreground select-none',
        className,
      )}
      title={t('access.maskedData', 'Данные скрыты. Используйте режим ЧП для доступа.')}
    >
      <EyeOff className="h-3 w-3" />
      <span className="text-sm tracking-wider">{maskedValue}</span>
    </span>
  )
}

/**
 * Wrapper for entire sections that should be masked for superadmin.
 * Shows a lock overlay instead of content.
 */
export function MaskedSection({
  children,
  title,
  className,
}: {
  children: React.ReactNode
  title?: string
  className?: string
}) {
  const { t } = useTranslation()
  const emergencyMode = useContextStore((s) => s.emergencyMode)
  const { activeOrg } = useOrgStore()

  const current = activeOrg()
  const role = current?.role ?? null
  const isSuperadminRole = role === 'superadmin'
  const shouldMask = isSuperadminRole && !emergencyMode

  if (!shouldMask) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative rounded-xl border border-border bg-card overflow-hidden', className)}>
      <div className="absolute inset-0 backdrop-blur-md bg-card/80 z-10 flex flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          {title || t('access.maskedSection', 'Данные скрыты')}
        </h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          {t('access.maskedSectionDesc', 'Для просмотра активируйте режим ЧП с указанием причины. Все действия будут записаны в аудит.')}
        </p>
      </div>
      <div className="opacity-10 pointer-events-none" aria-hidden="true">
        {children}
      </div>
    </div>
  )
}
