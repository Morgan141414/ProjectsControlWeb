import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Task, Project } from '@/types'
import { getGreeting } from '@/lib/greeting'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { createOrg, joinOrg, getOrg } from '@/api/orgs'
import { listTodayTasks } from '@/api/tasks'
import { listProjects } from '@/api/projects'
import { createDailyReport } from '@/api/dailyReports'
import {
  Wallet,
  Globe,
  FileText,
  ShoppingCart,
  CheckSquare,
  MoreHorizontal,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Stat Cards (top row)                                               */
/* ------------------------------------------------------------------ */
function StatCards() {
  const stats = [
    {
      label: 'Бюджет за день',
      value: '$53,000',
      change: '+55%',
      positive: true,
      icon: Wallet,
      iconBg: 'linear-gradient(135deg, #0075FF 0%, #00D1FF 100%)',
    },
    {
      label: 'Пользователи сегодня',
      value: '2,300',
      change: '+5%',
      positive: true,
      icon: Globe,
      iconBg: 'linear-gradient(135deg, #0075FF 0%, #00D1FF 100%)',
    },
    {
      label: 'Новые клиенты',
      value: '+3,052',
      change: '-14%',
      positive: false,
      icon: FileText,
      iconBg: 'linear-gradient(135deg, #0075FF 0%, #00D1FF 100%)',
    },
    {
      label: 'Общие продажи',
      value: '$173,000',
      change: '+8%',
      positive: true,
      icon: ShoppingCart,
      iconBg: 'linear-gradient(135deg, #0075FF 0%, #00D1FF 100%)',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="vision-card flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-white/50">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">{s.value}</span>
              <span
                className={`text-xs font-bold ${s.positive ? 'text-[#01B574]' : 'text-[#E31A1A]'}`}
              >
                {s.change}
              </span>
            </div>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: s.iconBg }}
          >
            <s.icon className="h-5 w-5 text-white" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Welcome Card                                                       */
/* ------------------------------------------------------------------ */
function WelcomeCard() {
  const fullName = useAuthStore((s) => s.fullName)

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-6"
      style={{
        background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 50%, #C851FF 100%)',
        minHeight: '200px',
      }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
        }}
      />
      <p className="text-xs text-white/70 uppercase tracking-wider">С возвращением,</p>
      <h2 className="mt-1 text-2xl font-bold text-white">
        {fullName ?? 'Пользователь'}
      </h2>
      <p className="mt-2 text-sm text-white/80">
        {getGreeting()}! Рады видеть вас снова.
      </p>
      <p className="mt-1 text-sm text-white/60">Хорошего рабочего дня!</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Satisfaction Rate (gauge)                                          */
/* ------------------------------------------------------------------ */
function SatisfactionRate() {
  return (
    <div className="vision-card flex flex-col items-center justify-center p-6">
      <p className="text-xs text-white/50 mb-4">Уровень удовлетворённости</p>
      <p className="text-xs text-white/50 mb-2">По всем проектам</p>
      {/* Simple gauge */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#01B574"
            strokeWidth="10"
            strokeDasharray={`${0.95 * 314} 314`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <CheckSquare className="h-5 w-5 text-white mb-1" />
          <span className="text-2xl font-bold text-white">95%</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-white/50">На основе отзывов</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Referral Tracking                                                  */
/* ------------------------------------------------------------------ */
function ReferralTracking() {
  return (
    <div className="vision-card p-6">
      <p className="text-xs text-white/50 mb-1">Реферальная статистика</p>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-3xl font-bold text-white">145</p>
          <p className="text-xs text-white/50">человек</p>
        </div>
      </div>
      {/* Simple gauge */}
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#01B574"
            strokeWidth="10"
            strokeDasharray={`${0.93 * 314} 314`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-white">9.3</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 p-2 text-center">
          <p className="text-white/50">Общий балл</p>
          <p className="font-bold text-white">1,465</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2 text-center">
          <p className="text-white/50">Приглашено</p>
          <p className="font-bold text-white">1,465</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Check Table                                                        */
/* ------------------------------------------------------------------ */
function CheckTable() {
  const rows = [
    { name: 'Venus PRO', progress: 10.5, quantity: 1465, date: '12.Jun.2021', checked: true },
    { name: 'Uranus Kit', progress: 25.5, quantity: 1024, date: '5.Jun.2021', checked: true },
    { name: 'Venus DS', progress: 31.5, quantity: 858, date: '19.Mar.2021', checked: true },
    { name: 'Venus 3D Asset', progress: 12.2, quantity: 166, date: '17.Dec.2021', checked: false },
    { name: 'Venus 3D Asset', progress: 12.2, quantity: 166, date: '17.Dec.2021', checked: false },
    { name: 'Venus 3D Asset', progress: 12.5, quantity: 166, date: '17.Dec.2021', checked: false },
  ]

  return (
    <div className="vision-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Таблица проверки</h3>
        <button className="text-white/50 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-3 py-3 text-xs font-medium text-white/40 uppercase">Название</th>
              <th className="px-3 py-3 text-xs font-medium text-white/40 uppercase">Прогресс</th>
              <th className="px-3 py-3 text-xs font-medium text-white/40 uppercase">Кол-во</th>
              <th className="px-3 py-3 text-xs font-medium text-white/40 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.checked}
                      readOnly
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#0075FF] accent-[#0075FF]"
                    />
                    <span className="text-white">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-white/70">{row.progress}%</td>
                <td className="px-3 py-3 text-white/70">{row.quantity.toLocaleString()}</td>
                <td className="px-3 py-3 text-white/70">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Active Users chart                                                 */
/* ------------------------------------------------------------------ */
function ActiveUsersChart() {
  const data = [
    { name: 'Jan', value: 200 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 180 },
    { name: 'Apr', value: 450 },
    { name: 'May', value: 350 },
    { name: 'Jun', value: 500 },
    { name: 'Jul', value: 280 },
    { name: 'Aug', value: 420 },
    { name: 'Sep', value: 380 },
  ]

  const activeStats = [
    { label: 'Пользователи', value: '32,984', icon: Wallet, color: '#0075FF' },
    { label: 'Клики', value: '2,42m', icon: Globe, color: '#0075FF' },
    { label: 'Продажи', value: '2,400$', icon: ShoppingCart, color: '#0075FF' },
    { label: 'Объекты', value: '320', icon: FileText, color: '#0075FF' },
  ]

  return (
    <div className="vision-card p-6">
      <h3 className="text-xs text-white/50 uppercase mb-1">Активные пользователи</h3>
      <p className="text-xs text-white/40 mb-4">
        (<span className="text-[#01B574]">+23%</span>) по сравнению с прошлой неделей
      </p>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#111C44', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }}
            />
            <Bar dataKey="value" fill="#0075FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {activeStats.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0075FF]">
              <s.icon className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Org Section (existing functionality)                                */
/* ------------------------------------------------------------------ */
function OrgSection() {
  const { orgId, orgName, setOrg } = useOrgStore()
  const [newOrgName, setNewOrgName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [orgCode, setOrgCode] = useState<string | null>(null)

  useEffect(() => {
    if (orgId) {
      getOrg(orgId)
        .then(({ data }) => setOrgCode(data.code))
        .catch(() => {})
    }
  }, [orgId])

  async function handleCreate() {
    if (!newOrgName.trim()) return
    setLoading(true)
    try {
      const { data: org } = await createOrg(newOrgName.trim())
      setOrg(org.id, org.name)
      toast.success('Organization created')
    } catch {
      toast.error('Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      await joinOrg(joinCode.trim())
      toast.success('Join request sent')
      setJoinCode('')
    } catch {
      toast.error('Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  if (orgId) {
    return (
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-2">Организация</h3>
        <p className="text-sm text-white/70">{orgName}</p>
        {orgCode && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-white/40">Код:</span>
            <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-white">{orgCode}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Организация</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Создать организацию</label>
          <div className="flex gap-2">
            <input
              placeholder="Название"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={loading}
              className="rounded-xl bg-[#0075FF] px-4 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50"
            >
              Создать
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Присоединиться к организации</label>
          <div className="flex gap-2">
            <input
              placeholder="Код организации"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
            />
            <button
              onClick={handleJoin}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              Вступить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Today's Tasks                                                      */
/* ------------------------------------------------------------------ */
function TodayTasks() {
  const orgId = useOrgStore((s) => s.orgId)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    listTodayTasks(orgId)
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [orgId])

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Задачи на сегодня</h3>
      {!orgId ? (
        <p className="text-sm text-white/40">Сначала присоединитесь к организации</p>
      ) : loading ? (
        <p className="text-sm text-white/40">Загрузка...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-white/40">Нет задач на сегодня</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <span className="text-sm text-white">{t.title}</span>
              <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white/60">{t.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Daily Report                                                       */
/* ------------------------------------------------------------------ */
function DailyReport() {
  const orgId = useOrgStore((s) => s.orgId)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!orgId) return
    listProjects(orgId)
      .then(({ data }) => setProjects(data))
      .catch(() => {})
  }, [orgId])

  async function handleSubmit() {
    if (!orgId || !selectedProject || !content.trim()) return
    setSending(true)
    try {
      await createDailyReport(orgId, {
        project_id: selectedProject,
        content: content.trim(),
      })
      toast.success('Report sent')
      setContent('')
    } catch {
      toast.error('Failed to send report')
    } finally {
      setSending(false)
    }
  }

  if (!orgId) return null

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Дневной отчёт</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Проект</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none"
          >
            <option value="" className="bg-[#111C44]">Выберите проект</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111C44]">{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Содержание</label>
          <textarea
            rows={3}
            placeholder="Что было сделано сегодня..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={sending || !selectedProject}
          className="w-full h-10 rounded-xl bg-[#0075FF] text-sm font-bold text-white uppercase hover:bg-[#0063D6] disabled:opacity-50"
        >
          {sending ? 'Отправка...' : 'Отправить отчёт'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Layout                                              */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <StatCards />

      {/* Row 2: Welcome + Satisfaction + Referral */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <WelcomeCard />
        <SatisfactionRate />
        <ReferralTracking />
      </div>

      {/* Row 3: Check Table + Active Users */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CheckTable />
        </div>
        <div className="xl:col-span-2">
          <ActiveUsersChart />
        </div>
      </div>

      {/* Row 4: Org + Tasks + Report */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <OrgSection />
        <TodayTasks />
        <DailyReport />
      </div>
    </div>
  )
}
