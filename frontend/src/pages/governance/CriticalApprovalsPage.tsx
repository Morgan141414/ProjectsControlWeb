import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  Shield, ChevronDown, ChevronRight, User, Calendar,
  MessageSquare, FileText, Scale, Building2, UserCog,
  ArrowUpRight,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated'

interface CriticalApproval {
  id: string
  title: string
  type: string
  typeKey: string
  description: string
  status: ApprovalStatus
  initiator: string
  createdAt: string
  deadline?: string
  priority: 'high' | 'critical'
  voters: { name: string; vote: 'approved' | 'rejected' | 'pending'; votedAt?: string }[]
  documents?: string[]
  impact: string
}

const DEMO_APPROVALS: CriticalApproval[] = [
  {
    id: '1',
    title: 'Назначение нового CEO',
    type: 'Назначение / смена CEO',
    typeKey: 'ceoChange',
    description: 'Назначение Козлова И.Р. на должность CEO вместо текущего исполняющего обязанности. Требуется согласование всех учредителей с долей > 10%.',
    status: 'pending',
    initiator: 'Николаев А.В.',
    createdAt: '2026-03-23',
    deadline: '2026-04-05',
    priority: 'critical',
    voters: [
      { name: 'Николаев А.В. (51%)', vote: 'approved', votedAt: '2026-03-23' },
      { name: 'Смирнова Е.П. (30%)', vote: 'pending' },
      { name: 'Козлов И.Р. (19%)', vote: 'pending' },
    ],
    documents: ['Приказ о назначении', 'Трудовой договор (проект)', 'Решение собрания'],
    impact: 'Смена оперативного управления компанией. Влияет на все бизнес-процессы.',
  },
  {
    id: '2',
    title: 'Передача 5% доли Козлову И.Р.',
    type: 'Передача долей',
    typeKey: 'shareTransfer',
    description: 'Николаев А.В. передаёт 5% долей Козлову И.Р. Новое распределение: Николаев 46%, Смирнова 30%, Козлов 24%.',
    status: 'pending',
    initiator: 'Николаев А.В.',
    createdAt: '2026-03-20',
    deadline: '2026-04-01',
    priority: 'high',
    voters: [
      { name: 'Николаев А.В. (51%)', vote: 'approved', votedAt: '2026-03-20' },
      { name: 'Смирнова Е.П. (30%)', vote: 'rejected', votedAt: '2026-03-21' },
      { name: 'Козлов И.Р. (19%)', vote: 'approved', votedAt: '2026-03-20' },
    ],
    impact: 'Изменение структуры владения. Влияет на голосующее большинство.',
  },
  {
    id: '3',
    title: 'Обновление политики безопасности данных',
    type: 'Изменение политик',
    typeKey: 'policyChange',
    description: 'Переход на новый стандарт хранения персональных данных в соответствии с 152-ФЗ. Внедрение шифрования at-rest.',
    status: 'approved',
    initiator: 'Смирнова Е.П.',
    createdAt: '2026-03-15',
    priority: 'high',
    voters: [
      { name: 'Николаев А.В. (51%)', vote: 'approved', votedAt: '2026-03-16' },
      { name: 'Смирнова Е.П. (30%)', vote: 'approved', votedAt: '2026-03-15' },
      { name: 'Козлов И.Р. (19%)', vote: 'approved', votedAt: '2026-03-17' },
    ],
    impact: 'Повышение уровня защиты данных. Потребуются технические изменения.',
  },
]

