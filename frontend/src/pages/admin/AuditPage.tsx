import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listAudit } from '@/api/audit'
import type { AuditLog } from '@/types'
import { Loader2, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function AuditPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listAudit(orgId)
      setLogs(r.data)
    } catch {
      toast.error(t('admin.auditLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.auditTab')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <PageHeader
        title={t('admin.auditLog')}
        actions={
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
            <RefreshCw className="h-3.5 w-3.5" /> {t('admin.refresh')}
          </button>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : logs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('admin.noLogs')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Entity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: Record<string, unknown>, i: number) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2">
                    <StatusBadge variant={String(log.action) === 'delete' ? 'error' : String(log.action) === 'create' ? 'success' : 'info'}>
                      {String(log.action)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2 text-foreground">{String(log.entity_type ?? '')} {String(log.entity_id ?? '').slice(0, 8)}</td>
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{String(log.actor_id ?? '').slice(0, 8)}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{log.created_at ? new Date(String(log.created_at)).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
