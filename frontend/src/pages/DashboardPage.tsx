import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { Task, Project } from '@/types'
import { ROLE_DEFAULT_SHELL } from '@/types'
import type { ShellType } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useContextStore } from '@/stores/contextStore'
import { useCreateOrg, useJoinOrg, useMyOrgs } from '@/hooks/useOrg'
import { OnboardingFlow } from '@/components/shared/OnboardingFlow'
import { listTodayTasks } from '@/api/tasks'
import { listProjects } from '@/api/projects'
import { createDailyReport } from '@/api/dailyReports'
import { useNavigate } from 'react-router'
import {
  Building2,
  ClipboardList,
  Send,
  Inbox,
  Loader2,
  CheckCircle2,
  FolderOpen,
  ListTodo,
  FileBarChart,
  User,
  Plus,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Star,
} from 'lucide-react'

/* ─── Welcome Card ─── */
function WelcomeCard() {
  const { t } = useTranslation()
  const fullName = useAuthStore((s) => s.fullName)
  const { activeOrg } = useOrgStore()
  const current = activeOrg()

  const getGreetingKey = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'dashboard.greeting.morning'
    if (hour >= 12 && hour < 18) return 'dashboard.greeting.afternoon'
    if (hour >= 18 && hour < 23) return 'dashboard.greeting.evening'
    return 'dashboard.greeting.night'
  }

  return (
    <div className="rounded-xl bg-primary px-6 py-5">
      <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
        {current ? current.orgName : t('dashboard.welcomeBack')}
      </p>
      <h2 className="mt-1.5 text-xl font-bold text-primary-foreground">
        {fullName ?? t('dashboard.welcome')}
      </h2>
      <p className="mt-1 text-sm text-primary-foreground/70">{t(getGreetingKey())}!</p>
      {!current && (
        <p className="mt-0.5 text-sm text-primary-foreground/50">{t('dashboard.personalMode')}</p>
      )}
    </div>
  )
}

