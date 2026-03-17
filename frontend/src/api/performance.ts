import api from './client'

function cleanParams(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value != null) result[key] = String(value)
  }
  return result
}

export function getActivityPerTask(
  orgId: string,
  params?: {
    user_id?: string
    start_date?: string
    end_date?: string
    team_id?: string
    project_id?: string
  },
) {
  return api.get(`/orgs/${orgId}/performance/activity-per-task`, {
    params: params ? cleanParams(params) : undefined,
  })
}