const statusStyleMap: Record<ApprovalStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'info'; icon: typeof Clock }> = {
  pending: { label: 'Ожидает', variant: 'warning', icon: Clock },
  approved: { label: 'Одобрено', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Отклонено', variant: 'error', icon: XCircle },
  escalated: { label: 'Эскалировано', variant: 'info', icon: AlertTriangle },
}

const typeIcons: Record<string, typeof Scale> = {
  ceoChange: UserCog,
  charterChange: FileText,
  shareTransfer: Scale,
  companyClose: Building2,
  majorContract: FileText,
  policyChange: Shield,
}

export default function CriticalApprovalsPage() {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all')

  const stats = {
    pending: DEMO_APPROVALS.filter((a) => a.status === 'pending').length,
    approved: DEMO_APPROVALS.filter((a) => a.status === 'approved').length,
    rejected: DEMO_APPROVALS.filter((a) => a.status === 'rejected').length,
    escalated: DEMO_APPROVALS.filter((a) => a.status === 'escalated').length,
  }

  const filtered = DEMO_APPROVALS.filter((a) => statusFilter === 'all' || a.status === statusFilter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('governance.criticalApprovals')}</h1>
        <p className="text-sm text-muted-foreground">{t('governance.criticalApprovalsDesc')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { key: 'pending' as const, label: t('governance.pending', 'Ожидают'), icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { key: 'approved' as const, label: t('governance.approved', 'Одобрено'), icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { key: 'rejected' as const, label: t('governance.rejected', 'Отклонено'), icon: XCircle, color: 'text-red-500 bg-red-500/10' },
          { key: 'escalated' as const, label: t('governance.escalated', 'Эскалировано'), icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10' },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
            className={`rounded-xl border bg-card p-4 text-left transition-colors ${statusFilter === s.key ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-border'}`}
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

      {/* Approval queue */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <EmptyState
            icon={ClipboardCheck}
            title={t('governance.noApprovals', 'Нет решений, требующих согласования')}
            description={t('governance.approvalsHint', 'Критические решения появятся здесь при изменениях в уставе, назначениях и финансах')}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((approval) => {
            const ss = statusStyleMap[approval.status]
            const isExpanded = expandedId === approval.id
            const TypeIcon = typeIcons[approval.typeKey] || AlertTriangle
            const approvedVotes = approval.voters.filter((v) => v.vote === 'approved').length
            const totalVotes = approval.voters.length

            return (
              <div key={approval.id} className={`rounded-xl border bg-card overflow-hidden ${approval.priority === 'critical' ? 'border-red-500/30' : 'border-border'}`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${approval.priority === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    <TypeIcon className={`h-5 w-5 ${approval.priority === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground truncate">{approval.title}</span>
                      {approval.priority === 'critical' && (
                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500">КРИТИЧНО</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{approval.type}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{approval.initiator}</span>
                      {approval.deadline && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />До {new Date(approval.deadline).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{approvedVotes}/{totalVotes}</p>
                      <p className="text-[10px] text-muted-foreground">голосов</p>
                    </div>
                    <StatusBadge variant={ss.variant}>{ss.label}</StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20">
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-sm text-foreground">{approval.description}</p>
                        <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Влияние: {approval.impact}
                          </p>
                        </div>
                      </div>

                      {/* Voting status */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Голосование</h4>
                        <div className="space-y-1.5">
                          {approval.voters.map((voter) => (
                            <div key={voter.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                              <span className="text-sm text-foreground">{voter.name}</span>
                              <div className="flex items-center gap-2">
                                {voter.votedAt && <span className="text-xs text-muted-foreground">{new Date(voter.votedAt).toLocaleDateString('ru-RU')}</span>}
                                {voter.vote === 'approved' && <StatusBadge variant="success">За</StatusBadge>}
                                {voter.vote === 'rejected' && <StatusBadge variant="error">Против</StatusBadge>}
                                {voter.vote === 'pending' && <StatusBadge variant="default">Не голосовал</StatusBadge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Documents */}
                      {approval.documents && approval.documents.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Документы</h4>
                          <div className="flex flex-wrap gap-2">
                            {approval.documents.map((doc) => (
                              <button key={doc} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                {doc}
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {approval.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
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
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Approval types info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold text-foreground mb-4">
          {t('governance.approvalTypes', 'Типы решений, требующих согласования')}
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { key: 'ceoChange', label: t('governance.type.ceoChange', 'Назначение / смена CEO'), icon: UserCog },
            { key: 'charterChange', label: t('governance.type.charterChange', 'Изменение устава'), icon: FileText },
            { key: 'shareTransfer', label: t('governance.type.shareTransfer', 'Передача долей'), icon: Scale },
            { key: 'companyClose', label: t('governance.type.companyClose', 'Ликвидация компании'), icon: Building2 },
            { key: 'majorContract', label: t('governance.type.majorContract', 'Крупные контракты'), icon: FileText },
            { key: 'policyChange', label: t('governance.type.policyChange', 'Изменение политик'), icon: Shield },
          ].map((type) => (
            <div key={type.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
              <type.icon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="text-sm text-foreground">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
