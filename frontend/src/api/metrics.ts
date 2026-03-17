import api from './client'
import type { SessionMetrics, UserMetrics } from '../types'

function cleanParams(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value != null) result[key] = String(value)
  }
  return result
}

export function getSessionMetrics(orgId: string, sessionId: string) {
  return api.get<SessionMetrics>(`/orgs/${orgId}/metrics/sessions/${sessionId}`)
}

export function getUserMetrics(
  orgId: string,
  userId: string,
  params?: { start_date?: string; end_date?: string; project_id?: string },
) {
  return api.get<UserMetrics>(`/orgs/${orgId}/metrics/users/${userId}`, {
    params: params ? cleanParams(params) : undefined,
  })
}
