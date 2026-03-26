import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Org, JoinRequest } from '@/types'
import {
  listMyOrgs,
  createOrg,
  getOrg,
  joinOrg,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '@/api/orgs'
import { queryKeys } from '@/lib/queryKeys'
import { useOrgStore } from '@/stores/orgStore'

/** Fetch all orgs the current user belongs to, with roles. */
export function useMyOrgs() {
  const setOrgs = useOrgStore((s) => s.setOrgs)

  return useQuery({
    queryKey: queryKeys.org.myOrgs(),
    queryFn: async () => {
      const { data } = await listMyOrgs()
      // Sync to zustand store
      setOrgs(
        data.map((o) => ({
          orgId: o.id,
          orgName: o.name,
          role: o.role,
          logoUrl: o.logo_url ?? undefined,
        })),
      )
      return data
    },
  })
}

export function useOrg(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.org.detail(orgId!),
    queryFn: () => getOrg(orgId!).then((r) => r.data as Org),
    enabled: !!orgId,
  })
}

export function useJoinRequests(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.org.joinRequests(orgId!),
    queryFn: () => listJoinRequests(orgId!).then((r) => r.data as JoinRequest[]),
    enabled: !!orgId,
  })
}

export function useCreateOrg() {
  const qc = useQueryClient()
  const addOrg = useOrgStore((s) => s.addOrg)

  return useMutation({
    mutationFn: (name: string) => createOrg(name).then((r) => r.data as Org),
    onSuccess: (org) => {
      addOrg({ orgId: org.id, orgName: org.name, role: 'super_ceo' })
      qc.invalidateQueries({ queryKey: queryKeys.org.myOrgs() })
    },
  })
}

export function useJoinOrg() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => joinOrg(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.org.myOrgs() })
    },
  })
}

export function useApproveJoinRequest(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => approveJoinRequest(orgId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.org.joinRequests(orgId) })
      qc.invalidateQueries({ queryKey: queryKeys.users.list(orgId) })
    },
  })
}

export function useRejectJoinRequest(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => rejectJoinRequest(orgId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.org.joinRequests(orgId) })
    },
  })
}
