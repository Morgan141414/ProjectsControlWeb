import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Key, Shield, Search, Clock, CheckCircle2, XCircle,
  User, Calendar, ChevronDown, ChevronRight, AlertTriangle,
  Eye, FileText,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useContextStore } from '@/stores/contextStore'
import type { EmergencyLogEntry } from '@/stores/contextStore'

type RequestStatus = 'pending' | 'approved' | 'denied' | 'expired'

interface AccessRequest {
  id: string
  requestedBy: string
  role: string
  reason: string
  targetEntity: string
  status: RequestStatus
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  duration: string
  actionsPerformed?: number
}

const DEMO_REQUESTS: AccessRequest[] = [
  {
    id: 'AR-001',
    requestedBy: 'SysAdmin Козлов',
    role: 'sysadmin',
    reason: 'Расследование инцидента INC-001: повышенная задержка API',
    targetEntity: 'Все логи компании "ООО Компания"',
    status: 'approved',
    requestedAt: '2026-03-26T08:20:00',
    reviewedAt: '2026-03-26T08:22:00',
    reviewedBy: 'Super CEO',
    duration: '30 мин',
    actionsPerformed: 12,
  },
  {
    id: 'AR-002',
    requestedBy: 'Superadmin Волков',
    role: 'superadmin',
    reason: 'Аудит безопасности: проверка прав доступа сотрудников',
    targetEntity: 'Профили сотрудников "ООО Компания"',
    status: 'pending',
    requestedAt: '2026-03-26T10:00:00',
    duration: '30 мин',
  },
  {
    id: 'AR-003',
    requestedBy: 'SysAdmin Петров',
    role: 'sysadmin',
    reason: 'Техническая поддержка: пользователь не может войти в систему',
    targetEntity: 'Профиль пользователя Иванов А.С.',
    status: 'denied',
    requestedAt: '2026-03-25T16:15:00',
    reviewedAt: '2026-03-25T16:20:00',
    reviewedBy: 'Super CEO',
    duration: '30 мин',
  },
  {
    id: 'AR-004',
    requestedBy: 'Superadmin Волков',
    role: 'superadmin',
    reason: 'Проверка целостности бухгалтерских данных по запросу СБ',
    targetEntity: 'Финансовые документы "ООО Компания"',
    status: 'expired',
    requestedAt: '2026-03-20T09:00:00',
    duration: '30 мин',
  },
]

const statusConfig: Record<RequestStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'default' }> = {
  pending: { label: 'Ожидает', variant: 'warning' },
  approved: { label: 'Одобрен', variant: 'success' },
  denied: { label: 'Отклонён', variant: 'error' },
  expired: { label: 'Истёк', variant: 'default' },
}

export default function AccessRequestsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const emergencyLogs = useContextStore((s) => s.emergencyLogs)

  const filtered = DEMO_REQUESTS.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  const stats = {
    pending: DEMO_REQUESTS.filter((r) => r.status === 'pending').length,
    approved: DEMO_REQUESTS.filter((r) => r.status === 'approved').length,
    denied: DEMO_REQUESTS.filter((r) => r.status === 'denied').length,
  }

  // Recent emergency sessions from local logs
  const recentSessions = emergencyLogs
    .filter((l) => l.action === 'emergency_activated')
    .slice(-5)
    .reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('nav.accessRequests')}</h1>
        <p className="text-sm text-muted-foreground">{t('platform.accessRequestsDesc', 'Запросы на emergency-доступ к защищённым данным')}</p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Superadmin и SysAdmin могут запрашивать emergency-доступ к конфиденциальным данным.
            Все запросы требуют обоснования и логируются в аудит.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: 'pending' as const, label: 'Ожидают', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { key: 'approved' as const, label: 'Одобрено', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { key: 'denied' as const, label: 'Отклонено', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
            className={`rounded-xl border bg-card p-4 text-left transition-colors ${
              statusFilter === s.key ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats[s.key]}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <EmptyState
            icon={Shield}
            title={t('platform.noAccessRequests', 'Нет запросов на доступ')}
            description="Запросы на emergency-доступ будут отображаться здесь"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const sc = statusConfig[req.status]
            const isExpanded = expandedId === req.id

            return (
              <div key={req.id} className={`rounded-xl border bg-card overflow-hidden ${
                req.status === 'pending' ? 'border-amber-500/30' : 'border-border'
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    req.status === 'pending' ? 'bg-amber-500/10' : req.status === 'approved' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <Key className={`h-5 w-5 ${
                      req.status === 'pending' ? 'text-amber-500' : req.status === 'approved' ? 'text-emerald-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                      <span className="text-sm font-medium text-foreground truncate">{req.requestedBy}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{req.reason}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.requestedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Роль запросившего</span>
                        <p className="text-sm font-medium text-foreground capitalize">{req.role}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Целевые данные</span>
                        <p className="text-sm font-medium text-foreground">{req.targetEntity}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Длительность</span>
                        <p className="text-sm font-medium text-foreground">{req.duration}</p>
                      </div>
                      {req.reviewedBy && (
                        <div>
                          <span className="text-xs text-muted-foreground">Рассмотрел</span>
                          <p className="text-sm font-medium text-foreground">{req.reviewedBy}</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                      <span className="text-xs text-muted-foreground">Обоснование:</span>
                      <p className="text-sm text-foreground mt-1">{req.reason}</p>
                    </div>

                    {req.actionsPerformed !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Действий выполнено в сессии: <span className="font-medium text-foreground">{req.actionsPerformed}</span>
                      </p>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Одобрить
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                          <XCircle className="h-3.5 w-3.5" />
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent emergency sessions from local store */}
      {recentSessions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-[15px] font-semibold text-foreground">Последние ЧП-сессии (локально)</h3>
          </div>
          <div className="space-y-2">
            {recentSessions.map((log, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{log.details || 'ЧП-доступ'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <StatusBadge variant="error">ЧП</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
