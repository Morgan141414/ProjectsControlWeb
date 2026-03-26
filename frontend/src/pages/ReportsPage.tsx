import { useState } from 'react'
<<<<<<< HEAD
import { useTranslation } from 'react-i18next'
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
import { getAiScorecards } from '@/api/ai'
import { PageHeader } from '@/components/shared/PageHeader'
=======
import { getActivityPerTask } from '@/api/performance'
import { getSessionMetrics, getUserMetrics } from '@/api/metrics'
import { getAiScorecards } from '@/api/ai'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

import {
  BarChart3,
  FolderKanban,
<<<<<<< HEAD
=======
  Zap,
  Activity,
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  FileDown,
  Brain,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  Target,
  ArrowUpRight,
<<<<<<< HEAD
  Building2,
} from 'lucide-react'

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'
const selectClass = 'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none'
const btnPrimary = 'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
const btnSecondary = 'flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50'

function JsonBlock({ data }: { data: unknown }) {
  return (
    <div className="mt-4 max-h-[500px] overflow-auto rounded-lg border border-border bg-muted p-4">
      <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
=======
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
      className="vision-input w-full h-10 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
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
      className="vision-input h-10 px-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <div className="mt-4 max-h-[500px] overflow-auto rounded-2xl bg-[#060B26]/80 border border-white/[0.06] p-5">
      <pre className="whitespace-pre-wrap text-xs text-white/60 font-mono leading-relaxed">
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

function LoadingSpinner() {
<<<<<<< HEAD
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="ml-2 text-sm text-muted-foreground">{t('common.loading')}</span>
=======
  return (
    <div className="flex items-center gap-2 py-8 justify-center">
      <div className="h-4 w-4 rounded-full border-2 border-[#0075FF]/30 border-t-[#0075FF] animate-spin" />
      <p className="text-sm text-white/30">{'\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    </div>
  )
}

<<<<<<< HEAD
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold text-foreground">
          {entry.dataKey}: <span className="text-primary">{entry.value}</span>
=======
/* Custom glassmorphism tooltip for charts */
function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1437]/95 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-bold text-white">
          {entry.dataKey}: <span className="text-[#0075FF]">{entry.value}</span>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </p>
      ))}
    </div>
  )
}

/* ─── Tab 1: KPI организации ─── */

function OrgKpiTab({ orgId }: { orgId: string }) {
<<<<<<< HEAD
  const { t } = useTranslation()
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
      const message = err instanceof Error ? err.message : t('reports.loadError')
=======
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
      toast.success(t('reports.exportSuccess'))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.exportError')
=======
      toast.success('\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0437\u0430\u043F\u0443\u0449\u0435\u043D')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      toast.error(message)
    }
  }

  return (
<<<<<<< HEAD
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{t('reports.orgKpi')}</h3>
          <p className="text-xs text-muted-foreground">{t('reports.orgKpiDescription')}</p>
=======
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0075FF] to-[#2563EB] shadow-[0_0_20px_rgba(0,117,255,0.3)]">
          <BarChart3 className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">KPI {'\u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438'}</h3>
          <p className="text-xs text-white/30">{'\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438 \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <div>
<<<<<<< HEAD
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.from')}</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.to')}</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.teamId')}</label>
          <input placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.projectId')}</label>
          <input placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className={btnPrimary}>
          {loading ? t('common.loading') : t('reports.load')}
        </button>
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className={selectClass}>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <button onClick={handleExport} className={btnSecondary}>
          <Download className="h-4 w-4" />
          {t('reports.export')}
        </button>
      </div>
