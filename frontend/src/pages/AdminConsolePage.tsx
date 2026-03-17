import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useOrgStore } from '@/stores/orgStore'
import {
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '@/api/orgs'
import { listProjects, createProject } from '@/api/projects'
import { listTeams, createTeam, addTeamMember } from '@/api/teams'
import { listUsers } from '@/api/users'
import {
  listPrivacyRules,
  createPrivacyRule,
  deletePrivacyRule,
} from '@/api/privacy'
import {
  listNotificationHooks,
  createNotificationHook,
  deleteNotificationHook,
} from '@/api/notifications'
import { listAudit } from '@/api/audit'
import { listSchedules, createSchedule, runSchedule } from '@/api/schedules'
import type {
  JoinRequest,
  Project,
  Team,
  User,
  PrivacyRule,
  NotificationHook,
  AuditLog,
  ReportSchedule,
} from '@/types'

/* ─────────────────────── Tab 1: Организация ─────────────────────── */

function OrgTab({ orgId }: { orgId: string }) {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listJoinRequests(orgId)
      setRequests(r.data)
    } catch {
      toast.error('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: string) {
    try {
      await approveJoinRequest(orgId, id)
      toast.success('Заявка одобрена')
      load()
    } catch {
      toast.error('Ошибка одобрения')
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectJoinRequest(orgId, id)
      toast.success('Заявка отклонена')
      load()
    } catch {
      toast.error('Ошибка отклонения')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявки на вступление</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет заявок.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.id}</TableCell>
                  <TableCell className="font-mono text-xs">{req.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'pending' ? 'outline' : 'secondary'}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(req.id)}>
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(req.id)}
                        >
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

/* ─────────────────────── Tab 2: Проекты ─────────────────────── */

function ProjectsTab({ orgId }: { orgId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listProjects(orgId)
      setProjects(r.data)
    } catch {
      toast.error('Не удалось загрузить проекты')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createProject(orgId, name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      toast.success('Проект создан')
      load()
    } catch {
      toast.error('Не удалось создать проект')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Создать проект</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название проекта" />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
          </div>
          <Button onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Проекты</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет проектов.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.description ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────── Tab 3: Команды ─────────────────────── */

function TeamsTab({ orgId }: { orgId: string }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [creating, setCreating] = useState(false)

  const [memberTeamId, setMemberTeamId] = useState('')
  const [memberUserId, setMemberUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listTeams(orgId)
      setTeams(r.data)
    } catch {
      toast.error('Не удалось загрузить команды')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!teamName.trim()) return
    setCreating(true)
    try {
      await createTeam(orgId, teamName.trim(), projectId.trim() || undefined)
      setTeamName('')
      setProjectId('')
      toast.success('Команда создана')
      load()
    } catch {
      toast.error('Не удалось создать команду')
    } finally {
      setCreating(false)
    }
  }

  async function handleAddMember() {
    if (!memberTeamId || !memberUserId.trim()) return
    setAddingMember(true)
    try {
      await addTeamMember(orgId, memberTeamId, memberUserId.trim())
      setMemberUserId('')
      toast.success('Участник добавлен')
      load()
    } catch {
      toast.error('Не удалось добавить участника')
    } finally {
      setAddingMember(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Создать команду</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Название команды</Label>
            <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Название" />
          </div>
          <div className="space-y-2">
            <Label>ID проекта (необязательно)</Label>
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="project_id" />
          </div>
          <Button onClick={handleCreate} disabled={creating || !teamName.trim()}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Добавить участника</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Команда</Label>
            <Select value={memberTeamId} onValueChange={(v) => setMemberTeamId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите команду" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} placeholder="user_id" />
          </div>
          <Button onClick={handleAddMember} disabled={addingMember || !memberTeamId || !memberUserId.trim()}>
            {addingMember ? 'Добавление...' : 'Добавить'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Команды</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет команд.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Проект</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell className="font-mono text-xs">{t.project_id ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────── Tab 4: Пользователи ─────────────────────── */

function UsersTab({ orgId }: { orgId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listUsers(orgId)
      setUsers(r.data)
    } catch {
      toast.error('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Пользователи</CardTitle>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет пользователей.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Имя</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.full_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

/* ─────────────────────── Tab 5: Приватность ─────────────────────── */

function PrivacyTab({ orgId }: { orgId: string }) {
  const [rules, setRules] = useState<PrivacyRule[]>([])
  const [loading, setLoading] = useState(false)

  const [target, setTarget] = useState('app')
  const [matchType, setMatchType] = useState('contains')
  const [pattern, setPattern] = useState('')
  const [action, setAction] = useState('mask')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listPrivacyRules(orgId)
      setRules(r.data)
    } catch {
      toast.error('Не удалось загрузить правила приватности')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!pattern.trim()) return
    setCreating(true)
    try {
      await createPrivacyRule(orgId, {
        target,
        match_type: matchType,
        pattern: pattern.trim(),
        action,
      })
      setPattern('')
      toast.success('Правило создано')
      load()
    } catch {
      toast.error('Не удалось создать правило')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      await deletePrivacyRule(orgId, ruleId)
      toast.success('Правило удалено')
      load()
    } catch {
      toast.error('Не удалось удалить правило')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Создать правило</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Цель</Label>
              <Select value={target} onValueChange={(v) => setTarget(v ?? 'app')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">app</SelectItem>
                  <SelectItem value="url">url</SelectItem>
                  <SelectItem value="window">window</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тип совпадения</Label>
              <Select value={matchType} onValueChange={(v) => setMatchType(v ?? 'contains')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">contains</SelectItem>
                  <SelectItem value="equals">equals</SelectItem>
                  <SelectItem value="regex">regex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Паттерн</Label>
            <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Паттерн для совпадения" />
          </div>
          <div className="space-y-2">
            <Label>Действие</Label>
            <Select value={action} onValueChange={(v) => setAction(v ?? 'mask')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mask">mask</SelectItem>
                <SelectItem value="block">block</SelectItem>
                <SelectItem value="allow">allow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={creating || !pattern.trim()}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Правила приватности</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет правил.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Цель</TableHead>
                  <TableHead>Совпадение</TableHead>
                  <TableHead>Паттерн</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const r = rule as Record<string, unknown>
                  return (
                    <TableRow key={String(r.id)}>
                      <TableCell className="font-mono text-xs">{String(r.id)}</TableCell>
                      <TableCell>{String(r.target ?? '—')}</TableCell>
                      <TableCell>{String(r.match_type ?? '—')}</TableCell>
                      <TableCell className="font-mono text-xs">{String(r.pattern ?? '—')}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{String(r.action ?? '—')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(String(r.id))}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────── Tab 6: Уведомления ─────────────────────── */

function NotificationsTab({ orgId }: { orgId: string }) {
  const [hooks, setHooks] = useState<NotificationHook[]>([])
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState('')
  const [url, setUrl] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listNotificationHooks(orgId)
      setHooks(r.data)
    } catch {
      toast.error('Не удалось загрузить хуки')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!eventType.trim() || !url.trim()) return
    setCreating(true)
    try {
      await createNotificationHook(orgId, {
        event_type: eventType.trim(),
        url: url.trim(),
      })
      setEventType('')
      setUrl('')
      toast.success('Хук создан')
      load()
    } catch {
      toast.error('Не удалось создать хук')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(hookId: string) {
    try {
      await deleteNotificationHook(orgId, hookId)
      toast.success('Хук удалён')
      load()
    } catch {
      toast.error('Не удалось удалить хук')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Создать хук</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Тип события</Label>
            <Input value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="session.start, session.stop..." />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleCreate} disabled={creating || !eventType.trim() || !url.trim()}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хуки уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : hooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет хуков.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {hooks.map((hook) => {
                  const h = hook as Record<string, unknown>
                  return (
                    <TableRow key={String(h.id)}>
                      <TableCell className="font-mono text-xs">{String(h.id)}</TableCell>
                      <TableCell>{String(h.event_type ?? '—')}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">{String(h.url ?? '—')}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(String(h.id))}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────── Tab 7: Аудит ─────────────────────── */

function AuditTab({ orgId }: { orgId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listAudit(orgId)
      setLogs(r.data)
    } catch {
      toast.error('Не удалось загрузить аудит')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Журнал аудита</CardTitle>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет записей.</p>
        ) : (
          <div className="max-h-[500px] overflow-auto rounded-md border p-3">
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─────────────────────── Tab 8: Расписания ─────────────────────── */

function SchedulesTab({ orgId }: { orgId: string }) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(false)

  const [reportType, setReportType] = useState('org-kpi')
  const [intervalDays, setIntervalDays] = useState('7')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamId, setTeamId] = useState('')
  const [schedProjectId, setSchedProjectId] = useState('')
  const [creating, setCreating] = useState(false)

  const [runFormat, setRunFormat] = useState('json')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listSchedules(orgId)
      setSchedules(r.data)
    } catch {
      toast.error('Не удалось загрузить расписания')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    setCreating(true)
    try {
      const data: Record<string, unknown> = {
        report_type: reportType,
        interval_days: Number(intervalDays),
      }
      if (startDate) data.start_date = startDate
      if (endDate) data.end_date = endDate
      if (teamId.trim()) data.team_id = teamId.trim()
      if (schedProjectId.trim()) data.project_id = schedProjectId.trim()
      await createSchedule(orgId, data)
      toast.success('Расписание создано')
      setStartDate('')
      setEndDate('')
      setTeamId('')
      setSchedProjectId('')
      load()
    } catch {
      toast.error('Не удалось создать расписание')
    } finally {
      setCreating(false)
    }
  }

  async function handleRun(scheduleId: string) {
    try {
      await runSchedule(orgId, scheduleId, runFormat)
      toast.success('Отчёт запущен')
    } catch {
      toast.error('Не удалось запустить отчёт')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Создать расписание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Тип отчёта</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v ?? 'org-kpi')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org-kpi">org-kpi</SelectItem>
                  <SelectItem value="project-kpi">project-kpi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Интервал (дни)</Label>
              <Input
                type="number"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                min={1}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Team ID (необязательно)</Label>
              <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team_id" />
            </div>
            <div className="space-y-2">
              <Label>Project ID (необязательно)</Label>
              <Input value={schedProjectId} onChange={(e) => setSchedProjectId(e.target.value)} placeholder="project_id" />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Расписания</CardTitle>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Формат:</Label>
            <Select value={runFormat} onValueChange={(v) => setRunFormat(v ?? 'json')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">json</SelectItem>
                <SelectItem value="csv">csv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет расписаний.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Интервал</TableHead>
                  <TableHead>Начало</TableHead>
                  <TableHead>Конец</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((sched) => {
                  const s = sched as Record<string, unknown>
                  return (
                    <TableRow key={String(s.id)}>
                      <TableCell className="font-mono text-xs">{String(s.id)}</TableCell>
                      <TableCell>{String(s.report_type ?? '—')}</TableCell>
                      <TableCell>{String(s.interval_days ?? '—')} дн.</TableCell>
                      <TableCell>{String(s.start_date ?? '—')}</TableCell>
                      <TableCell>{String(s.end_date ?? '—')}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleRun(String(s.id))}>
                          Запустить
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────── Main AdminConsolePage ─────────────────────── */

export default function AdminConsolePage() {
  const { orgId } = useOrgStore()
  const [activeTab, setActiveTab] = useState<string | number>(0)

  if (!orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Присоединитесь к организации, чтобы открыть консоль администратора.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Консоль администратора</h1>

      <Tabs defaultValue={0} onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value={0}>Организация</TabsTrigger>
          <TabsTrigger value={1}>Проекты</TabsTrigger>
          <TabsTrigger value={2}>Команды</TabsTrigger>
          <TabsTrigger value={3}>Пользователи</TabsTrigger>
          <TabsTrigger value={4}>Приватность</TabsTrigger>
          <TabsTrigger value={5}>Уведомления</TabsTrigger>
          <TabsTrigger value={6}>Аудит</TabsTrigger>
          <TabsTrigger value={7}>Расписания</TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          {activeTab === 0 && <OrgTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={1}>
          {activeTab === 1 && <ProjectsTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={2}>
          {activeTab === 2 && <TeamsTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={3}>
          {activeTab === 3 && <UsersTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={4}>
          {activeTab === 4 && <PrivacyTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={5}>
          {activeTab === 5 && <NotificationsTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={6}>
          {activeTab === 6 && <AuditTab orgId={orgId} />}
        </TabsContent>
        <TabsContent value={7}>
          {activeTab === 7 && <SchedulesTab orgId={orgId} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
