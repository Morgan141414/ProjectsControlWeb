import { create } from 'zustand'
import { persist } from 'zustand/middleware'
<<<<<<< HEAD
import type { OrgRole } from '@/types'

export interface OrgMembership {
  orgId: string
  orgName: string
  role: OrgRole
  logoUrl?: string
}

interface OrgState {
  /** All orgs the user belongs to */
  orgs: OrgMembership[]
  /** Currently active org id, or null for personal dashboard */
  activeOrgId: string | null

  // Computed-like helpers
  activeOrg: () => OrgMembership | null
  activeOrgRole: () => OrgRole | null

  // Actions
  setOrgs: (orgs: OrgMembership[]) => void
  addOrg: (org: OrgMembership) => void
  setActiveOrg: (orgId: string | null) => void
=======

interface OrgState {
  orgId: string | null
  orgName: string | null
  setOrg: (orgId: string, orgName: string) => void
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  clear: () => void
}

export const useOrgStore = create<OrgState>()(
  persist(
<<<<<<< HEAD
    (set, get) => ({
      orgs: [],
      activeOrgId: null,

      activeOrg: () => {
        const { orgs, activeOrgId } = get()
        return orgs.find((o) => o.orgId === activeOrgId) ?? null
      },

      activeOrgRole: () => {
        const org = get().activeOrg()
        return org?.role ?? null
      },

      setOrgs: (orgs) => {
        const { activeOrgId } = get()
        // If active org no longer in list, reset to null
        const stillExists = orgs.some((o) => o.orgId === activeOrgId)
        set({ orgs, activeOrgId: stillExists ? activeOrgId : (orgs.length > 0 ? orgs[0].orgId : null) })
      },

      addOrg: (org) => {
        const { orgs } = get()
        set({ orgs: [...orgs, org], activeOrgId: org.orgId })
      },

      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),

      clear: () => set({ orgs: [], activeOrgId: null }),
=======
    (set) => ({
      orgId: null,
      orgName: null,

      setOrg: (orgId, orgName) => set({ orgId, orgName }),

      clear: () => set({ orgId: null, orgName: null }),
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    }),
    { name: 'org-storage' },
  ),
)
