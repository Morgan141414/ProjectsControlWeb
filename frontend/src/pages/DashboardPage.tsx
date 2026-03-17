import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Task, Project } from '@/types'
import { getGreeting } from '@/lib/greeting'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { createOrg, joinOrg, getOrg } from '@/api/orgs'
import { listTodayTasks } from '@/api/tasks'
import { listProjects } from '@/api/projects'
import { createDailyReport } from '@/api/dailyReports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

/* ------------------------------------------------------------------ */
/*  Greeting                                                          */
/* ------------------------------------------------------------------ */
function GreetingSection() {
  const fullName = useAuthStore((s) => s.fullName)
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold">
        {getGreeting()}, {fullName ?? 'пользователь'}!
      </h1>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Org section                                                       */
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
      toast.success('Организация создана')
    } catch {
      toast.error('Не удалось создать организацию')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      await joinOrg(joinCode.trim())
      toast.success('Заявка на вступление отправлена')
      setJoinCode('')
    } catch {
      toast.error('Не удалось отправить заявку')
    } finally {
      setLoading(false)
    }
  }

  if (orgId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Организация</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-medium">{orgName}</p>
          {orgCode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Код:</span>
              <Badge variant="secondary">{orgCode}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Организация</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Create */}
        <div className="flex flex-col gap-2">
          <Label>Создать организацию</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Название"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={loading}>
              Создать
            </Button>
          </div>
        </div>

        {/* Join */}
        <div className="flex flex-col gap-2">
          <Label>Присоединиться</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Код организации"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button variant="outline" onClick={handleJoin} disabled={loading}>
              Вступить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  KPI stubs                                                         */
/* ------------------------------------------------------------------ */
function KpiSection() {
  const kpis = [
    { label: 'Score', value: '—' },
    { label: 'Focus Hours', value: '—' },
    { label: 'Tasks', value: '—' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {kpis.map((k) => (
        <Card key={k.label}>
          <CardContent className="flex flex-col items-center py-4">
            <span className="text-2xl font-bold">{k.value}</span>
            <span className="text-xs text-muted-foreground">{k.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Today's tasks                                                     */
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
      .catch(() => toast.error('Не удалось загрузить задачи'))
      .finally(() => setLoading(false))
  }, [orgId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи на сегодня</CardTitle>
      </CardHeader>
      <CardContent>
        {!orgId ? (
          <p className="text-sm text-muted-foreground">
            Сначала присоединитесь к организации
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Задач нет</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{t.title}</span>
                <Badge variant="outline">{t.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Daily report                                                      */
/* ------------------------------------------------------------------ */
function DailyReport() {
  const orgId = useOrgStore((s) => s.orgId)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
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
      toast.success('Отчёт отправлен')
      setContent('')
    } catch {
      toast.error('Не удалось отправить отчёт')
    } finally {
      setSending(false)
    }
  }

  if (!orgId) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Дневной отчёт</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Проект</Label>
          <Select
            value={selectedProject ?? undefined}
            onValueChange={(val) => setSelectedProject(val as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите проект" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Содержание</Label>
          <Textarea
            placeholder="Что было сделано сегодня..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={sending || !selectedProject}>
          {sending ? 'Отправка...' : 'Отправить отчёт'}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Main dashboard layout                                             */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <GreetingSection />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <OrgSection />
          <KpiSection />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TodayTasks />
          <DailyReport />
        </div>
      </div>
    </div>
  )
}
