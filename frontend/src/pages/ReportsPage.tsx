import { useState } from 'react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { useOrgStore } from '@/stores/orgStore'
import { getOrgKpi, getProjectKpi, exportOrgKpi, exportProjectKpi, listReportExports } from '@/api/reports'
import { getActivityPerTask } from '@/api/performance'
import { getSessionMetrics, getUserMetrics } from '@/api/metrics'
import { getAiScorecards } from '@/api/ai'

import {
  BarChart3,
  FolderKanban,
  Zap,
  Activity,
  FileDown,
  Brain,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react'

/* ─── Shared ─── */

function VisionInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none transition-colors"
      {...rest}
    />
  )
}

function VisionSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (val: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none transition-colors"
    >
      {children}
    </select>
  )
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <div className="mt-4 max-h-[500px] overflow-auto rounded-xl border border-white/10 bg-white/5 p-4">
      <pre className="whitespace-pre-wrap text-xs text-white/70">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

/* ─── Tab 1: KPI организации ─── */

function OrgKpiTab({ orgId }: { orgId: string }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamId, setTeamId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getOrgKpi(orgId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      await exportOrgKpi(orgId, {
        export_format: exportFormat,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
      })
      toast.success('Экспорт запущен')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка экспорта'
      toast.error(message)
    }
  }

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">KPI организации</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата начала</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата окончания</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">ID команды</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">ID проекта</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
        <div className="h-8 w-px bg-white/10" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
          <Download className="h-4 w-4" />
          Экспорт
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-white/40">Загрузка...</p>}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 2: KPI проектов ─── */

