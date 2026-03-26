import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  History, Search, Filter, Calendar, User, FileText,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  ChevronRight, Scale, Shield, UserCog, Building2,
  Clock, ArrowUpRight,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface Decision {
  id: string
  title: string
  type: string
  typeKey: string
  result: 'approved' | 'rejected'
  initiator: string
  decidedAt: string
  voteSummary: string
  description: string
  impact: string
  voters: { name: string; vote: 'approved' | 'rejected' }[]
}

const DEMO_DECISIONS: Decision[] = [
  {
    id: '1',
    title: 'Обновление политики безопасности данных',
    type: 'Изменение политик',
    typeKey: 'policyChange',
    result: 'approved',
    initiator: 'Смирнова Е.П.',
    decidedAt: '2026-03-17',
    voteSummary: '3 за / 0 против',
    description: 'Переход на новый стандарт хранения персональных данных. Внедрение шифрования at-rest.',
    impact: 'Повышение уровня защиты данных.',
    voters: [
      { name: 'Николаев А.В. (51%)', vote: 'approved' },
      { name: 'Смирнова Е.П. (30%)', vote: 'approved' },
      { name: 'Козлов И.Р. (19%)', vote: 'approved' },
    ],
  },
  {
    id: '2',
    title: 'Привлечение нового инвестора (Козлов И.Р.)',
    type: 'Передача долей',
    typeKey: 'shareTransfer',
    result: 'approved',
    initiator: 'Николаев А.В.',
    decidedAt: '2025-06-08',
    voteSummary: '2 за / 0 против',
    description: 'Вступление Козлова И.Р. с долей 19%. Перераспределение: Николаев 51%, Смирнова 30%, Козлов 19%.',
    impact: 'Изменение структуры владения. Привлечение инвестиций.',
    voters: [
      { name: 'Николаев А.В. (60%)', vote: 'approved' },
      { name: 'Смирнова Е.П. (40%)', vote: 'approved' },
    ],
  },
  {
    id: '3',
    title: 'Ликвидация дочерней структуры "ООО Тест"',
    type: 'Ликвидация компании',
    typeKey: 'companyClose',
    result: 'rejected',
    initiator: 'Козлов И.Р.',
    decidedAt: '2025-05-20',
    voteSummary: '1 за / 2 против',
    description: 'Предложение о ликвидации дочерней компании "ООО Тест" в связи с убыточностью.',
    impact: 'Сокращение структуры. Высвобождение ресурсов.',
    voters: [
      { name: 'Николаев А.В. (60%)', vote: 'rejected' },
      { name: 'Смирнова Е.П. (40%)', vote: 'rejected' },
    ],
  },
  {
    id: '4',
    title: 'Утверждение устава компании',
    type: 'Изменение устава',
    typeKey: 'charterChange',
    result: 'approved',
    initiator: 'Николаев А.В.',
    decidedAt: '2024-01-15',
    voteSummary: '2 за / 0 против',
    description: 'Первичное утверждение устава при регистрации компании.',
    impact: 'Учреждение компании.',
    voters: [
      { name: 'Николаев А.В. (60%)', vote: 'approved' },
      { name: 'Смирнова Е.П. (40%)', vote: 'approved' },
    ],
  },
]

const typeIcons: Record<string, typeof Scale> = {
  ceoChange: UserCog,
  charterChange: FileText,
  shareTransfer: Scale,
  companyClose: Building2,
  majorContract: FileText,
  policyChange: Shield,
}

export default function DecisionHistoryPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState<'all' | 'approved' | 'rejected'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = DEMO_DECISIONS.filter((d) => {
    if (resultFilter !== 'all' && d.result !== resultFilter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.initiator.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('governance.decisionHistory')}</h1>
        <p className="text-sm text-muted-foreground">{t('governance.decisionHistoryDesc')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('governance.searchDecisions', 'Поиск по решениям...')}
            className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all' as const, label: 'Все' },
            { key: 'approved' as const, label: 'Одобрено' },
            { key: 'rejected' as const, label: 'Отклонено' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setResultFilter(f.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                resultFilter === f.key ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Всего решений: <span className="font-semibold text-foreground">{DEMO_DECISIONS.length}</span></span>
        <span className="text-emerald-500">Одобрено: {DEMO_DECISIONS.filter((d) => d.result === 'approved').length}</span>
        <span className="text-red-500">Отклонено: {DEMO_DECISIONS.filter((d) => d.result === 'rejected').length}</span>
      </div>

      {/* Decision list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <EmptyState
            icon={History}
            title={t('governance.noDecisions', 'История решений пуста')}
            description="Здесь будет отображаться история всех критических решений"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((decision) => {
            const isExpanded = expandedId === decision.id
            const TypeIcon = typeIcons[decision.typeKey] || AlertTriangle

            return (
              <div key={decision.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${decision.result === 'approved' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {decision.result === 'approved' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{decision.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><TypeIcon className="h-3 w-3" />{decision.type}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(decision.decidedAt).toLocaleDateString('ru-RU')}</span>
                      <span className="hidden sm:flex items-center gap-1"><User className="h-3 w-3" />{decision.initiator}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{decision.voteSummary}</span>
                    <StatusBadge variant={decision.result === 'approved' ? 'success' : 'error'}>
                      {decision.result === 'approved' ? 'Одобрено' : 'Отклонено'}
                    </StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20 space-y-3">
                    <p className="text-sm text-foreground">{decision.description}</p>
                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                      <p className="text-xs text-muted-foreground">Влияние: <span className="text-foreground">{decision.impact}</span></p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Итоги голосования</h4>
                      <div className="space-y-1">
                        {decision.voters.map((voter) => (
                          <div key={voter.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                            <span className="text-sm text-foreground">{voter.name}</span>
                            <StatusBadge variant={voter.vote === 'approved' ? 'success' : 'error'}>
                              {voter.vote === 'approved' ? 'За' : 'Против'}
                            </StatusBadge>
                          </div>
                        ))}
                      </div>
                    </div>
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
