import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import {
  Kanban, Users, MessageSquare, Clock, BarChart3,
  AlertCircle, FileText, ArrowRight, FolderKanban, Inbox,
} from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_LABELS } from '@/types'

export default function ProjectDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id: projectId } = useParams()
  const fullName = useAuthStore((s) => s.fullName)
  const { activeOrg } = useOrgStore()
  const current = activeOrg()
  const role = current?.role ?? null

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderKanban className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('project.noProjectSelected')}</h2>
        <p className="text-sm text-muted-foreground">{t('project.selectProjectHint')}</p>
      </div>
    )
  }

  const workspaceLinks = [
    { label: t('project.board'), icon: Kanban, to: `/project/${projectId}/board` },
    { label: t('project.tasks'), icon: FolderKanban, to: `/project/${projectId}/tasks` },
    { label: t('project.chat'), icon: MessageSquare, to: `/project/${projectId}/chat` },
    { label: t('project.members'), icon: Users, to: `/project/${projectId}/members` },
    { label: t('project.files'), icon: FileText, to: `/project/${projectId}/files` },
    { label: t('project.deadlines'), icon: Clock, to: `/project/${projectId}/deadlines` },
  ]

  const managementLinks = (role === 'team_lead' || role === 'project_manager' || role === 'ceo' || role === 'super_ceo')
    ? [
        { label: t('project.kpi'), icon: BarChart3, to: `/project/${projectId}/kpi` },
        { label: t('project.risks'), icon: AlertCircle, to: `/project/${projectId}/risks` },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-violet-600 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-200">
          {t('project.projectWorkspace')}
        </p>
        <h2 className="mt-1.5 text-xl font-bold text-white">
          {fullName ?? t('common.user')}
        </h2>
        <p className="mt-1 text-sm text-violet-200">
          {role ? ROLE_LABELS[role] : t('common.member')}
        </p>
      </div>

      {/* Workspace navigation */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {workspaceLinks.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <link.icon className="h-5 w-5 text-violet-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{link.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Management links for leads */}
      {managementLinks.length > 0 && (
        <div>
          <h3 className="text-[15px] font-semibold text-foreground mb-3">{t('project.management')}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {managementLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <link.icon className="h-5 w-5 text-violet-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{link.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold text-foreground mb-4">{t('project.recentActivity')}</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">{t('project.noRecentActivity')}</p>
        </div>
      </div>
    </div>
  )
}
