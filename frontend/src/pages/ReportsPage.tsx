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

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg border bg-muted p-4 text-xs">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}

function LoadingSpinner() {
  return <p className="py-4 text-sm text-muted-foreground">Загрузка...</p>
}

function NoOrg() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <p className="text-lg text-muted-foreground">Присоединитесь к организации</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - KPI организации                                          */
/* ------------------------------------------------------------------ */

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
    <Card>
      <CardHeader>
        <CardTitle>KPI организации</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Дата начала</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата окончания</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ID команды</Label>
            <Input placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ID проекта</Label>
            <Input placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleLoad} disabled={loading}>
            Загрузить
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            Экспорт
          </Button>
        </div>

        {loading && <LoadingSpinner />}
        {!loading && data != null && <JsonBlock data={data} />}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - KPI проектов                                              */
/* ------------------------------------------------------------------ */

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
    <Card>
      <CardHeader>
        <CardTitle>KPI проектов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Дата начала</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата окончания</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleLoad} disabled={loading}>
            Загрузить
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            Экспорт
          </Button>
        </div>

        {loading && <LoadingSpinner />}
        {!loading && data != null && <JsonBlock data={data} />}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Продуктивность                                           */
/* ------------------------------------------------------------------ */

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
    <Card>
      <CardHeader>
        <CardTitle>Продуктивность</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>ID пользователя</Label>
            <Input placeholder="user_id" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ID команды</Label>
            <Input placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ID проекта</Label>
            <Input placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата начала</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата окончания</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleLoad} disabled={loading}>
          Загрузить
        </Button>

        {loading && <LoadingSpinner />}
        {!loading && data != null && <JsonBlock data={data} />}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 4 - Метрики                                                   */
/* ------------------------------------------------------------------ */

