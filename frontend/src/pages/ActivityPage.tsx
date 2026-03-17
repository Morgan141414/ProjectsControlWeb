import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  startSession,
  stopSession,
  listMySessions,
  listOrgSessions,
} from '@/api/sessions'
import type { Session } from '@/types'

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU')
}

function sessionStatus(s: Session) {
  return s.ended_at ? 'Завершена' : 'Активна'
}

function SessionTable({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет сессий.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Начало</TableHead>
          <TableHead>Конец</TableHead>
          <TableHead>Статус</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-mono text-xs">{s.id}</TableCell>
            <TableCell>{formatDate(s.started_at)}</TableCell>
            <TableCell>{formatDate(s.ended_at)}</TableCell>
            <TableCell>
              <Badge variant={s.ended_at ? 'secondary' : 'default'}>
                {sessionStatus(s)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function ActivityPage() {
  const { orgId } = useOrgStore()

  const [deviceName, setDeviceName] = useState(
    () => navigator.userAgent.substring(0, 50),
  )
  const [osName, setOsName] = useState(() => navigator.platform)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)

  const [mySessions, setMySessions] = useState<Session[]>([])
  const [orgSessions, setOrgSessions] = useState<Session[]>([])
  const [loadingMy, setLoadingMy] = useState(false)
  const [loadingOrg, setLoadingOrg] = useState(false)
  const [activeTab, setActiveTab] = useState<string | number>(0)

  const loadMySessions = useCallback(async () => {
    if (!orgId) return
    setLoadingMy(true)
    try {
      const r = await listMySessions(orgId)
      setMySessions(r.data)
    } catch {
      toast.error('Не удалось загрузить мои сессии')
    } finally {
      setLoadingMy(false)
    }
  }, [orgId])

  const loadOrgSessions = useCallback(async () => {
    if (!orgId) return
    setLoadingOrg(true)
    try {
      const r = await listOrgSessions(orgId)
      setOrgSessions(r.data)
    } catch {
      toast.error('Не удалось загрузить сессии организации')
    } finally {
      setLoadingOrg(false)
    }
  }, [orgId])

  useEffect(() => {
    if (activeTab === 0) loadMySessions()
  }, [activeTab, loadMySessions])

  useEffect(() => {
    if (activeTab === 1) loadOrgSessions()
  }, [activeTab, loadOrgSessions])

  async function handleStart() {
    if (!orgId) return
    setStarting(true)
    try {
      const r = await startSession(orgId, deviceName, osName)
      setActiveSessionId(r.data.id)
      toast.success('Сессия начата')
      loadMySessions()
    } catch {
      toast.error('Не удалось начать сессию')
    } finally {
      setStarting(false)
    }
  }

  async function handleStop() {
    if (!orgId || !activeSessionId) return
    setStopping(true)
    try {
      await stopSession(orgId, activeSessionId)
      setActiveSessionId(null)
      toast.success('Сессия завершена')
      loadMySessions()
    } catch {
      toast.error('Не удалось завершить сессию')
    } finally {
      setStopping(false)
    }
  }

  if (!orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Присоединитесь к организации, чтобы отслеживать активность.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Активность</h1>

      <Card>
        <CardHeader>
          <CardTitle>Управление сессией</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="device-name">Устройство</Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Имя устройства"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="os-name">ОС</Label>
              <Input
                id="os-name"
                value={osName}
                onChange={(e) => setOsName(e.target.value)}
                placeholder="Операционная система"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleStart} disabled={starting || !!activeSessionId}>
              {starting ? 'Запуск...' : 'Начать сессию'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleStop}
              disabled={stopping || !activeSessionId}
            >
              {stopping ? 'Завершение...' : 'Завершить сессию'}
            </Button>
          </div>

          {activeSessionId && (
            <p className="text-sm text-muted-foreground">
              Текущая сессия:{' '}
              <span className="font-mono">{activeSessionId}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs
        defaultValue={0}
        onValueChange={(val) => setActiveTab(val)}
      >
        <TabsList>
          <TabsTrigger value={0}>Мои сессии</TabsTrigger>
          <TabsTrigger value={1}>Все сессии</TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          <Card>
            <CardHeader>
              <CardTitle>Мои сессии</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMy ? (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              ) : (
                <SessionTable sessions={mySessions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={1}>
          <Card>
            <CardHeader>
              <CardTitle>Все сессии организации</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrg ? (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              ) : (
                <SessionTable sessions={orgSessions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
