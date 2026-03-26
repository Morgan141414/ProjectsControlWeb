import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Shield, Search, Clock, AlertTriangle, Download, Trash2 } from 'lucide-react'
import { useContextStore } from '@/stores/contextStore'
import type { EmergencyLogEntry } from '@/stores/contextStore'
import { cn } from '@/lib/utils'

const ACTION_COLORS: Record<string, string> = {
  emergency_activated: 'bg-red-500/10 text-red-600',
  emergency_deactivated: 'bg-emerald-500/10 text-emerald-600',
  data_viewed: 'bg-blue-500/10 text-blue-600',
  profile_accessed: 'bg-violet-500/10 text-violet-600',
  logs_viewed: 'bg-amber-500/10 text-amber-600',
}

const ACTION_LABELS: Record<string, { ru: string; en: string }> = {
  emergency_activated: { ru: 'ЧП активирован', en: 'Emergency activated' },
  emergency_deactivated: { ru: 'ЧП деактивирован', en: 'Emergency deactivated' },
  data_viewed: { ru: 'Просмотр данных', en: 'Data viewed' },
  profile_accessed: { ru: 'Доступ к профилю', en: 'Profile accessed' },
  logs_viewed: { ru: 'Просмотр логов', en: 'Logs viewed' },
}

function LogRow({ entry, lang }: { entry: EmergencyLogEntry; lang: string }) {
  const labels = ACTION_LABELS[entry.action]
  const actionLabel = labels ? (lang === 'ru' ? labels.ru : labels.en) : entry.action
  const colorClass = ACTION_COLORS[entry.action] || 'bg-muted text-muted-foreground'

  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
        {new Date(entry.timestamp).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <span className={cn('rounded px-2 py-0.5 text-xs font-medium', colorClass)}>
          {actionLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">
        {entry.entity || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
        {entry.details || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate">
        {entry.sessionReason || '—'}
      </td>
    </tr>
  )
}

export default function AccessHistoryPage() {
  const { t, i18n } = useTranslation()
  const emergencyLogs = useContextStore((s) => s.emergencyLogs)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  // Filter logs
  const filteredLogs = emergencyLogs
    .filter((log) => {
      if (filterAction !== 'all' && log.action !== filterAction) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          log.action.toLowerCase().includes(q) ||
          (log.entity?.toLowerCase().includes(q)) ||
          (log.details?.toLowerCase().includes(q)) ||
          (log.sessionReason?.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Session stats
  const activations = emergencyLogs.filter((l) => l.action === 'emergency_activated').length
  const totalActions = emergencyLogs.filter((l) => l.action !== 'emergency_activated' && l.action !== 'emergency_deactivated').length

  const uniqueActions = [...new Set(emergencyLogs.map((l) => l.action))]

  function handleExport() {
    const csv = [
      ['Timestamp', 'Action', 'Entity', 'Details', 'Session Reason'].join(','),
      ...emergencyLogs.map((l) =>
        [l.timestamp, l.action, l.entity || '', l.details || '', l.sessionReason || '']
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emergency-access-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('emergency.accessHistory')}</h1>
          <p className="text-sm text-muted-foreground">{t('emergency.accessHistoryDesc')}</p>
        </div>
        {emergencyLogs.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t('emergency.exportCsv', 'Экспорт CSV')}
          </button>
        )}
      </div>

      {/* Warning */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <p className="text-xs font-medium text-red-500">
          {t('emergency.accessWarning', 'Журнал всех emergency-доступов к защищённым данным')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activations}</p>
              <p className="text-xs text-muted-foreground">{t('emergency.totalSessions', 'Всего сессий ЧП')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Key className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalActions}</p>
              <p className="text-xs text-muted-foreground">{t('emergency.totalActions', 'Действий в ЧП')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{emergencyLogs.length}</p>
              <p className="text-xs text-muted-foreground">{t('emergency.totalRecords', 'Всего записей')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterAction('all')}
            className={cn(
              'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
              filterAction === 'all'
                ? 'border-red-500/30 bg-red-500/10 text-red-600'
                : 'border-border bg-card text-muted-foreground hover:bg-accent',
            )}
          >
            {t('support.filterAll')}
          </button>
          {uniqueActions.map((action) => {
            const labels = ACTION_LABELS[action]
            const label = labels ? (i18n.language === 'ru' ? labels.ru : labels.en) : action
            return (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  filterAction === action
                    ? 'border-red-500/30 bg-red-500/10 text-red-600'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('emergency.noAccessRecords', 'Нет записей об emergency-доступах')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('emergency.accessRecordsHint', 'Здесь будут отображаться все случаи использования режима ЧП')}
            </p>
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
                    {t('emergency.action', 'Действие')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.entity', 'Объект')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.details', 'Детали')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('emergency.sessionReason', 'Причина сессии')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((entry, i) => (
                  <LogRow key={`${entry.timestamp}-${i}`} entry={entry} lang={i18n.language} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
