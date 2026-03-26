import { useCallback, useEffect, useRef } from 'react'
import { useContextStore } from '@/stores/contextStore'
import { useAuthStore } from '@/stores/authStore'
import type { MaskingContext } from '@/lib/masking'

/** Max emergency session duration in milliseconds (30 minutes) */
export const EMERGENCY_SESSION_MAX_MS = 30 * 60 * 1000

/**
 * Hook to manage emergency session lifecycle.
 * Auto-deactivates after EMERGENCY_SESSION_MAX_MS.
 * Returns session info and control functions.
 */
export function useEmergencySession() {
  const {
    emergencyMode,
    emergencyReason,
    emergencyStartedAt,
    enterEmergencyMode,
    exitEmergencyMode,
    addEmergencyLog,
  } = useContextStore()

  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Auto-expire emergency session
  useEffect(() => {
    if (!emergencyMode || !emergencyStartedAt) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const elapsed = Date.now() - emergencyStartedAt
    const remaining = EMERGENCY_SESSION_MAX_MS - elapsed

    if (remaining <= 0) {
      exitEmergencyMode()
      return
    }

    timerRef.current = setTimeout(() => {
      exitEmergencyMode()
    }, remaining)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [emergencyMode, emergencyStartedAt, exitEmergencyMode])

  const remainingMs = emergencyMode && emergencyStartedAt
    ? Math.max(0, EMERGENCY_SESSION_MAX_MS - (Date.now() - emergencyStartedAt))
    : 0

  const activate = useCallback((reason: string) => {
    enterEmergencyMode(reason)
  }, [enterEmergencyMode])

  const deactivate = useCallback(() => {
    exitEmergencyMode()
  }, [exitEmergencyMode])

  const logAction = useCallback((action: string, entity?: string, details?: string) => {
    addEmergencyLog({ action, entity, details })
  }, [addEmergencyLog])

  return {
    isActive: emergencyMode,
    reason: emergencyReason,
    startedAt: emergencyStartedAt,
    remainingMs,
    activate,
    deactivate,
    logAction,
  }
}

/**
 * Hook to get the current masking context.
 * Combines auth state with emergency mode state.
 */
export function useMaskingContext(): MaskingContext {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const emergencyMode = useContextStore((s) => s.emergencyMode)

  return {
    isPrivileged: isSuperAdmin,
    emergencyMode,
  }
}
