import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
import {
  Users, UserCheck, UserMinus, PenTool, Calendar,
  ClipboardList, FileText, ArrowRight, Search,
  Loader2, Building2, Inbox, Clock, Plus, ChevronRight,
  ChevronDown, Mail, Phone, Briefcase, CheckCircle2,
  XCircle, AlertCircle, MoreHorizontal, Download,
  Eye, Filter,
} from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { useUsers } from '@/hooks/useAdmin'
import { ROLE_LABELS } from '@/types'
import type { OrgRole } from '@/types'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState, LoadingSkeleton } from '@/components/shared/LoadingState'
import { StatusBadge } from '@/components/shared/StatusBadge'

type HRTab = 'overview' | 'onboarding' | 'offboarding' | 'documents' | 'leave'

// Resolve initial tab from URL
function resolveTab(pathname: string): HRTab {
  if (pathname.includes('/onboarding')) return 'onboarding'
  if (pathname.includes('/offboarding')) return 'offboarding'
  if (pathname.includes('/signatures')) return 'documents'
  if (pathname.includes('/leave')) return 'leave'
  return 'overview'
}

export default function HRWorkspacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { activeOrgId } = useOrgStore()
  const { data: users, isLoading } = useUsers(activeOrgId ?? '')
  const [activeTab, setActiveTab] = useState<HRTab>(() => resolveTab(location.pathname))

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('company.noOrgSelected')}</h2>
      </div>
    )
  }

  const handleTabChange = (tab: HRTab) => {
    setActiveTab(tab)
    const routes: Record<HRTab, string> = {
      overview: '/company/hr',
      onboarding: '/company/hr/onboarding',
      offboarding: '/company/hr/offboarding',
      documents: '/company/hr/signatures',
      leave: '/company/hr/leave',
    }
    navigate(routes[tab], { replace: true })
  }

  const tabs: { id: HRTab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: t('hr.overview', 'Обзор'), icon: ClipboardList },
    { id: 'onboarding', label: t('nav.onboarding'), icon: UserCheck },
    { id: 'offboarding', label: t('nav.offboarding'), icon: UserMinus },
    { id: 'documents', label: t('hr.documents', 'Документы'), icon: FileText },
    { id: 'leave', label: t('nav.leaveAbsence'), icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('nav.hrWorkspace')}</h1>
        <p className="text-sm text-muted-foreground">{t('hr.subtitle', 'Кадровый центр компании')}</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <HROverview users={users ?? []} isLoading={isLoading} />}
      {activeTab === 'onboarding' && <OnboardingSection users={users ?? []} />}
      {activeTab === 'offboarding' && <OffboardingSection users={users ?? []} />}
      {activeTab === 'documents' && <DocumentsSection />}
      {activeTab === 'leave' && <LeaveSection users={users ?? []} />}
    </div>
  )
}

