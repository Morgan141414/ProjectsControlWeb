import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  PieChart, ClipboardCheck, History, BookOpen,
  ArrowRight, Scale, Inbox,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { ROLE_LABELS } from '@/types'

export default function GovernanceDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fullName = useAuthStore((s) => s.fullName)
  const { activeOrg } = useOrgStore()
  const current = activeOrg()
  const role = current?.role ?? null

  const sections = [
    { label: t('governance.ownership'), description: t('governance.ownershipDesc'), icon: PieChart, to: '/governance/ownership' },
    { label: t('governance.criticalApprovals'), description: t('governance.criticalApprovalsDesc'), icon: ClipboardCheck, to: '/governance/critical-approvals' },
    { label: t('governance.decisionHistory'), description: t('governance.decisionHistoryDesc'), icon: History, to: '/governance/decision-history' },
    { label: t('governance.documents'), description: t('governance.documentsDesc'), icon: BookOpen, to: '/governance/documents' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-amber-600 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-200">
          {t('governance.governanceCenter')}
        </p>
        <h2 className="mt-1.5 text-xl font-bold text-white">
          {fullName ?? t('common.user')}
        </h2>
        <p className="mt-1 text-sm text-amber-200">
          {current?.orgName} {role ? `— ${ROLE_LABELS[role]}` : ''}
        </p>
      </div>

      {/* Pending approvals indicator */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{t('governance.pendingDecisions')}</h3>
            <p className="text-sm text-muted-foreground">{t('governance.noPendingDecisions')}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <s.icon className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{s.label}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