function ProjectKpiTab({ orgId }: { orgId: string }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getProjectKpi(orgId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      await exportProjectKpi(orgId, {
        export_format: exportFormat,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      toast.success('Экспорт запущен')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка экспорта'
      toast.error(message)
    }
  }

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">KPI проектов</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата начала</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата окончания</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
        <div className="h-8 w-px bg-white/10" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
          <Download className="h-4 w-4" />
          Экспорт
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-white/40">Загрузка...</p>}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 3: Продуктивность ─── */

function ProductivityTab({ orgId }: { orgId: string }) {
  const [userId, setUserId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getActivityPerTask(orgId, {
        user_id: userId || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Продуктивность</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">ID пользователя</label>
          <VisionInput placeholder="user_id" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">ID команды</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">ID проекта</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата начала</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Дата окончания</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <button onClick={handleLoad} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>
      {loading && <p className="mt-4 text-sm text-white/40">Загрузка...</p>}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 4: Метрики ─── */

function MetricsTab({ orgId }: { orgId: string }) {
  const [sessionId, setSessionId] = useState('')
  const [sessionData, setSessionData] = useState<unknown>(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  const [umUserId, setUmUserId] = useState('')
  const [umProjectId, setUmProjectId] = useState('')
  const [umStartDate, setUmStartDate] = useState('')
  const [umEndDate, setUmEndDate] = useState('')
  const [userData, setUserData] = useState<unknown>(null)
  const [userLoading, setUserLoading] = useState(false)

  async function handleSessionLoad() {
    if (!sessionId.trim()) {
      toast.error('Введите ID сессии')
      return
    }
    setSessionLoading(true)
    try {
      const res = await getSessionMetrics(orgId, sessionId)
      setSessionData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleUserLoad() {
    if (!umUserId.trim()) {
      toast.error('Введите ID пользователя')
      return
    }
    setUserLoading(true)
    try {
      const res = await getUserMetrics(orgId, umUserId, {
        start_date: umStartDate || undefined,
        end_date: umEndDate || undefined,
        project_id: umProjectId || undefined,
      })
      setUserData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setUserLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Метрики сессии</h3>
        <div className="flex flex-wrap items-end gap-3 mb-2">
          <div>
            <label className="block text-xs text-white/50 mb-1">ID сессии</label>
            <VisionInput placeholder="session_id" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </div>
          <button onClick={handleSessionLoad} disabled={sessionLoading} className="h-10 rounded-xl bg-[#0075FF] px-5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
            {sessionLoading ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
        {sessionLoading && <p className="text-sm text-white/40">Загрузка...</p>}
        {!sessionLoading && sessionData != null && <JsonBlock data={sessionData} />}
      </div>

      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Метрики пользователя</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">ID пользователя</label>
            <VisionInput placeholder="user_id" value={umUserId} onChange={(e) => setUmUserId(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">ID проекта</label>
            <VisionInput placeholder="project_id" value={umProjectId} onChange={(e) => setUmProjectId(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Дата начала</label>
            <VisionInput type="date" value={umStartDate} onChange={(e) => setUmStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Дата окончания</label>
            <VisionInput type="date" value={umEndDate} onChange={(e) => setUmEndDate(e.target.value)} />
          </div>
        </div>
        <button onClick={handleUserLoad} disabled={userLoading} className="flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
          {userLoading ? 'Загрузка...' : 'Загрузить'}
        </button>
        {userLoading && <p className="mt-4 text-sm text-white/40">Загрузка...</p>}
        {!userLoading && userData != null && <JsonBlock data={userData} />}
      </div>
    </div>
  )
}

/* ─── Tab 5: Экспорты ─── */

function ExportsTab({ orgId }: { orgId: string }) {
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    try {
      const res = await listReportExports(orgId)
      setData(res.data)
      setLoaded(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vision-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Экспорты</h3>
        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {loading && <p className="text-sm text-white/40">Загрузка...</p>}
      {!loading && loaded && (
        Array.isArray(data) && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Формат</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Статус</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Создано</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const row = item as Record<string, unknown>
                  return (
                    <tr key={String(row.id ?? idx)} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{String(row.id ?? '—')}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-xl bg-[#7551FF]/20 px-3 py-1 text-xs font-bold text-[#7551FF]">
                          {String(row.export_format ?? row.format ?? '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">{String(row.status ?? '—')}</td>
                      <td className="px-4 py-3 text-xs text-white/50">{String(row.created_at ?? '—')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-white/40">Нет экспортов</p>
        )
      )}
    </div>
  )
}

/* ─── Tab 6: AI Аналитика ─── */

function AiAnalyticsTab({ orgId }: { orgId: string }) {
  const [period, setPeriod] = useState('day')
  const [mode, setMode] = useState('employee')
  const [roleProfile, setRoleProfile] = useState('developer')
  const [asOf, setAsOf] = useState('')
  const [userId, setUserId] = useState('')
  const [data, setData] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getAiScorecards(orgId, {
        period,
        as_of: asOf || undefined,
        user_id: userId || undefined,
        mode: mode || undefined,
        role_profile: roleProfile || undefined,
      })
      setData(res.data as Record<string, unknown>[])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const scorecard = data && data.length > 0 ? data[0] : null
  const score = scorecard ? Number(scorecard.score ?? 0) : 0
  const baseline = scorecard ? Number(scorecard.baseline ?? 0) : 0
  const delta = baseline !== 0 ? ((score - baseline) / baseline) * 100 : 0
  const trend = (scorecard?.trend as Array<Record<string, unknown>> | undefined) ?? []
  const primaryDrivers = (scorecard?.primary_drivers as Array<Record<string, unknown>> | undefined) ?? []
  const interpretation = scorecard?.interpretation as Record<string, unknown> | undefined
  const userName = scorecard?.user_name ?? scorecard?.user_id ?? ''
  const periodStart = scorecard?.period_start ?? ''
  const periodEnd = scorecard?.period_end ?? ''

  return (
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">AI Аналитика</h3>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Период</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPeriod('day')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${period === 'day' ? 'bg-[#0075FF] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
              >
                День
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${period === 'week' ? 'bg-[#0075FF] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
              >
                Неделя
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Режим</label>
            <div className="flex gap-1">
              <button
                onClick={() => setMode('employee')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${mode === 'employee' ? 'bg-[#0075FF] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
              >
                Сотрудник
              </button>
              <button
                onClick={() => setMode('executive')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${mode === 'executive' ? 'bg-[#0075FF] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
              >
                Руководитель
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Роль</label>
            <VisionSelect value={roleProfile} onChange={setRoleProfile}>
              <option value="developer" className="bg-[#111C44]">Разработчик</option>
              <option value="manager" className="bg-[#111C44]">Менеджер</option>
              <option value="office" className="bg-[#111C44]">Офис</option>
            </VisionSelect>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Дата (as_of)</label>
            <VisionInput type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">ID пользователя</label>
            <VisionInput placeholder="user_id (опционально)" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
        </div>
        <button onClick={handleLoad} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50">
          <Brain className="h-4 w-4" />
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </div>

      {loading && <p className="text-sm text-white/40 px-6">Загрузка...</p>}

      {!loading && scorecard != null && (
        <>
          {/* Score Summary */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="vision-card p-6 text-center">
              <p className="text-xs text-white/40 uppercase mb-2">Текущий балл</p>
              <p className="text-4xl font-bold text-white">{score.toFixed(1)}</p>
              <p className="text-xs text-white/40 mt-1">{String(userName)}</p>
            </div>
            <div className="vision-card p-6 text-center">
              <p className="text-xs text-white/40 uppercase mb-2">Базовый</p>
              <p className="text-4xl font-bold text-white/70">{baseline.toFixed(1)}</p>
              <p className="text-xs text-white/40 mt-1">{String(periodStart)} — {String(periodEnd)}</p>
            </div>
            <div className="vision-card p-6 text-center">
              <p className="text-xs text-white/40 uppercase mb-2">Дельта</p>
              <div className="flex items-center justify-center gap-2">
                {delta >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-[#01B574]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[#E31A1A]" />
                )}
                <p className={`text-4xl font-bold ${delta >= 0 ? 'text-[#01B574]' : 'text-[#E31A1A]'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          {trend.length > 0 && (
            <div className="vision-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">Тренд</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="period_start" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111C44', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} />
                    <Line type="monotone" dataKey="score" stroke="#0075FF" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Drivers */}
          {primaryDrivers.length > 0 && (
            <div className="vision-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">Ключевые факторы</h4>
              <div className="space-y-2">
                {primaryDrivers.map((driver, idx) => {
                  const impact = Number(driver.impact ?? 0)
                  return (
                    <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                      <span className={`rounded-lg px-3 py-1 text-xs font-bold ${impact >= 0 ? 'bg-[#01B574]/20 text-[#01B574]' : 'bg-[#E31A1A]/20 text-[#E31A1A]'}`}>
                        {impact >= 0 ? '+' : ''}{impact.toFixed(1)}%
                      </span>
                      <span className="text-sm text-white">{String(driver.name ?? driver.label ?? driver.factor ?? '—')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Interpretation */}
          {interpretation != null && (
            <div className="vision-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">Интерпретация</h4>
              <div className="space-y-3">
                {Object.entries(interpretation).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-white/5 px-4 py-3">
                    <p className="text-sm font-bold text-white mb-1">{key}</p>
                    <p className="text-sm text-white/60">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && data != null && data.length === 0 && (
        <p className="text-sm text-white/40">Нет данных</p>
      )}
    </div>
  )
}

/* ─── Tab Config ─── */

const reportTabs = [
  { id: 0, label: 'KPI организации', icon: BarChart3 },
  { id: 1, label: 'KPI проектов', icon: FolderKanban },
  { id: 2, label: 'Продуктивность', icon: Zap },
  { id: 3, label: 'Метрики', icon: Activity },
  { id: 4, label: 'Экспорты', icon: FileDown },
  { id: 5, label: 'AI Аналитика', icon: Brain },
]

/* ─── Main ReportsPage ─── */

export default function ReportsPage() {
  const orgId = useOrgStore((s) => s.orgId)
  const [activeTab, setActiveTab] = useState(0)

  if (!orgId) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-white/40">Присоединитесь к организации</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Отчёты</h1>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#0075FF] text-white shadow-[0_0_15px_rgba(0,117,255,0.3)]'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 0 && <OrgKpiTab orgId={orgId} />}
      {activeTab === 1 && <ProjectKpiTab orgId={orgId} />}
      {activeTab === 2 && <ProductivityTab orgId={orgId} />}
      {activeTab === 3 && <MetricsTab orgId={orgId} />}
      {activeTab === 4 && <ExportsTab orgId={orgId} />}
      {activeTab === 5 && <AiAnalyticsTab orgId={orgId} />}
    </div>
  )
}