function MetricsTab({ orgId }: { orgId: string }) {
  // Session metrics
  const [sessionId, setSessionId] = useState('')
  const [sessionData, setSessionData] = useState<unknown>(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  // User metrics
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
    <div className="space-y-6">
      {/* Session metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Метрики сессии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>ID сессии</Label>
              <Input placeholder="session_id" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
            </div>
            <Button onClick={handleSessionLoad} disabled={sessionLoading}>
              Загрузить
            </Button>
          </div>
          {sessionLoading && <LoadingSpinner />}
          {!sessionLoading && sessionData != null && <JsonBlock data={sessionData} />}
        </CardContent>
      </Card>

      {/* User metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Метрики пользователя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>ID пользователя</Label>
              <Input placeholder="user_id" value={umUserId} onChange={(e) => setUmUserId(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>ID проекта</Label>
              <Input placeholder="project_id" value={umProjectId} onChange={(e) => setUmProjectId(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Дата начала</Label>
              <Input type="date" value={umStartDate} onChange={(e) => setUmStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Дата окончания</Label>
              <Input type="date" value={umEndDate} onChange={(e) => setUmEndDate(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleUserLoad} disabled={userLoading}>
            Загрузить
          </Button>

          {userLoading && <LoadingSpinner />}
          {!userLoading && userData != null && <JsonBlock data={userData} />}
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 5 - Экспорты                                                  */
/* ------------------------------------------------------------------ */

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
    <Card>
      <CardHeader>
        <CardTitle>Экспорты</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleRefresh} disabled={loading}>
          Обновить
        </Button>

        {loading && <LoadingSpinner />}
        {!loading && loaded && (
          Array.isArray(data) && data.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-2 font-medium">ID</th>
                    <th className="px-3 py-2 font-medium">Формат</th>
                    <th className="px-3 py-2 font-medium">Статус</th>
                    <th className="px-3 py-2 font-medium">Создано</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    const row = item as Record<string, unknown>
                    return (
                      <tr key={String(row.id ?? idx)} className="border-b">
                        <td className="px-3 py-2 font-mono text-xs">{String(row.id ?? '—')}</td>
                        <td className="px-3 py-2">
                          <Badge variant="secondary">{String(row.export_format ?? row.format ?? '—')}</Badge>
                        </td>
                        <td className="px-3 py-2">{String(row.status ?? '—')}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {String(row.created_at ?? '—')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Нет экспортов</p>
          )
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 6 - AI Аналитика                                              */
/* ------------------------------------------------------------------ */

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
    <Card>
      <CardHeader>
        <CardTitle>AI Аналитика</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Period */}
          <div className="space-y-1.5">
            <Label>Период</Label>
            <div className="flex gap-1">
              <Button size="sm" variant={period === 'day' ? 'default' : 'outline'} onClick={() => setPeriod('day')}>
                День
              </Button>
              <Button size="sm" variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>
                Неделя
              </Button>
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <Label>Режим</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mode === 'employee' ? 'default' : 'outline'}
                onClick={() => setMode('employee')}
              >
                Сотрудник
              </Button>
              <Button
                size="sm"
                variant={mode === 'executive' ? 'default' : 'outline'}
                onClick={() => setMode('executive')}
              >
                Руководитель
              </Button>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Роль</Label>
            <Select value={roleProfile} onValueChange={setRoleProfile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Разработчик</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
                <SelectItem value="office">Офис</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Дата (as_of)</Label>
            <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          </div>

          {/* User ID */}
          <div className="space-y-1.5">
            <Label>ID пользователя</Label>
            <Input placeholder="user_id (опционально)" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleLoad} disabled={loading}>
          Загрузить
        </Button>

        {loading && <LoadingSpinner />}

        {/* Results */}
        {!loading && scorecard != null && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold">{String(userName)}</h3>
              <p className="text-sm text-muted-foreground">
                {String(periodStart)} &mdash; {String(periodEnd)}
              </p>
            </div>

            <Separator />

            {/* Score card */}
            <div className="flex items-baseline gap-6">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Текущий балл</p>
                <p className="text-5xl font-bold tabular-nums">{score.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Базовый</p>
                <p className="text-xl tabular-nums">{baseline.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Дельта</p>
                <p className={`text-xl font-semibold tabular-nums ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(1)}%
                </p>
              </div>
            </div>

            <Separator />

            {/* Trend chart */}
            {trend.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Тренд</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period_start" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Primary drivers */}
            {primaryDrivers.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Ключевые факторы</h4>
                <ul className="space-y-1">
                  {primaryDrivers.map((driver, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">
                        {Number(driver.impact ?? 0) >= 0 ? '+' : ''}
                        {Number(driver.impact ?? 0).toFixed(1)}%
                      </Badge>
                      <span>{String(driver.name ?? driver.label ?? driver.factor ?? '—')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interpretation / Summary */}
            {interpretation != null && (
              <div>
                <h4 className="mb-2 font-medium">Интерпретация</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {Object.entries(interpretation).map(([key, value]) => (
                    <div key={key}>
                      <p className="font-medium text-foreground">{key}</p>
                      <p>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && data != null && data.length === 0 && (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const orgId = useOrgStore((s) => s.orgId)

  if (!orgId) return <NoOrg />

  return (
    <div className="container mx-auto space-y-6 py-6">
      <h1 className="text-2xl font-bold">Отчёты</h1>

      <Tabs defaultValue={0}>
        <TabsList className="flex-wrap">
          <TabsTrigger value={0}>KPI организации</TabsTrigger>
          <TabsTrigger value={1}>KPI проектов</TabsTrigger>
          <TabsTrigger value={2}>Продуктивность</TabsTrigger>
          <TabsTrigger value={3}>Метрики</TabsTrigger>
          <TabsTrigger value={4}>Экспорты</TabsTrigger>
          <TabsTrigger value={5}>AI Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          <OrgKpiTab orgId={orgId} />
        </TabsContent>

        <TabsContent value={1}>
          <ProjectKpiTab orgId={orgId} />
        </TabsContent>

        <TabsContent value={2}>
          <ProductivityTab orgId={orgId} />
        </TabsContent>

        <TabsContent value={3}>
          <MetricsTab orgId={orgId} />
        </TabsContent>

        <TabsContent value={4}>
          <ExportsTab orgId={orgId} />
        </TabsContent>

        <TabsContent value={5}>
          <AiAnalyticsTab orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
