import { useTranslation } from 'react-i18next'
import { ScrollText, Inbox, Search, Filter, Clock, Download, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useOrgStore } from '@/stores/orgStore'
import { useAudit } from '@/hooks/useAdmin'
import { useEmergencySession } from '@/hooks/useEmergency'
import { useContextStore } from '@/stores/contextStore'
import { cn } from '@/lib/utils'

const ACTION_TYPE_COLORS: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-600',
  update: 'bg-blue-500/10 text-blue-600',
  delete: 'bg-red-500/10 text-red-600',
  login: 'bg-violet-500/10 text-violet-600',
  logout: 'bg-muted text-muted-foreground',
  access: 'bg-amber-500/10 text-amber-600',
}

function getActionColor(action: string): string {
  const lower = action.toLowerCase()
  for (const [key, color] of Object.entries(ACTION_TYPE_COLORS)) {
    if (lower.includes(key)) return color
  }
  return 'bg-red-500/10 text-red-600'
}

export default function ForensicLogsPage() {
  const { t } = useTranslation()
  const { activeOrgId } = useOrgStore()
  const { data: logs, isLoading } = useAudit(activeOrgId ?? '')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const { logAction } = useEmergencySession()
  const emergencyMode = useContextStore((s) => s.emergencyMode)

  // Log viewing forensic logs in emergency mode
  useEffect(() => {
    if (emergencyMode) {
      logAction('logs_viewed', 'forensic_logs', `Org: ${activeOrgId}`)
    }
  }, [emergencyMode, activeOrgId, logAction])

  const allLogs = (logs as any[]) || []

  // Extract unique action types for filter
  const actionTypes = [...new Set(allLogs.map((l: any) => l.action).filter(Boolean))]

  const filteredLogs = allLogs.filter((l: any) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false
    if (!search) return true
    return JSON.stringify(l).toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('emergency.forensicLogs')}</h1>
          <p className="text-sm text-muted-foreground">{t('emergency.forensicLogsDesc')}</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs font-medium text-red-500">
            {t('emergency.logsWarning', 'Все просмотры логов записываются в аудит. Используйте только для расследований.')}
          </p>
        </div>
      </div>

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              {t('emergency.viewingInEmergencyMode', 'Просмотр в режиме ЧП — все действия логируются')}
            </p>
          </div>
        </div>
      )}

      {/* Search + action filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('emergency.searchLogs', 'Поиск по логам...')}
            className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        {actionTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActionFilter('all')}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                actionFilter === 'all'
                  ? 'border-red-500/30 bg-red-500/10 text-red-600'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {t('support.filterAll')}
            </button>
            {actionTypes.slice(0, 6).map((action) => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  actionFilter === action
                    ? 'border-red-500/30 bg-red-500/10 text-red-600'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent',
                )}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logs table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">{t('admin.noRecords')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.timestamp', 'Время')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.actor', 'Субъект')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.action', 'Действие')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.entity', 'Объект')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.details', 'Детали')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">
                      {log.actor_id || log.user_id || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded px-2 py-0.5 text-xs font-medium', getActionColor(log.action || ''))}>
                        {log.action || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {log.entity_type || log.resource || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm max-w-[200px] truncate">
                      {log.details || log.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!isLoading && filteredLogs.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {t('emergency.showingRecords', 'Показано записей')}: {filteredLogs.length}
          {allLogs.length !== filteredLogs.length && ` / ${allLogs.length}`}
        </p>
      )}
    </div>
  )
}
