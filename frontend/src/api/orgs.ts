import api from './client'
<<<<<<< HEAD
import type { Org, OrgWithRole, JoinRequest } from '../types'

export function listMyOrgs() {
  return api.get<OrgWithRole[]>('/orgs')
}
=======
import type { Org, JoinRequest } from '../types'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

export function createOrg(name: string) {
  return api.post<Org>('/orgs', { name })
}

export function getOrg(orgId: string) {
  return api.get<Org>(`/orgs/${orgId}`)
}

export function joinOrg(orgCode: string) {
  return api.post('/orgs/join-request', { org_code: orgCode })
}

export function listJoinRequests(orgId: string) {
  return api.get<JoinRequest[]>(`/orgs/${orgId}/join-requests`)
}

export function approveJoinRequest(orgId: string, requestId: string) {
  return api.post(`/orgs/${orgId}/join-requests/${requestId}/approve`)
}

export function rejectJoinRequest(orgId: string, requestId: string) {
  return api.post(`/orgs/${orgId}/join-requests/${requestId}/reject`)
}