=======
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430'}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F'}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043A\u043E\u043C\u0430\u043D\u0434\u044B'}</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u0440\u043E\u0435\u043A\u0442\u0430'}</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {loading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
        </button>
        <div className="h-8 w-px bg-white/[0.06]" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-white/50 hover:bg-white/[0.08] hover:text-white transition-all">
          <Download className="h-4 w-4" />
          {'\u042D\u043A\u0441\u043F\u043E\u0440\u0442'}
        </button>
      </div>

>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      {loading && <LoadingSpinner />}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 2: KPI проектов ─── */

function ProjectKpiTab({ orgId }: { orgId: string }) {
<<<<<<< HEAD
  const { t } = useTranslation()
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
<<<<<<< HEAD
      const res = await getProjectKpi(orgId, { start_date: startDate || undefined, end_date: endDate || undefined })
      setData(res.data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('reports.loadError'))
=======
      const res = await getProjectKpi(orgId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
<<<<<<< HEAD
      await exportProjectKpi(orgId, { export_format: exportFormat, start_date: startDate || undefined, end_date: endDate || undefined })
      toast.success(t('reports.exportSuccess'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('reports.exportError'))
=======
      await exportProjectKpi(orgId, {
        export_format: exportFormat,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      toast.success('\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0437\u0430\u043F\u0443\u0449\u0435\u043D')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430'
      toast.error(message)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    }
  }

  return (
<<<<<<< HEAD
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <FolderKanban className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{t('reports.projectKpi')}</h3>
          <p className="text-xs text-muted-foreground">{t('reports.projectKpiDescription')}</p>
=======
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7551FF] to-[#9B7BFF] shadow-[0_0_20px_rgba(117,81,255,0.3)]">
          <FolderKanban className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">KPI {'\u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432'}</h3>
          <p className="text-xs text-white/30">{'\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438 \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
        <div>
<<<<<<< HEAD
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.from')}</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.to')}</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className={btnPrimary}>{loading ? t('common.loading') : t('reports.load')}</button>
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className={selectClass}>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <button onClick={handleExport} className={btnSecondary}>
          <Download className="h-4 w-4" />{t('reports.export')}
        </button>
      </div>
=======
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430'}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F'}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {loading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
        </button>
        <div className="h-8 w-px bg-white/[0.06]" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-white/50 hover:bg-white/[0.08] hover:text-white transition-all">
          <Download className="h-4 w-4" />
          {'\u042D\u043A\u0441\u043F\u043E\u0440\u0442'}
        </button>
      </div>

>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      {loading && <LoadingSpinner />}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

<<<<<<< HEAD
/* ─── Tab 3: Экспорты ─── */

function ExportsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
=======
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
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB547] to-[#FF9900] shadow-[0_0_20px_rgba(255,181,71,0.3)]">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{'\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C'}</h3>
          <p className="text-xs text-white/30">{'\u0410\u043D\u0430\u043B\u0438\u0437 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u043F\u043E \u0437\u0430\u0434\u0430\u0447\u0430\u043C'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F'}</label>
          <VisionInput placeholder="user_id" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043A\u043E\u043C\u0430\u043D\u0434\u044B'}</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u0440\u043E\u0435\u043A\u0442\u0430'}</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430'}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F'}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
        {loading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
      </button>
      {loading && <LoadingSpinner />}
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
      toast.error('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 ID \u0441\u0435\u0441\u0441\u0438\u0438')
      return
    }
    setSessionLoading(true)
    try {
      const res = await getSessionMetrics(orgId, sessionId)
      setSessionData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleUserLoad() {
    if (!umUserId.trim()) {
      toast.error('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F')
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
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
    } finally {
      setUserLoading(false)
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#01B574] to-[#00D68F] shadow-[0_0_20px_rgba(1,181,116,0.3)]">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{'\u041C\u0435\u0442\u0440\u0438\u043A\u0438 \u0441\u0435\u0441\u0441\u0438\u0438'}</h3>
            <p className="text-xs text-white/30">{'\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0441\u0435\u0441\u0441\u0438\u0438'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mb-2">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u0441\u0435\u0441\u0441\u0438\u0438'}</label>
            <VisionInput placeholder="session_id" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </div>
          <button onClick={handleSessionLoad} disabled={sessionLoading} className="btn-primary h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-40">
            {sessionLoading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
          </button>
        </div>
        {sessionLoading && <LoadingSpinner />}
        {!sessionLoading && sessionData != null && <JsonBlock data={sessionData} />}
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E31A1A] to-[#FF6B6B] shadow-[0_0_20px_rgba(227,26,26,0.3)]">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{'\u041C\u0435\u0442\u0440\u0438\u043A\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F'}</h3>
            <p className="text-xs text-white/30">{'\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F'}</label>
            <VisionInput placeholder="user_id" value={umUserId} onChange={(e) => setUmUserId(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u0440\u043E\u0435\u043A\u0442\u0430'}</label>
            <VisionInput placeholder="project_id" value={umProjectId} onChange={(e) => setUmProjectId(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430'}</label>
            <VisionInput type="date" value={umStartDate} onChange={(e) => setUmStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F'}</label>
            <VisionInput type="date" value={umEndDate} onChange={(e) => setUmEndDate(e.target.value)} />
          </div>
        </div>
        <button onClick={handleUserLoad} disabled={userLoading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {userLoading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
        </button>
        {userLoading && <LoadingSpinner />}
        {!userLoading && userData != null && <JsonBlock data={userData} />}
      </div>
    </div>
  )
}

/* ─── Tab 5: Экспорты ─── */

function ExportsTab({ orgId }: { orgId: string }) {
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
      toast.error(err instanceof Error ? err.message : t('reports.loadError'))
=======
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('reports.exports')}</h3>
            <p className="text-xs text-muted-foreground">{t('reports.exportsHistory')}</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={loading} className={btnSecondary}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('reports.refresh')}
=======
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#868CFF] to-[#4318FF] shadow-[0_0_20px_rgba(134,140,255,0.3)]">
            <FileDown className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{'\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u044B'}</h3>
            <p className="text-xs text-white/30">{'\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043E\u0432 \u043E\u0442\u0447\u0451\u0442\u043E\u0432'}</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {'\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C'}
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && loaded && (
        Array.isArray(data) && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
<<<<<<< HEAD
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{t('reports.format')}</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{t('reports.status')}</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">{t('reports.created')}</th>
=======
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{'\u0424\u043E\u0440\u043C\u0430\u0442'}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{'\u0421\u0442\u0430\u0442\u0443\u0441'}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{'\u0421\u043E\u0437\u0434\u0430\u043D\u043E'}</th>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const row = item as Record<string, unknown>
                  return (
<<<<<<< HEAD
                    <tr key={String(row.id ?? idx)} className="border-b border-border last:border-0 hover:bg-accent/50">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{String(row.id ?? '\u2014')}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {String(row.export_format ?? row.format ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          {String(row.status ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{String(row.created_at ?? '\u2014')}</td>
=======
                    <tr key={String(row.id ?? idx)} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(row.id ?? '\u2014')}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#7551FF]/15 px-3 py-1 text-xs font-semibold text-[#7551FF]">
                          {String(row.export_format ?? row.format ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#01B574]/15 px-3 py-1 text-xs font-semibold text-[#01B574]">
                          {String(row.status ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/40">{String(row.created_at ?? '\u2014')}</td>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
<<<<<<< HEAD
            <FileDown className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t('reports.noExports')}</p>
=======
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
              <FileDown className="h-5 w-5 text-white/15" />
            </div>
            <p className="text-sm text-white/25 font-medium">{'\u041D\u0435\u0442 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043E\u0432'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          </div>
        )
      )}
    </div>
  )
}

/* ─── Tab 6: AI Аналитика ─── */

function AiAnalyticsTab({ orgId }: { orgId: string }) {
<<<<<<< HEAD
  const { t } = useTranslation()
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
        period, as_of: asOf || undefined, user_id: userId || undefined,
        mode: mode || undefined, role_profile: roleProfile || undefined,
      })
      setData(res.data as Record<string, unknown>[])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('reports.loadError'))
=======
        period,
        as_of: asOf || undefined,
        user_id: userId || undefined,
        mode: mode || undefined,
        role_profile: roleProfile || undefined,
      })
      setData(res.data as Record<string, unknown>[])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438'
      toast.error(message)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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

<<<<<<< HEAD
  function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button
        onClick={onClick}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('reports.aiAnalytics')}</h3>
            <p className="text-xs text-muted-foreground">{t('reports.aiAnalyticsSubtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.period')}</label>
            <div className="flex gap-1 p-0.5 rounded-lg bg-muted">
              <PillButton active={period === 'day'} onClick={() => setPeriod('day')}>{t('reports.day')}</PillButton>
              <PillButton active={period === 'week'} onClick={() => setPeriod('week')}>{t('reports.week')}</PillButton>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.mode')}</label>
            <div className="flex gap-1 p-0.5 rounded-lg bg-muted">
              <PillButton active={mode === 'employee'} onClick={() => setMode('employee')}>{t('reports.employee')}</PillButton>
              <PillButton active={mode === 'executive'} onClick={() => setMode('executive')}>{t('reports.manager')}</PillButton>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.role')}</label>
            <select value={roleProfile} onChange={(e) => setRoleProfile(e.target.value)} className={selectClass}>
              <option value="developer">{t('reports.developer')}</option>
              <option value="manager">{t('reports.managerRole')}</option>
              <option value="office">{t('reports.office')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.date')}</label>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('reports.userId')}</label>
            <input placeholder={`user_id (${t('reports.userIdOptional')})`} value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button onClick={handleLoad} disabled={loading} className={btnPrimary}>
          <Sparkles className="h-4 w-4" />
          {loading ? t('reports.loading') : t('reports.load')}
        </button>
=======
  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6 relative overflow-hidden">
        {/* Decorative orb */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[#7551FF]/10 blur-3xl" style={{ animation: 'orbFloat2 10s ease-in-out infinite' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7551FF] to-[#4318FF] shadow-[0_0_20px_rgba(117,81,255,0.4)]">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI {'\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430'}</h3>
              <p className="text-xs text-white/30">{'\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u041F\u0435\u0440\u0438\u043E\u0434'}</label>
              <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.03]">
                <button
                  onClick={() => setPeriod('day')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${period === 'day' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {'\u0414\u0435\u043D\u044C'}
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${period === 'week' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {'\u041D\u0435\u0434\u0435\u043B\u044F'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0420\u0435\u0436\u0438\u043C'}</label>
              <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.03]">
                <button
                  onClick={() => setMode('employee')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${mode === 'employee' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {'\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A'}
                </button>
                <button
                  onClick={() => setMode('executive')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${mode === 'executive' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {'\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0420\u043E\u043B\u044C'}</label>
              <VisionSelect value={roleProfile} onChange={setRoleProfile}>
                <option value="developer" className="bg-[#111C44]">{'\u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A'}</option>
                <option value="manager" className="bg-[#111C44]">{'\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440'}</option>
                <option value="office" className="bg-[#111C44]">{'\u041E\u0444\u0438\u0441'}</option>
              </VisionSelect>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{'\u0414\u0430\u0442\u0430'} (as_of)</label>
              <VisionInput type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {'\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F'}</label>
              <VisionInput placeholder="user_id ({'\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E'})" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
          </div>
          <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
            <Sparkles className="h-4 w-4" />
            {loading ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...' : '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C'}
          </button>
        </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      </div>

      {loading && <LoadingSpinner />}

      {!loading && scorecard != null && (
        <>
          {/* Score Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
<<<<<<< HEAD
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t('reports.currentScore')}</p>
              <p className="text-3xl font-bold text-foreground mb-1">{score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">{String(userName)}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t('reports.baseline')}</p>
              <p className="text-3xl font-bold text-muted-foreground mb-1">{baseline.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">{String(periodStart)} \u2014 {String(periodEnd)}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${delta >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {delta >= 0 ? <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t('reports.delta')}</p>
              <p className={`text-3xl font-bold ${delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
              </p>
=======
            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0075FF]/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0075FF]/15">
                    <Target className="h-5 w-5 text-[#0075FF]" />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{'\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0431\u0430\u043B\u043B'}</p>
                <p className="text-4xl font-extrabold text-white mb-1">{score.toFixed(1)}</p>
                <p className="text-xs text-white/30">{String(userName)}</p>
              </div>
            </div>

            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7551FF]/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7551FF]/15">
                    <BarChart3 className="h-5 w-5 text-[#7551FF]" />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{'\u0411\u0430\u0437\u043E\u0432\u044B\u0439'}</p>
                <p className="text-4xl font-extrabold text-white/60 mb-1">{baseline.toFixed(1)}</p>
                <p className="text-xs text-white/30">{String(periodStart)} \u2014 {String(periodEnd)}</p>
              </div>
            </div>

            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${delta >= 0 ? 'from-[#01B574]/10' : 'from-[#E31A1A]/10'} to-transparent`} />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${delta >= 0 ? 'bg-[#01B574]/15' : 'bg-[#E31A1A]/15'}`}>
                    {delta >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-[#01B574]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-[#E31A1A]" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{'\u0414\u0435\u043B\u044C\u0442\u0430'}</p>
                <p className={`text-4xl font-extrabold ${delta >= 0 ? 'text-[#01B574]' : 'text-[#E31A1A]'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                </p>
              </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
            </div>
          </div>

          {/* Trend Chart */}
          {trend.length > 0 && (
<<<<<<< HEAD
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="text-base font-semibold text-foreground">{t('reports.trend')}</h4>
=======
            <div className="vision-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4 w-4 text-[#0075FF]" />
                <h4 className="text-base font-bold text-white">{'\u0422\u0440\u0435\u043D\u0434'}</h4>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
<<<<<<< HEAD
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period_start" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={false} />
=======
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="period_start" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="url(#lineGradient)" strokeWidth={2.5} dot={false} />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7551FF" />
                        <stop offset="100%" stopColor="#0075FF" />
                      </linearGradient>
                    </defs>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Drivers */}
          {primaryDrivers.length > 0 && (
<<<<<<< HEAD
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-orange-500" />
                <h4 className="text-base font-semibold text-foreground">{t('reports.keyFactors')}</h4>
=======
            <div className="vision-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4 text-[#FFB547]" />
                <h4 className="text-base font-bold text-white">{'\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0444\u0430\u043A\u0442\u043E\u0440\u044B'}</h4>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
              </div>
              <div className="space-y-2">
                {primaryDrivers.map((driver, idx) => {
                  const impact = Number(driver.impact ?? 0)
                  return (
<<<<<<< HEAD
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent/50 transition-colors">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${impact >= 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {impact >= 0 ? '+' : ''}{impact.toFixed(1)}%
                      </span>
                      <span className="text-sm text-foreground">{String(driver.name ?? driver.label ?? driver.factor ?? '\u2014')}</span>
=======
                    <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.08]">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${impact >= 0 ? 'bg-[#01B574]/15 text-[#01B574]' : 'bg-[#E31A1A]/15 text-[#E31A1A]'}`}>
                        {impact >= 0 ? '+' : ''}{impact.toFixed(1)}%
                      </span>
                      <span className="text-sm text-white/80 font-medium">{String(driver.name ?? driver.label ?? driver.factor ?? '\u2014')}</span>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Interpretation */}
          {interpretation != null && (
<<<<<<< HEAD
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-purple-500" />
                <h4 className="text-base font-semibold text-foreground">{t('reports.interpretation')}</h4>
              </div>
              <div className="space-y-3">
                {Object.entries(interpretation).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-border bg-muted/50 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{key}</p>
                    <p className="text-sm text-foreground">{String(value)}</p>
                  </div>
                ))}
=======
            <div className="vision-card p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-[#01B574]/8 blur-2xl" style={{ animation: 'orbFloat3 12s ease-in-out infinite' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <Brain className="h-4 w-4 text-[#7551FF]" />
                  <h4 className="text-base font-bold text-white">{'\u0418\u043D\u0442\u0435\u0440\u043F\u0440\u0435\u0442\u0430\u0446\u0438\u044F'}</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(interpretation).map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] px-5 py-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{key}</p>
                      <p className="text-sm text-white/70 leading-relaxed">{String(value)}</p>
                    </div>
                  ))}
                </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
              </div>
            </div>
          )}
        </>
      )}

      {!loading && data != null && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
<<<<<<< HEAD
          <Brain className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
=======
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Brain className="h-6 w-6 text-white/15" />
          </div>
          <p className="text-sm text-white/25 font-medium">{'\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </div>
      )}
    </div>
  )
}

<<<<<<< HEAD
/* ─── Main ReportsPage ─── */

export default function ReportsPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [activeTab, setActiveTab] = useState(0)

  const reportTabs = [
    { id: 0, label: t('reports.orgKpiTab'), icon: BarChart3 },
    { id: 1, label: t('reports.projectKpiTab'), icon: FolderKanban },
    { id: 2, label: t('reports.exportsTab'), icon: FileDown },
    { id: 3, label: t('reports.aiAnalyticsTab'), icon: Brain },
  ]

=======
/* ─── Tab Config ─── */

const reportTabs = [
  { id: 0, label: 'KPI \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438', icon: BarChart3 },
  { id: 1, label: 'KPI \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432', icon: FolderKanban },
  { id: 2, label: '\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C', icon: Zap },
  { id: 3, label: '\u041C\u0435\u0442\u0440\u0438\u043A\u0438', icon: Activity },
  { id: 4, label: '\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u044B', icon: FileDown },
  { id: 5, label: 'AI \u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430', icon: Brain },
]

/* ─── Main ReportsPage ─── */

export default function ReportsPage() {
  const orgId = useOrgStore((s) => s.orgId)
  const [activeTab, setActiveTab] = useState(0)

>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  if (!orgId) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
<<<<<<< HEAD
          <Building2 className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t('reports.joinOrg')}</p>
=======
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <BarChart3 className="h-7 w-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">{'\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u0441\u044C \u043A \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438'}</p>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
<<<<<<< HEAD
      <PageHeader title={t('reports.reportsAndAnalytics')} />

      {/* Tab Navigation */}
      <div className="overflow-x-auto pb-1">
        <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
=======
      {/* Page Title */}
      <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
        {'\u041E\u0442\u0447\u0451\u0442\u044B \u0438 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430'}
      </h1>

      {/* Tab Navigation */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] w-fit">
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          {reportTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
<<<<<<< HEAD
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
=======
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'btn-primary text-white shadow-[0_0_20px_rgba(0,117,255,0.3)]'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

<<<<<<< HEAD
      {activeTab === 0 && <OrgKpiTab orgId={orgId} />}
      {activeTab === 1 && <ProjectKpiTab orgId={orgId} />}
      {activeTab === 2 && <ExportsTab orgId={orgId} />}
      {activeTab === 3 && <AiAnalyticsTab orgId={orgId} />}
=======
      {/* Tab content */}
      {activeTab === 0 && <OrgKpiTab orgId={orgId} />}
      {activeTab === 1 && <ProjectKpiTab orgId={orgId} />}
      {activeTab === 2 && <ProductivityTab orgId={orgId} />}
      {activeTab === 3 && <MetricsTab orgId={orgId} />}
      {activeTab === 4 && <ExportsTab orgId={orgId} />}
      {activeTab === 5 && <AiAnalyticsTab orgId={orgId} />}
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    </div>
  )
}