/* ─── Personal Dashboard ─── */
function PersonalDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orgs } = useOrgStore()
  const { setActiveOrg } = useOrgStore()
  const createOrgMutation = useCreateOrg()
  const joinOrgMutation = useJoinOrg()
  const [newOrgName, setNewOrgName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  // Show onboarding flow for new users with no organizations
  if (orgs.length === 0) {
    return <OnboardingFlow />
  }

  async function handleCreate() {
    if (!newOrgName.trim()) return
    try {
      await createOrgMutation.mutateAsync(newOrgName.trim())
      toast.success(t('dashboard.orgCreated'))
      setNewOrgName('')
    } catch {
      toast.error(t('dashboard.failedCreateOrg'))
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    try {
      await joinOrgMutation.mutateAsync(joinCode.trim())
      toast.success(t('dashboard.joinRequestSent'))
      setJoinCode('')
    } catch {
      toast.error(t('dashboard.failedJoinOrg'))
    }
  }

  const quickLinks = [
    { label: t('nav.profile'), icon: User, to: '/profile' },
    { label: t('nav.vacancies'), icon: Briefcase, to: '/vacancies' },
    { label: t('nav.messenger'), icon: MessageSquare, to: '/messenger' },
    { label: t('nav.ratings'), icon: Star, to: '/ratings' },
  ]

  return (
    <div className="space-y-6">
      <WelcomeCard />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* My Companies */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.myCompanies')}</h3>
          </div>

          <div className="space-y-1.5 mb-4">
            {orgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => setActiveOrg(org.orgId)}
                className="flex w-full items-center justify-between rounded-lg border border-border px-3.5 py-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-foreground">
                    {org.orgName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{org.orgName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{org.role}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('dashboard.createOrg')}
              </label>
              <div className="flex gap-2">
                <input
                  placeholder={t('dashboard.namePlaceholder')}
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
                />
                <button
                  onClick={handleCreate}
                  disabled={createOrgMutation.isPending}
                  className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {createOrgMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('dashboard.joinOrgLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  placeholder={t('dashboard.orgCodePlaceholder')}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
                />
                <button
                  onClick={handleJoin}
                  disabled={joinOrgMutation.isPending}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  {joinOrgMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('dashboard.join')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quickLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-border p-5 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Org Dashboard ─── */
function OrgDashboard() {
  const { t } = useTranslation()
  const { activeOrgId, activeOrg } = useOrgStore()
  const orgId = activeOrgId!
  const current = activeOrg()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [reportContent, setReportContent] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [sendingReport, setSendingReport] = useState(false)

  useEffect(() => {
    setLoadingTasks(true)
    listTodayTasks(orgId)
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error(t('dashboard.failedLoadTasks')))
      .finally(() => setLoadingTasks(false))

    listProjects(orgId)
      .then(({ data }) => setProjects(data))
      .catch(() => {})
  }, [orgId, t])

  const completed = tasks.filter((t) => t.status === 'done' || t.status === 'completed').length

  async function handleSendReport() {
    if (!selectedProject || !reportContent.trim()) return
    setSendingReport(true)
    try {
      await createDailyReport(orgId, {
        project_id: selectedProject,
        content: reportContent.trim(),
      })
      toast.success(t('dashboard.reportSent'))
      setReportContent('')
    } catch {
      toast.error(t('dashboard.failedSendReport'))
    } finally {
      setSendingReport(false)
    }
  }

  const stats = [
    { label: t('dashboard.totalTasks'), value: tasks.length, icon: ListTodo },
    { label: t('dashboard.completedToday'), value: completed, icon: CheckCircle2 },
    { label: t('dashboard.activeProjects'), value: projects.length, icon: FolderOpen },
  ]

  const quickActions = [
    { label: t('dashboard.viewReports'), icon: FileBarChart, to: '/reports' },
    { label: t('dashboard.viewProfile'), icon: User, to: '/profile' },
  ]

  return (
    <div className="space-y-6">
      <WelcomeCard />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card rounded-xl border border-border bg-card p-4" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Org Info */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.organization')}</h3>
          </div>
          <p className="text-sm font-medium text-foreground">{current?.orgName}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{t('dashboard.yourRole')}: {current?.role}</p>
        </div>

        {/* Today Tasks */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.todayTasks')}</h3>
          </div>
          {loadingTasks ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">{t('dashboard.noTasks')}</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="text-sm text-foreground">{task.title}</span>
                  <span className="rounded bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">{task.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daily Report */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.dailyReport')}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('dashboard.project')}</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none"
              >
                <option value="">{t('dashboard.selectProject')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('dashboard.content')}</label>
              <textarea
                rows={3}
                placeholder={t('dashboard.whatWasDoneToday')}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSendReport}
              disabled={sendingReport || !selectedProject}
              className="flex w-full h-9 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sendingReport ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t('dashboard.sending')}</>
              ) : (
                <><Send className="h-4 w-4" />{t('dashboard.sendReport')}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('dashboard.quickActions')}</h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <a.icon className="h-4 w-4 text-primary" />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main ─── */
export default function DashboardPage() {
  const { activeOrgId } = useOrgStore()
  useMyOrgs()

  // When org is active, redirect to the role-appropriate shell dashboard
  // This ensures users land on their correct context instead of the generic dashboard
  if (activeOrgId) {
    return <RoleRedirectDashboard />
  }

  return <PersonalDashboard />
}

const SHELL_ROUTES: Record<ShellType, string> = {
  platform: '/platform',
  company: '/company',
  project: '/project',
  governance: '/governance',
  emergency: '/emergency',
}

/** Redirects to role-appropriate shell when org is selected */
function RoleRedirectDashboard() {
  const { activeOrg } = useOrgStore()
  const navigate = useNavigate()
  const { setShell } = useContextStore()

  useEffect(() => {
    const current = activeOrg()
    if (!current) return

    const targetShell = ROLE_DEFAULT_SHELL[current.role]
    setShell(targetShell)
    navigate(SHELL_ROUTES[targetShell] || '/company', { replace: true })
  }, [])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  )
}