/* ─── Overview ─── */
function HROverview({ users, isLoading }: { users: any[]; isLoading: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const stats = [
    { label: t('hr.totalEmployees', 'Всего сотрудников'), value: users.length, icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: t('hr.pendingOnboarding', 'На оформлении'), value: 0, icon: UserCheck, color: 'text-blue-500 bg-blue-500/10' },
    { label: t('hr.pendingOffboarding', 'На увольнении'), value: 0, icon: UserMinus, color: 'text-red-500 bg-red-500/10' },
    { label: t('hr.pendingDocuments', 'Документы на подпись'), value: 0, icon: PenTool, color: 'text-amber-500 bg-amber-500/10' },
  ]

  const quickActions = [
    { label: t('hr.startOnboarding', 'Начать оформление'), icon: UserCheck, onClick: () => navigate('/company/hr/onboarding') },
    { label: t('hr.startOffboarding', 'Начать увольнение'), icon: UserMinus, onClick: () => navigate('/company/hr/offboarding') },
    { label: t('hr.manageDocuments', 'Документы'), icon: FileText, onClick: () => navigate('/company/hr/signatures') },
    { label: t('hr.manageSchedule', 'Отпуска'), icon: Calendar, onClick: () => navigate('/company/hr/leave') },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <a.icon className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{a.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Employee directory */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-foreground">{t('hr.recentEmployees', 'Сотрудники')}</h3>
          <button
            onClick={() => navigate('/company/people')}
            className="text-xs text-primary font-medium hover:underline"
          >
            Все сотрудники
          </button>
        </div>
        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="Нет сотрудников" description="Добавьте первого сотрудника для начала работы" />
        ) : (
          <div className="space-y-1.5">
            {users.slice(0, 8).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(user.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.position && (
                    <span className="hidden sm:inline text-xs text-muted-foreground">{user.position}</span>
                  )}
                  <StatusBadge variant="success">
                    {ROLE_LABELS[(user.org_role || 'member') as OrgRole] || user.org_role}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Onboarding ─── */
interface OnboardingProcess {
  id: string
  employeeName: string
  email: string
  position: string
  startDate: string
  status: 'in_progress' | 'completed' | 'blocked'
  steps: { label: string; done: boolean }[]
  mentor?: string
}

const DEMO_ONBOARDING: OnboardingProcess[] = [
  {
    id: '1',
    employeeName: 'Иванов Алексей Сергеевич',
    email: 'ivanov@company.ru',
    position: 'Frontend Developer',
    startDate: '2026-03-28',
    status: 'in_progress',
    mentor: 'Петрова М.А.',
    steps: [
      { label: 'Подготовить трудовой договор', done: true },
      { label: 'Создать приказ о приёме', done: true },
      { label: 'Собрать документы сотрудника', done: false },
      { label: 'Выдать доступы к системам', done: false },
      { label: 'Назначить наставника', done: true },
      { label: 'Установить расписание', done: false },
    ],
  },
  {
    id: '2',
    employeeName: 'Козлова Мария Павловна',
    email: 'kozlova@company.ru',
    position: 'UI/UX Designer',
    startDate: '2026-04-01',
    status: 'in_progress',
    steps: [
      { label: 'Подготовить трудовой договор', done: true },
      { label: 'Создать приказ о приёме', done: false },
      { label: 'Собрать документы сотрудника', done: false },
      { label: 'Выдать доступы к системам', done: false },
      { label: 'Назначить наставника', done: false },
      { label: 'Установить расписание', done: false },
    ],
  },
]

function OnboardingSection({ users }: { users: any[] }) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-foreground">{t('hr.onboardingTitle', 'Оформление сотрудников')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('hr.onboardingDesc', 'Оформление новых сотрудников: трудовой договор, приказ, ознакомление с документами')}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Новый приём
        </button>
      </div>

      {/* New onboarding form */}
      {showNewForm && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4">Оформление нового сотрудника</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">ФИО</label>
              <input type="text" placeholder="Фамилия Имя Отчество" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input type="email" placeholder="email@company.ru" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Должность</label>
              <input type="text" placeholder="Название должности" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата выхода</label>
              <input type="date" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Наставник</label>
              <select className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="">Не назначен</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="h-9 rounded-lg bg-emerald-500 px-6 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                Начать оформление
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active onboarding processes */}
      {DEMO_ONBOARDING.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={t('hr.noActiveOnboarding', 'Нет активных процессов оформления')}
          description="Нажмите «Новый приём» чтобы начать оформление сотрудника"
        />
      ) : (
        <div className="space-y-3">
          {DEMO_ONBOARDING.map((proc) => {
            const completedSteps = proc.steps.filter((s) => s.done).length
            const progress = Math.round((completedSteps / proc.steps.length) * 100)
            const isExpanded = expandedId === proc.id

            return (
              <div key={proc.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : proc.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 shrink-0">
                    {proc.employeeName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{proc.employeeName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{proc.position}</span>
                      <span>Выход: {new Date(proc.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{progress}%</p>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <StatusBadge variant={progress === 100 ? 'success' : 'warning'}>
                      {completedSteps}/{proc.steps.length}
                    </StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{proc.email}</span>
                      {proc.mentor && <span className="flex items-center gap-1"><Users className="h-3 w-3" />Наставник: {proc.mentor}</span>}
                    </div>
                    <div className="space-y-2">
                      {proc.steps.map((step, i) => (
                        <label key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer">
                          <input type="checkbox" defaultChecked={step.done} className="rounded border-border accent-emerald-500" />
                          <span className={`text-sm ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{step.label}</span>
                        </label>
                      ))}
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

/* ─── Offboarding ─── */
interface OffboardingProcess {
  id: string
  employeeName: string
  position: string
  lastDay: string
  reason: string
  status: 'in_progress' | 'completed'
  steps: { label: string; done: boolean }[]
}

const DEMO_OFFBOARDING: OffboardingProcess[] = [
  {
    id: '1',
    employeeName: 'Сидоров Павел Константинович',
    position: 'Backend Developer',
    lastDay: '2026-04-10',
    reason: 'По собственному желанию',
    status: 'in_progress',
    steps: [
      { label: 'Создать приказ об увольнении', done: true },
      { label: 'Подготовить расчёт', done: false },
      { label: 'Передача дел', done: false },
      { label: 'Закрыть доступы', done: false },
      { label: 'Возврат оборудования', done: false },
      { label: 'Провести exit-интервью', done: false },
    ],
  },
]

function OffboardingSection({ users }: { users: any[] }) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserMinus className="h-5 w-5 text-red-500" />
            <h3 className="text-[15px] font-semibold text-foreground">{t('hr.offboardingTitle', 'Увольнение сотрудников')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('hr.offboardingDesc', 'Процесс увольнения: приказ, расчёт, передача дел, закрытие доступов')}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Начать увольнение
        </button>
      </div>

      {showNewForm && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4">Оформление увольнения</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Сотрудник</label>
              <select className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="">Выберите сотрудника</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Последний рабочий день</label>
              <input type="date" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Причина</label>
              <select className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="own">По собственному желанию</option>
                <option value="agreement">По соглашению сторон</option>
                <option value="employer">По инициативе работодателя</option>
                <option value="contract_end">Окончание срока договора</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="h-9 rounded-lg bg-red-500 px-6 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                Начать оформление
              </button>
            </div>
          </div>
        </div>
      )}

      {DEMO_OFFBOARDING.length === 0 ? (
        <EmptyState
          icon={UserMinus}
          title={t('hr.noActiveOffboarding', 'Нет активных процессов увольнения')}
          description="Нажмите «Начать увольнение» чтобы оформить увольнение"
        />
      ) : (
        <div className="space-y-3">
          {DEMO_OFFBOARDING.map((proc) => {
            const completedSteps = proc.steps.filter((s) => s.done).length
            const progress = Math.round((completedSteps / proc.steps.length) * 100)
            const isExpanded = expandedId === proc.id

            return (
              <div key={proc.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : proc.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-600 shrink-0">
                    {proc.employeeName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{proc.employeeName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{proc.position}</span>
                      <span>Последний день: {new Date(proc.lastDay).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <StatusBadge variant="warning">{proc.reason}</StatusBadge>
                    <StatusBadge variant={progress === 100 ? 'success' : 'error'}>
                      {completedSteps}/{proc.steps.length}
                    </StatusBadge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20">
                    <div className="space-y-2">
                      {proc.steps.map((step, i) => (
                        <label key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer">
                          <input type="checkbox" defaultChecked={step.done} className="rounded border-border accent-red-500" />
                          <span className={`text-sm ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{step.label}</span>
                        </label>
                      ))}
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

/* ─── Documents & Signatures ─── */
interface HRDocument {
  id: string
  name: string
  type: 'contract' | 'order' | 'agreement' | 'certificate'
  employee: string
  status: 'draft' | 'awaiting_signature' | 'signed' | 'rejected'
  createdAt: string
  signedAt?: string
}

const DOC_TYPE_LABELS: Record<string, string> = {
  contract: 'Трудовой договор',
  order: 'Приказ',
  agreement: 'Соглашение',
  certificate: 'Справка',
}

const DEMO_DOCUMENTS: HRDocument[] = [
  { id: '1', name: 'Трудовой договор №127', type: 'contract', employee: 'Иванов А.С.', status: 'awaiting_signature', createdAt: '2026-03-25' },
  { id: '2', name: 'Приказ о приёме №89', type: 'order', employee: 'Иванов А.С.', status: 'draft', createdAt: '2026-03-25' },
  { id: '3', name: 'Приказ об увольнении №12', type: 'order', employee: 'Сидоров П.К.', status: 'awaiting_signature', createdAt: '2026-03-24' },
  { id: '4', name: 'Доп. соглашение №45', type: 'agreement', employee: 'Петрова М.А.', status: 'signed', createdAt: '2026-03-20', signedAt: '2026-03-22' },
  { id: '5', name: 'Справка о доходах', type: 'certificate', employee: 'Козлов И.Р.', status: 'signed', createdAt: '2026-03-18', signedAt: '2026-03-19' },
]

const docStatusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'default' }> = {
  draft: { label: 'Черновик', variant: 'default' },
  awaiting_signature: { label: 'На подписи', variant: 'warning' },
  signed: { label: 'Подписан', variant: 'success' },
  rejected: { label: 'Отклонён', variant: 'error' },
}

function DocumentsSection() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = DEMO_DOCUMENTS.filter((doc) => {
    if (filter !== 'all' && doc.status !== filter) return false
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) && !doc.employee.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const awaiting = DEMO_DOCUMENTS.filter((d) => d.status === 'awaiting_signature').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <PenTool className="h-5 w-5 text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-foreground">{t('hr.documentsTitle', 'Кадровые документы и ЭЦП')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('hr.documentsDesc', 'Управление кадровыми документами, электронная подпись, статус согласования')}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
          <Plus className="h-4 w-4" />
          Создать документ
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Всего', count: DEMO_DOCUMENTS.length, icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'На подписи', count: awaiting, icon: PenTool, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Подписано', count: DEMO_DOCUMENTS.filter((d) => d.status === 'signed').length, icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Черновики', count: DEMO_DOCUMENTS.filter((d) => d.status === 'draft').length, icon: FileText, color: 'text-muted-foreground bg-muted' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-3.5 w-3.5 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
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
            placeholder="Поиск документов..."
            className="w-full h-9 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Все' },
            { key: 'awaiting_signature', label: 'На подписи' },
            { key: 'draft', label: 'Черновики' },
            { key: 'signed', label: 'Подписано' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title={t('hr.noDocuments', 'Нет документов')} description="Документы появятся здесь после создания" />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Документ</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Тип</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Сотрудник</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Дата</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const sc = docStatusConfig[doc.status]
                return (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{DOC_TYPE_LABELS[doc.type]}</td>
                    <td className="px-4 py-3 text-foreground hidden md:table-cell">{doc.employee}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Просмотр">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Скачать">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        {doc.status === 'awaiting_signature' && (
                          <button className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">
                            Подписать
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Leave & Absence ─── */
interface LeaveRequest {
  id: string
  employee: string
  type: 'vacation' | 'sick' | 'personal' | 'maternity'
  startDate: string
  endDate: string
  days: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

const LEAVE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  vacation: { label: 'Отпуск', color: 'text-blue-500 bg-blue-500/10' },
  sick: { label: 'Больничный', color: 'text-orange-500 bg-orange-500/10' },
  personal: { label: 'Личный', color: 'text-violet-500 bg-violet-500/10' },
  maternity: { label: 'Декрет', color: 'text-pink-500 bg-pink-500/10' },
}

const DEMO_LEAVE: LeaveRequest[] = [
  { id: '1', employee: 'Петрова М.А.', type: 'vacation', startDate: '2026-04-01', endDate: '2026-04-14', days: 14, status: 'pending' },
  { id: '2', employee: 'Козлов И.Р.', type: 'sick', startDate: '2026-03-24', endDate: '2026-03-28', days: 5, status: 'approved', reason: 'ОРВИ' },
  { id: '3', employee: 'Волков А.П.', type: 'vacation', startDate: '2026-04-10', endDate: '2026-04-20', days: 10, status: 'pending' },
  { id: '4', employee: 'Смирнова Е.В.', type: 'personal', startDate: '2026-03-26', endDate: '2026-03-26', days: 1, status: 'rejected', reason: 'Семейные обстоятельства' },
]

function LeaveSection({ users }: { users: any[] }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<string>('all')

  const filtered = DEMO_LEAVE.filter((req) => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const onVacation = DEMO_LEAVE.filter((r) => r.type === 'vacation' && r.status === 'approved').length
  const onSick = DEMO_LEAVE.filter((r) => r.type === 'sick' && r.status === 'approved').length
  const pending = DEMO_LEAVE.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-foreground">{t('hr.leaveTitle', 'Отпуска и больничные')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('hr.leaveDesc', 'Управление отпусками, больничными листами и нетрудоспособностью')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t('hr.leaveType.vacation', 'В отпуске'), count: onVacation, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
          { label: t('hr.leaveType.sick', 'На больничном'), count: onSick, icon: Clock, color: 'text-orange-500 bg-orange-500/10' },
          { label: t('hr.leaveType.pending', 'Ожидают одобрения'), count: pending, icon: ClipboardList, color: 'text-amber-500 bg-amber-500/10' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color.split(' ')[1]}`}>
                <item.icon className={`h-4 w-4 ${item.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {[
          { key: 'all', label: 'Все' },
          { key: 'pending', label: 'Ожидают' },
          { key: 'approved', label: 'Одобрено' },
          { key: 'rejected', label: 'Отклонено' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title={t('hr.noLeaveRequests', 'Нет запросов на отпуск')} />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сотрудник</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тип</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Период</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Дней</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const lt = LEAVE_TYPE_LABELS[req.type]
                return (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{req.employee}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${lt.color}`}>
                        {lt.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(req.startDate).toLocaleDateString('ru-RU')} — {new Date(req.endDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden md:table-cell">{req.days}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'}>
                        {req.status === 'approved' ? 'Одобрено' : req.status === 'rejected' ? 'Отклонено' : 'Ожидает'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">
                            Одобрить
                          </button>
                          <button className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors">
                            Отклонить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
