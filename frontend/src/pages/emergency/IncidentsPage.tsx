import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronDown, ChevronRight, User, Calendar, Shield,
  Zap, Lock, Server, Plus,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useContextStore } from '@/stores/contextStore'
import { useEmergencySession } from '@/hooks/useEmergency'

type Severity = 'critical' | 'high' | 'medium'
type IncidentStatus = 'active' | 'investigating' | 'contained' | 'resolved'

interface SecurityIncident {
  id: string
  title: string
  severity: Severity
  status: IncidentStatus
  category: string
  reportedAt: string
  resolvedAt?: string
  description: string
  indicators: string[]
  actions: string[]
  assignee?: string
}

const DEMO_INCIDENTS: SecurityIncident[] = [
  {
    id: 'SEC-001',
    title: 'Множественные неудачные попытки входа',
    severity: 'high',
    status: 'investigating',
    category: 'Brute Force',
    reportedAt: '2026-03-26T07:45:00',
    description: 'Обнаружено 150+ неудачных попыток входа с IP 185.x.x.x за последние 30 минут. Целевые аккаунты: admin, ceo, hr.',
    indicators: ['IP: 185.x.x.x', 'User-Agent: python-requests/2.x', '150+ попыток за 30 мин'],
    actions: ['IP заблокирован в WAF', 'Уведомление отправлено SysAdmin'],
    assignee: 'SysAdmin Козлов',
  },
  {
    id: 'SEC-002',
    title: 'Подозрительная выгрузка данных',
    severity: 'critical',
    status: 'active',
    category: 'Data Exfiltration',
    reportedAt: '2026-03-26T09:10:00',
    description: 'Аккаунт developer@company.ru скачал 500+ записей сотрудников за 5 минут через API. Нетипичное поведение.',
    indicators: ['Пользователь: developer@company.ru', '500+ API вызовов за 5 мин', 'Endpoint: /api/users'],
    actions: ['Сессия заморожена', 'Аккаунт временно заблокирован'],
  },
  {
    id: 'SEC-003',
    title: 'Устаревший JWT токен используется',
    severity: 'medium',
    status: 'resolved',
    category: 'Token Abuse',
    reportedAt: '2026-03-25T14:00:00',
    resolvedAt: '2026-03-25T15:30:00',
    description: 'Обнаружено использование JWT токена, срок действия которого истёк 2 часа назад. Предположительно кеширование на стороне клиента.',
    indicators: ['Expired JWT', 'Endpoint: /api/tasks', 'Единичный случай'],
    actions: ['Токен добавлен в blacklist', 'Пользователь уведомлён о перелогине'],
    assignee: 'SysAdmin Петров',
  },
]

const severityConfig: Record<Severity, { label: string; color: string; variant: 'error' | 'warning' | 'info' }> = {
  critical: { label: 'Критический', color: 'text-red-500 bg-red-500/10', variant: 'error' },
  high: { label: 'Высокий', color: 'text-orange-500 bg-orange-500/10', variant: 'warning' },
  medium: { label: 'Средний', color: 'text-amber-500 bg-amber-500/10', variant: 'info' },
}

const statusConfig: Record<IncidentStatus, { label: string; variant: 'error' | 'warning' | 'success' | 'default' }> = {
  active: { label: 'Активен', variant: 'error' },
  investigating: { label: 'Расследование', variant: 'warning' },
  contained: { label: 'Локализован', variant: 'default' },
  resolved: { label: 'Решён', variant: 'success' },
}

export default function IncidentsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const emergencyMode = useContextStore((s) => s.emergencyMode)
  const { logAction } = useEmergencySession()

  const filtered = DEMO_INCIDENTS.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false
    return true
  })

  const stats = {
    active: DEMO_INCIDENTS.filter((i) => i.status === 'active').length,
    investigating: DEMO_INCIDENTS.filter((i) => i.status === 'investigating').length,
    resolved: DEMO_INCIDENTS.filter((i) => i.status === 'resolved').length,
  }

  function handleExpandIncident(id: string) {
    setExpandedId(expandedId === id ? null : id)
    if (emergencyMode && expandedId !== id) {
      logAction('incident_viewed', id, `Просмотр деталей инцидента ${id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('emergency.incidents')}</h1>
        <p className="text-sm text-muted-foreground">{t('emergency.incidentsDesc')}</p>
      </div>

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Режим ЧП — полный доступ к деталям инцидентов
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: 'active' as const, label: t('emergency.openIncidents', 'Активные'), icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
          { key: 'investigating' as const, label: t('emergency.investigating', 'На расследовании'), icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { key: 'resolved' as const, label: t('emergency.resolved', 'Решённые'), icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
            className={`rounded-xl border bg-card p-4 text-left transition-colors ${
              statusFilter === s.key ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-border'
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

      {/* Incidents list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <EmptyState
            icon={Shield}
            title={t('emergency.noIncidents', 'Нет инцидентов безопасности')}
            description="Инциденты безопасности будут отображаться здесь при обнаружении угроз"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inc) => {
            const sev = severityConfig[inc.severity]
            const st = statusConfig[inc.status]
            const isExpanded = expandedId === inc.id

            return (
              <div key={inc.id} className={`rounded-xl border bg-card overflow-hidden ${
                inc.severity === 'critical' ? 'border-red-500/30' : inc.status === 'active' ? 'border-orange-500/20' : 'border-border'
              }`}>
                <button
                  onClick={() => handleExpandIncident(inc.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${sev.color.split(' ')[1]}`}>
                    {inc.severity === 'critical' ? (
                      <Zap className={`h-5 w-5 ${sev.color.split(' ')[0]}`} />
                    ) : (
                      <AlertCircle className={`h-5 w-5 ${sev.color.split(' ')[0]}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                      <span className="text-sm font-medium text-foreground truncate">{inc.title}</span>
                      {inc.severity === 'critical' && (
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white animate-pulse">КРИТ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{inc.category}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(inc.reportedAt).toLocaleString('ru-RU')}</span>
                      {inc.assignee && <span className="flex items-center gap-1"><User className="h-3 w-3" />{inc.assignee}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <StatusBadge variant={sev.variant}>{sev.label}</StatusBadge>
                    <StatusBadge variant={st.variant}>{st.label}</StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20 space-y-4">
                    <p className="text-sm text-foreground">{inc.description}</p>

                    {/* Indicators */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Индикаторы компрометации (IoC)</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {inc.indicators.map((ioc) => (
                          <span key={ioc} className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-xs font-mono text-foreground">
                            {ioc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions taken */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Принятые меры</h4>
                      <div className="space-y-1.5">
                        {inc.actions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-foreground">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {inc.status !== 'resolved' && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        {inc.status === 'active' && (
                          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                            Начать расследование
                          </button>
                        )}
                        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                          Отметить решённым
                        </button>
                        <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-colors">
                          Эскалировать
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
    </div>
  )
}
