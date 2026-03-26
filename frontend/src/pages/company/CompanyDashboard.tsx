import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Building2, Users, FolderKanban, ClipboardCheck,
  ArrowRight, ListTodo, CheckCircle2, FolderOpen, Inbox, Loader2,
  Shield, Briefcase, UserPlus, BarChart3, Calendar,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { listTodayTasks } from '@/api/tasks'
import { listProjects } from '@/api/projects'
import type { Task, Project, OrgRole } from '@/types'
import { ROLE_LABELS } from '@/types'
import { EmptyState } from '@/components/shared/EmptyState'

/** Role-specific greeting subtitle */
function getRoleSubtitle(role: OrgRole | null, t: (k: string, d?: string) => string): string {
  switch (role) {
    case 'super_ceo':
    case 'ceo':
      return t('company.ceoSubtitle', 'Управление компанией')
    case 'hr':
      return t('company.hrSubtitle', 'Кадровый центр')
    case 'team_lead':
    case 'project_manager':
      return t('company.leadSubtitle', 'Управление командой')
    case 'developer':
      return t('company.devSubtitle', 'Рабочее пространство')
    case 'founder':
      return t('company.founderSubtitle', 'Обзор компании')
    default:
      return t('company.memberSubtitle', 'Рабочее пространство')
  }
}

/** Role-specific quick actions */
function getQuickActions(role: OrgRole | null, t: (k: string, d?: string) => string) {
  const actions: { label: string; icon: typeof Users; to: string; color: string }[] = []

  if (role === 'ceo' || role === 'super_ceo') {
    actions.push(
      { label: t('company.managePeople'), icon: Users, to: '/company/people', color: 'text-emerald-500 bg-emerald-500/10' },
      { label: t('company.viewApprovals'), icon: ClipboardCheck, to: '/company/approvals', color: 'text-amber-500 bg-amber-500/10' },
      { label: t('company.manageProjects'), icon: FolderKanban, to: '/company/projects', color: 'text-violet-500 bg-violet-500/10' },
      { label: t('company.manageRoles', 'Роли и права'), icon: Shield, to: '/company/roles', color: 'text-blue-500 bg-blue-500/10' },
    )
  }

  if (role === 'hr') {
    actions.push(
      { label: t('company.managePeople'), icon: Users, to: '/company/people', color: 'text-emerald-500 bg-emerald-500/10' },
      { label: t('company.hrWorkspace'), icon: Briefcase, to: '/company/hr', color: 'text-blue-500 bg-blue-500/10' },
      { label: t('company.viewApprovals'), icon: ClipboardCheck, to: '/company/approvals', color: 'text-amber-500 bg-amber-500/10' },
      { label: t('company.schedules', 'Расписание'), icon: Calendar, to: '/company/hr/schedules', color: 'text-violet-500 bg-violet-500/10' },
    )
  }

  if (role === 'team_lead' || role === 'project_manager') {
    actions.push(
      { label: t('company.myProjects', 'Мои проекты'), icon: FolderKanban, to: '/company/projects', color: 'text-violet-500 bg-violet-500/10' },
      { label: t('company.myTeam', 'Моя команда'), icon: Users, to: '/company/teams', color: 'text-emerald-500 bg-emerald-500/10' },
      { label: t('company.viewPeople', 'Сотрудники'), icon: Users, to: '/company/people', color: 'text-blue-500 bg-blue-500/10' },
    )
  }

  if (role === 'developer' || role === 'member') {
    actions.push(
      { label: t('company.myProjects', 'Мои проекты'), icon: FolderKanban, to: '/company/projects', color: 'text-violet-500 bg-violet-500/10' },
      { label: t('company.viewPeople', 'Сотрудники'), icon: Users, to: '/company/people', color: 'text-emerald-500 bg-emerald-500/10' },
    )
  }

  if (role === 'founder') {
    actions.push(
      { label: t('company.viewPeople', 'Сотрудники'), icon: Users, to: '/company/people', color: 'text-emerald-500 bg-emerald-500/10' },
      { label: t('company.manageProjects'), icon: FolderKanban, to: '/company/projects', color: 'text-violet-500 bg-violet-500/10' },
    )
  }

  return actions
}

export default function CompanyDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fullName = useAuthStore((s) => s.fullName)
  const { activeOrgId, activeOrg } = useOrgStore()
  const orgId = activeOrgId!
  const current = activeOrg()
  const role = current?.role ?? null

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    Promise.all([
      listTodayTasks(orgId).then(({ data }) => setTasks(data)).catch(() => {}),
      listProjects(orgId).then(({ data }) => setProjects(data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [orgId])

  const completed = tasks.filter((t) => t.status === 'done' || t.status === 'completed').length
  const quickActions = getQuickActions(role, t)

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('company.noOrgSelected')}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t('company.selectOrgHint')}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t('company.goToDashboard', 'Перейти к выбору')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">
          {current?.orgName}
        </p>
        <h2 className="mt-1.5 text-xl font-bold text-white">
          {fullName ?? t('common.user')}
        </h2>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm text-emerald-200">
            {role ? ROLE_LABELS[role] : t('common.member')}
          </span>
          <span className="text-emerald-300/50">|</span>
          <span className="text-sm text-emerald-200/80">
            {getRoleSubtitle(role, t)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t('dashboard.totalTasks'), value: loading ? '—' : tasks.length, icon: ListTodo },
          { label: t('dashboard.completedToday'), value: loading ? '—' : completed, icon: CheckCircle2 },
          { label: t('dashboard.activeProjects'), value: loading ? '—' : projects.length, icon: FolderOpen },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <s.icon className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Projects list (primary for developer/team_lead) */}
        {(role === 'developer' || role === 'team_lead' || role === 'project_manager' || role === 'member') && projects.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4 text-violet-500" />
                <h3 className="text-[15px] font-semibold text-foreground">{t('company.myProjects', 'Мои проекты')}</h3>
              </div>
              <button
                onClick={() => navigate('/company/projects')}
                className="text-xs text-primary font-medium hover:underline"
              >
                {t('common.details', 'Все')}
              </button>
            </div>
            <div className="space-y-1.5">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-border px-3.5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <FolderKanban className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today Tasks */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <ListTodo className="h-4 w-4 text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.todayTasks')}</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={t('dashboard.noTasks')}
              description={t('dashboard.noTasksDesc', 'Задачи на сегодня появятся здесь')}
            />
          ) : (
            <ul className="space-y-1.5">
              {tasks.slice(0, 8).map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="text-sm text-foreground">{task.title}</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">{task.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-[15px] font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
            <div className="space-y-2">
              {quickActions.map((a) => (
                <button
                  key={a.to}
                  onClick={() => navigate(a.to)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.color.split(' ')[1]}`}>
                    <a.icon className={`h-4 w-4 ${a.color.split(' ')[0]}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">{a.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
