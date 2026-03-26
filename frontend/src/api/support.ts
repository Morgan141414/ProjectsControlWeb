import api from './client'
import type { SupportMessage, SupportStats, SupportThread } from '@/types'

function buildFormData(data: { subject?: string; body?: string; files?: File[] }) {
  const formData = new FormData()
  if (data.subject !== undefined) formData.append('subject', data.subject)
  if (data.body !== undefined) formData.append('body', data.body)
  for (const file of data.files ?? []) {
    formData.append('files', file)
  }
  return formData
}

// ── Org-scoped support ──

export function listSupportThreads(orgId: string) {
  return api.get<SupportThread[]>(`/orgs/${orgId}/support/threads`)
}

export function getSupportThread(orgId: string, threadId: string) {
  return api.get<SupportThread>(`/orgs/${orgId}/support/threads/${threadId}`)
}

export function createSupportThread(
  orgId: string,
  data: { subject: string; body: string; files?: File[] },
) {
  return api.post<SupportThread>(`/orgs/${orgId}/support/threads`, buildFormData(data))
}

export function sendSupportMessage(
  orgId: string,
  threadId: string,
  data: { body: string; files?: File[] },
) {
  return api.post<SupportMessage>(
    `/orgs/${orgId}/support/threads/${threadId}/messages`,
    buildFormData(data),
  )
}

export function updateSupportThreadStatus(
  orgId: string,
  threadId: string,
  status: 'open' | 'answered' | 'closed',
) {
  return api.patch<SupportThread>(`/orgs/${orgId}/support/threads/${threadId}/status`, { status })
}

export function deleteSupportThread(orgId: string, threadId: string) {
  return api.delete(`/orgs/${orgId}/support/threads/${threadId}`)
}

export function getSupportStats(orgId: string) {
  return api.get<SupportStats>(`/orgs/${orgId}/support/stats`)
}

// ── Personal support (no org required) ──

export function listPersonalThreads() {
  return api.get<SupportThread[]>('/support/threads')
}

export function getPersonalThread(threadId: string) {
  return api.get<SupportThread>(`/support/threads/${threadId}`)
}

export function createPersonalThread(data: { subject: string; body: string; files?: File[] }) {
  return api.post<SupportThread>('/support/threads', buildFormData(data))
}

export function sendPersonalMessage(threadId: string, data: { body: string; files?: File[] }) {
  return api.post<SupportMessage>(`/support/threads/${threadId}/messages`, buildFormData(data))
}

export function deletePersonalThread(threadId: string) {
  return api.delete(`/support/threads/${threadId}`)
}
