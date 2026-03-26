import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  Search, Filter, ChevronDown, ChevronRight, User, Calendar,
  FileText, Building2, MessageSquare,
} from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated'
type ApprovalCategory = 'all' | 'personnel' | 'financial' | 'organizational' | 'policy'

interface ApprovalItem {
  id: string
  title: string
  category: ApprovalCategory
  status: ApprovalStatus
  requestedBy: string
  requestedAt: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Demo data — in production comes from API
const DEMO_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    title: 'Приём на работу: Иванов А.С.',
    category: 'personnel',
    status: 'pending',
    requestedBy: 'HR Петрова',
    requestedAt: '2026-03-25T10:30:00',
    description: 'Оформление нового разработчика в отдел frontend. Трудовой договор подготовлен.',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'Закупка серверного оборудования',
    category: 'financial',
    status: 'pending',
    requestedBy: 'SysAdmin Козлов',
    requestedAt: '2026-03-24T14:15:00',
    description: 'Закупка 3 серверов для prod-окружения. Бюджет: 450 000 ₽.',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Изменение политики удалённой работы',
    category: 'policy',
    status: 'pending',
    requestedBy: 'CEO',
    requestedAt: '2026-03-23T09:00:00',
    description: 'Переход на гибридный формат: 3 дня офис, 2 дня удалёнка.',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Создание нового отдела: QA',
    category: 'organizational',
    status: 'approved',
    requestedBy: 'CEO',
    requestedAt: '2026-03-20T11:00:00',
    description: 'Выделение QA-отдела из команды разработки.',
    priority: 'low',
  },
  {
    id: '5',
    title: 'Увольнение: Сидоров П.К.',
    category: 'personnel',
    status: 'rejected',
    requestedBy: 'Team Lead Волков',
    requestedAt: '2026-03-19T16:30:00',
    description: 'Запрос на увольнение по инициативе руководителя. Причина: систематические нарушения.',
    priority: 'high',
  },
]

const statusConfig: Record<ApprovalStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'info'; icon: typeof Clock }> = {
  pending: { label: 'Ожидает', variant: 'warning', icon: Clock },
  approved: { label: 'Одобрено', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Отклонено', variant: 'error', icon: XCircle },
  escalated: { label: 'Эскалировано', variant: 'info', icon: AlertTriangle },
}

const categoryLabels: Record<ApprovalCategory, string> = {
  all: 'Все',
  personnel: 'Кадровые',
  financial: 'Финансовые',
  organizational: 'Организационные',
  policy: 'Политики',
}

const priorityColors: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
}

export default function CompanyApprovalsPage() {
  const { t } = useTranslation()
  const { activeOrgId } = useOrgStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ApprovalCategory>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('company.noOrgSelected')}</h2>
      </div>
    )
  }

  const filtered = DEMO_APPROVALS.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.requestedBy.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    pending: DEMO_APPROVALS.filter((a) => a.status === 'pending').length,
    approved: DEMO_APPROVALS.filter((a) => a.status === 'approved').length,
    rejected: DEMO_APPROVALS.filter((a) => a.status === 'rejected').length,
    escalated: DEMO_APPROVALS.filter((a) => a.status === 'escalated').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('nav.approvals')}</h1>
        <p className="text-sm text-muted-foreground">Согласования и утверждения в рамках компании</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { key: 'pending' as const, label: 'Ожидают', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { key: 'approved' as const, label: 'Одобрено', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { key: 'rejected' as const, label: 'Отклонено', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
          { key: 'escalated' as const, label: 'Эскалировано', icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10' },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
            className={`rounded-xl border bg-card p-4 text-left transition-colors ${statusFilter === s.key ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-border/80'}`}
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по согласованиям..."
            className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(Object.entries(categoryLabels) as [ApprovalCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                categoryFilter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Нет согласований"
            description="Согласования появятся здесь при создании запросов на утверждение"
          />
        ) : (
          filtered.map((item) => {
            const sc = statusConfig[item.status]
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                      <span className={`text-xs font-medium ${priorityColors[item.priority]}`}>
                        {item.priority === 'critical' ? '!!!' : item.priority === 'high' ? '!!' : item.priority === 'medium' ? '!' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.requestedBy}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.requestedAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20">
                    <p className="text-sm text-foreground mb-4">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="rounded-md bg-muted px-2 py-1">{categoryLabels[item.category]}</span>
                      <span>Запрос: {new Date(item.requestedAt).toLocaleString('ru-RU')}</span>
                    </div>
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Одобрить
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                          <XCircle className="h-3.5 w-3.5" />
                          Отклонить
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Комментарий
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
