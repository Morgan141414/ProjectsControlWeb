import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listNotificationHooks, createNotificationHook, deleteNotificationHook } from '@/api/notifications'
import type { NotificationHook } from '@/types'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [hooks, setHooks] = useState<NotificationHook[]>([])
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [event, setEvent] = useState('report_export_ready')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listNotificationHooks(orgId)
      setHooks(r.data)
    } catch {
      toast.error(t('admin.hooksLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!orgId || !url.trim()) return
    setCreating(true)
    try {
      await createNotificationHook(orgId, { url: url.trim(), event_type: event })
      setUrl('')
      toast.success(t('admin.hookCreated'))
      load()
    } catch {
      toast.error(t('admin.hookCreateError'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!orgId) return
    try {
      await deleteNotificationHook(orgId, id)
      toast.success(t('admin.hookDeleted'))
      load()
    } catch {
      toast.error(t('admin.hookDeleteError'))
    }
  }

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.notificationsTab')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <PageHeader title={t('admin.notificationHooks')} description={t('admin.webhookConfig')} />

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.createHook')}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <input placeholder={t('admin.hookUrl')} value={url} onChange={(e) => setUrl(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <select value={event} onChange={(e) => setEvent(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="report_export_ready">report_export_ready</option>
          </select>
        </div>
        <button onClick={handleCreate} disabled={creating || !url.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t('common.create')}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : hooks.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('admin.noHooks')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">URL</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('admin.event')}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {hooks.map((hook: Record<string, unknown>) => (
                <tr key={String(hook.id)} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{String(hook.url)}</td>
                  <td className="px-4 py-2 text-muted-foreground">{String(hook.event)}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDelete(String(hook.id))} className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
