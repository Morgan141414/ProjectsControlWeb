import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle, AlertCircle, CheckCircle2, Clock, Search,
  ChevronDown, ChevronRight, User, Calendar, Shield,
  Server, Database, Wifi, Bug, ArrowUpRight,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

type Severity = 'critical' | 'high' | 'medium' | 'low'
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'

interface Incident {
  id: string
  title: string
  severity: Severity
  status: IncidentStatus
  category: string
  reportedBy: string
  reportedAt: string
  resolvedAt?: string
  description: string
  affectedServices: string[]
  timeline: { time: string; event: string }[]
}

const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    title: 'Повышенная задержка API ответов',
    severity: 'high',
    status: 'investigating',
    category: 'Performance',
    reportedBy: 'Мониторинг',
    reportedAt: '2026-03-26T08:15:00',
    description: 'Среднее время ответа API увеличилось с 120ms до 850ms. Затрагивает все эндпоинты авторизации.',
    affectedServices: ['API Server', 'Auth Service'],
    timeline: [
      { time: '08:15', event: 'Обнаружено мониторингом' },
      { time: '08:18', event: 'Назначен SysAdmin Козлов' },
      { time: '08:25', event: 'Начато расследование — подозрение на нагрузку БД' },
    ],
  },
  {
    id: 'INC-002',
    title: 'Ошибка 502 при загрузке файлов > 5MB',
    severity: 'medium',
    status: 'open',
    category: 'Bug',
    reportedBy: 'Петрова М.А.',
    reportedAt: '2026-03-25T14:30:00',
    description: 'При загрузке файлов размером более 5MB возвращается ошибка 502 Bad Gateway. Затрагивает модуль документов.',
    affectedServices: ['File Upload', 'Nginx'],
    timeline: [
      { time: '14:30', event: 'Зарегистрирован пользователем' },
    ],
  },
  {
    id: 'INC-003',
    title: 'Плановое обслуживание БД — завершено',
    severity: 'low',
    status: 'resolved',
    category: 'Maintenance',
    reportedBy: 'SysAdmin',
    reportedAt: '2026-03-24T02:00:00',
    resolvedAt: '2026-03-24T03:30:00',
    description: 'Плановая миграция базы данных и очистка индексов. Время простоя: 90 минут.',
    affectedServices: ['Database'],
    timeline: [
      { time: '02:00', event: 'Начало обслуживания' },
      { time: '02:45', event: 'Миграция завершена' },
      { time: '03:15', event: 'Проверка целостности' },
      { time: '03:30', event: 'Сервис восстановлен' },
    ],
  },
]

const severityConfig: Record<Severity, { label: string; color: string; variant: 'error' | 'warning' | 'info' | 'default' }> = {
  critical: { label: 'Критический', color: 'text-red-500 bg-red-500/10', variant: 'error' },
  high: { label: 'Высокий', color: 'text-orange-500 bg-orange-500/10', variant: 'warning' },
  medium: { label: 'Средний', color: 'text-amber-500 bg-amber-500/10', variant: 'warning' },
  low: { label: 'Низкий', color: 'text-blue-500 bg-blue-500/10', variant: 'info' },
}

const statusConfig: Record<IncidentStatus, { label: string; variant: 'error' | 'warning' | 'success' | 'default' }> = {
  open: { label: 'Открыт', variant: 'error' },
  investigating: { label: 'Расследование', variant: 'warning' },
  resolved: { label: 'Решён', variant: 'success' },
  closed: { label: 'Закрыт', variant: 'default' },
}

const categoryIcons: Record<string, typeof Server> = {
  Performance: Server,
  Bug: Bug,
  Security: Shield,
  Maintenance: Database,
  Network: Wifi,
}

export default function PlatformIncidentsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = DEMO_INCIDENTS.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false
    if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) && !inc.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    open: DEMO_INCIDENTS.filter((i) => i.status === 'open').length,
    investigating: DEMO_INCIDENTS.filter((i) => i.status === 'investigating').length,
    resolved: DEMO_INCIDENTS.filter((i) => i.status === 'resolved').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('nav.incidents')}</h1>
        <p className="text-sm text-muted-foreground">{t('platform.incidentsDesc', 'Инциденты и происшествия на платформе')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: 'open' as const, label: t('emergency.openIncidents', 'Открытые'), icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
          { key: 'investigating' as const, label: t('emergency.investigating', 'На расследовании'), icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { key: 'resolved' as const, label: t('emergency.resolved', 'Решённые'), icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по инцидентам..."
          className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {/* Incidents list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <EmptyState
            icon={AlertTriangle}
            title={t('emergency.noIncidents', 'Нет инцидентов')}
            description="Инциденты будут отображаться здесь при их регистрации"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inc) => {
            const sev = severityConfig[inc.severity]
            const st = statusConfig[inc.status]
            const isExpanded = expandedId === inc.id
            const CatIcon = categoryIcons[inc.category] || AlertCircle

            return (
              <div key={inc.id} className={`rounded-xl border bg-card overflow-hidden ${
                inc.severity === 'critical' ? 'border-red-500/30' : 'border-border'
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${sev.color.split(' ')[1]}`}>
                    <CatIcon className={`h-5 w-5 ${sev.color.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                      <span className="text-sm font-medium text-foreground truncate">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{inc.reportedBy}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(inc.reportedAt).toLocaleDateString('ru-RU')}</span>
                      <span className="flex items-center gap-1"><CatIcon className="h-3 w-3" />{inc.category}</span>
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

                    {/* Affected services */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Затронутые сервисы</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {inc.affectedServices.map((svc) => (
                          <span key={svc} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Хронология</h4>
                      <div className="space-y-2">
                        {inc.timeline.map((entry, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-xs font-mono text-muted-foreground w-12 shrink-0 pt-0.5">{entry.time}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              <span className="text-sm text-foreground">{entry.event}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {(inc.status === 'open' || inc.status === 'investigating') && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        {inc.status === 'open' && (
                          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                            Начать расследование
                          </button>
                        )}
                        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                          Отметить решённым
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
