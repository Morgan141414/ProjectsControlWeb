import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/api/orgs'
import type { JoinRequest } from '@/types'
import { Check, X, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function JoinRequestsPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listJoinRequests(orgId)
      setRequests(r.data)
    } catch {
      toast.error(t('admin.joinRequests') + ': load error')
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: string) {
    if (!orgId) return
    try {
      await approveJoinRequest(orgId, id)
      toast.success(t('admin.approve') + ' OK')
      load()
    } catch {
      toast.error(t('admin.approve') + ' error')
    }
  }

  async function handleReject(id: string) {
    if (!orgId) return
    try {
      await rejectJoinRequest(orgId, id)
      toast.success(t('admin.reject') + ' OK')
      load()
    } catch {
      toast.error(t('admin.reject') + ' error')
    }
  }

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.joinRequests')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <PageHeader title={t('admin.joinRequests')} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{t('admin.noRequests')}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.user_id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'default'}>
                      {req.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1 rounded-md bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50">
                          <Check className="h-3 w-3" /> {t('admin.approve')}
                        </button>
                        <button onClick={() => handleReject(req.id)} className="flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50">
                          <X className="h-3 w-3" /> {t('admin.reject')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
