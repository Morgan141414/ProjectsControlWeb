import api from './client'
import type { Project } from '../types'

export function listProjects(orgId: string) {
  return api.get<Project[]>(`/orgs/${orgId}/projects`)
}

<<<<<<< HEAD
export function getProject(orgId: string, projectId: string) {
  return api.get<Project>(`/orgs/${orgId}/projects/${projectId}`)
}

=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
export function createProject(orgId: string, name: string, description?: string) {
  const body: Record<string, string> = { name }
  if (description != null) body.description = description
  return api.post<Project>(`/orgs/${orgId}/projects`, body)
}
