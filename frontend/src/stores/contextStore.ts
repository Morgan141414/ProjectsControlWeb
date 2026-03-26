import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShellType, OrgRole, AppContext } from '@/types'
import { ROLE_DEFAULT_SHELL, ROLE_ALLOWED_SHELLS } from '@/types'

/** A single emergency action log entry (stored locally) */
export interface EmergencyLogEntry {
  /** ISO timestamp */
  timestamp: string
  /** User who performed the action */
  userId?: string
  /** What was done */
  action: string
  /** What entity was affected */
  entity?: string
  /** Additional details */
  details?: string
  /** The emergency reason that was active */
  sessionReason?: string
}

interface ContextState {
  /** Current active shell */
  shell: ShellType | null
  /** Active project id within project shell */
  activeProjectId: string | null
  /** Emergency mode flag for superadmin */
  emergencyMode: boolean
  /** Reason for emergency access */
  emergencyReason: string | null
  /** Timestamp when emergency mode was activated */
  emergencyStartedAt: number | null
  /** Local emergency action log (persisted for audit trail) */
  emergencyLogs: EmergencyLogEntry[]

  // Actions
  setShell: (shell: ShellType) => void
  setActiveProject: (projectId: string | null) => void
  enterEmergencyMode: (reason: string) => void
  exitEmergencyMode: () => void
  addEmergencyLog: (entry: { action: string; entity?: string; details?: string }) => void

  /** Determine the best shell based on role + isSuperAdmin flag */
  resolveShell: (role: OrgRole | null, isSuperAdmin: boolean) => ShellType
  /** Check if a role can access a given shell */
  canAccessShell: (role: OrgRole | null, isSuperAdmin: boolean, shell: ShellType) => boolean
  /** Get current context snapshot */
  getContext: (orgId: string | null) => AppContext

  clear: () => void
}

export const useContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      shell: null,
      activeProjectId: null,
      emergencyMode: false,
      emergencyReason: null,
      emergencyStartedAt: null,
      emergencyLogs: [],

      setShell: (shell) => set({ shell }),

      setActiveProject: (projectId) =>
        set({ activeProjectId: projectId, shell: projectId ? 'project' : get().shell }),

      enterEmergencyMode: (reason) => {
        const now = Date.now()
        const entry: EmergencyLogEntry = {
          timestamp: new Date(now).toISOString(),
          action: 'emergency_activated',
          details: reason,
          sessionReason: reason,
        }
        set((state) => ({
          emergencyMode: true,
          emergencyReason: reason,
          emergencyStartedAt: now,
          shell: 'emergency',
          emergencyLogs: [...state.emergencyLogs, entry],
        }))
      },

      exitEmergencyMode: () => {
        const { emergencyReason, emergencyStartedAt } = get()
        const now = Date.now()
        const durationSec = emergencyStartedAt ? Math.round((now - emergencyStartedAt) / 1000) : 0
        const entry: EmergencyLogEntry = {
          timestamp: new Date(now).toISOString(),
          action: 'emergency_deactivated',
          details: `Duration: ${durationSec}s`,
          sessionReason: emergencyReason ?? undefined,
        }
        set((state) => ({
          emergencyMode: false,
          emergencyReason: null,
          emergencyStartedAt: null,
          shell: 'platform',
          emergencyLogs: [...state.emergencyLogs, entry],
        }))
      },

      addEmergencyLog: (entry) => {
        const { emergencyReason } = get()
        const logEntry: EmergencyLogEntry = {
          timestamp: new Date().toISOString(),
          action: entry.action,
          entity: entry.entity,
          details: entry.details,
          sessionReason: emergencyReason ?? undefined,
        }
        set((state) => ({
          emergencyLogs: [...state.emergencyLogs, logEntry],
        }))
      },

      resolveShell: (role, isSuperAdmin) => {
        // Platform-level superadmin (flag on user, not org role)
        if (isSuperAdmin && !role) return 'platform'
        if (!role) return 'company'
        return ROLE_DEFAULT_SHELL[role]
      },

      canAccessShell: (role, isSuperAdmin, shell) => {
        if (isSuperAdmin) return true // platform superadmin can access everything
        if (!role) return shell === 'company' // no role = basic company access
        return ROLE_ALLOWED_SHELLS[role].includes(shell)
      },

      getContext: (orgId) => {
        const { shell, activeProjectId, emergencyMode, emergencyReason } = get()
        return {
          shell: shell ?? 'company',
          orgId,
          projectId: activeProjectId,
          emergencyMode,
          emergencyReason: emergencyReason ?? undefined,
        }
      },

      clear: () =>
        set({
          shell: null,
          activeProjectId: null,
          emergencyMode: false,
          emergencyReason: null,
          emergencyStartedAt: null,
          emergencyLogs: [],
        }),
    }),
    { name: 'context-storage' },
  ),
)
