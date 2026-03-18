import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import {
  Building2,
  FolderKanban,
  Users as UsersIcon,
  UserCircle,
  Shield,
  Bell,
  FileSearch,
  CalendarClock,
  Plus,
  Check,
  X,
  Trash2,
  Play,
  RefreshCw,
} from 'lucide-react'

/* ─── Shared components ─── */

function VisionInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
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
      className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none transition-colors"
    >
      {children}
    </select>
  )
}

function VisionButton({
  onClick,
  disabled,
  variant = 'primary',
  children,
  size = 'md',
}: {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'danger' | 'outline' | 'success'
  children: React.ReactNode
  size?: 'sm' | 'md'
}) {
  const styles = {
    primary: 'bg-[#0075FF] text-white hover:bg-[#0063D6]',
    danger: 'bg-[#E31A1A]/20 border border-[#E31A1A]/30 text-[#E31A1A] hover:bg-[#E31A1A]/30',
    outline: 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
    success: 'bg-[#01B574] text-white hover:bg-[#01A066]',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold transition-colors disabled:opacity-50 ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  )
}

/* ─── Tab 1: Организация ─── */

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
    <div className="vision-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Заявки на вступление</h3>
      {loading ? (
        <p className="text-sm text-white/40">Загрузка...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-white/40">Нет заявок.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">User ID</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Статус</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{req.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{req.user_id}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      req.status === 'pending' ? 'bg-[#FFB547]/20 text-[#FFB547]' : 'bg-white/10 text-white/50'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1 rounded-lg bg-[#01B574]/20 px-3 py-1.5 text-xs font-bold text-[#01B574] hover:bg-[#01B574]/30">
                          <Check className="h-3 w-3" /> Одобрить
                        </button>
                        <button onClick={() => handleReject(req.id)} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30">
                          <X className="h-3 w-3" /> Отклонить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 2: Проекты ─── */

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
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          <Plus className="inline h-4 w-4 mr-2 text-[#0075FF]" />
          Создать проект
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Название</label>
            <VisionInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Название проекта" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Описание</label>
            <VisionInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? 'Создание...' : 'Создать'}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Проекты</h3>
        {loading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-white/40">Нет проектов.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Название</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Описание</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{p.id}</td>
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-white/70">{p.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 3: Команды ─── */

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            <Plus className="inline h-4 w-4 mr-2 text-[#0075FF]" />
            Создать команду
          </h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Название команды</label>
              <VisionInput value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Название" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">ID проекта (необязательно)</label>
              <VisionInput value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="project_id" />
            </div>
          </div>
          <VisionButton onClick={handleCreate} disabled={creating || !teamName.trim()}>
            {creating ? 'Создание...' : 'Создать'}
          </VisionButton>
        </div>

        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            <UsersIcon className="inline h-4 w-4 mr-2 text-[#7551FF]" />
            Добавить участника
          </h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Команда</label>
              <VisionSelect value={memberTeamId} onChange={setMemberTeamId}>
                <option value="" className="bg-[#111C44]">Выберите команду</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#111C44]">{t.name}</option>
                ))}
              </VisionSelect>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">User ID</label>
              <VisionInput value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} placeholder="user_id" />
            </div>
          </div>
          <VisionButton onClick={handleAddMember} disabled={addingMember || !memberTeamId || !memberUserId.trim()} variant="success">
            {addingMember ? 'Добавление...' : 'Добавить'}
          </VisionButton>
        </div>
      </div>

      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Команды</h3>
        {loading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-white/40">Нет команд.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Название</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Проект</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{t.id}</td>
                    <td className="px-4 py-3 text-white">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{t.project_id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 4: Пользователи ─── */

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
    <div className="vision-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Пользователи</h3>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-white/40">Загрузка...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-white/40">Нет пользователей.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Имя</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{u.id}</td>
                  <td className="px-4 py-3 text-white">{u.email}</td>
                  <td className="px-4 py-3 text-white/70">{u.full_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 5: Приватность ─── */

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
      await createPrivacyRule(orgId, { target, match_type: matchType, pattern: pattern.trim(), action })
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
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          <Plus className="inline h-4 w-4 mr-2 text-[#0075FF]" />
          Создать правило
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Цель</label>
            <VisionSelect value={target} onChange={setTarget}>
              <option value="app" className="bg-[#111C44]">app</option>
              <option value="url" className="bg-[#111C44]">url</option>
              <option value="window" className="bg-[#111C44]">window</option>
            </VisionSelect>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Тип совпадения</label>
            <VisionSelect value={matchType} onChange={setMatchType}>
              <option value="contains" className="bg-[#111C44]">contains</option>
              <option value="equals" className="bg-[#111C44]">equals</option>
              <option value="regex" className="bg-[#111C44]">regex</option>
            </VisionSelect>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Паттерн</label>
            <VisionInput value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Паттерн для совпадения" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Действие</label>
            <VisionSelect value={action} onChange={setAction}>
              <option value="mask" className="bg-[#111C44]">mask</option>
              <option value="block" className="bg-[#111C44]">block</option>
              <option value="allow" className="bg-[#111C44]">allow</option>
            </VisionSelect>
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !pattern.trim()}>
          {creating ? 'Создание...' : 'Создать'}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Правила приватности</h3>
        {loading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-white/40">Нет правил.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Цель</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Совпадение</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Паттерн</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Действие</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  const r = rule as Record<string, unknown>
                  return (
                    <tr key={String(r.id)} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{String(r.id)}</td>
                      <td className="px-4 py-3 text-white/70">{String(r.target ?? '—')}</td>
                      <td className="px-4 py-3 text-white/70">{String(r.match_type ?? '—')}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{String(r.pattern ?? '—')}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-xl bg-[#7551FF]/20 px-3 py-1 text-xs font-bold text-[#7551FF]">
                          {String(r.action ?? '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(String(r.id))} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30">
                          <Trash2 className="h-3 w-3" /> Удалить
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 6: Уведомления ─── */

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
      await createNotificationHook(orgId, { event_type: eventType.trim(), url: url.trim() })
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
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          <Plus className="inline h-4 w-4 mr-2 text-[#0075FF]" />
          Создать хук
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Тип события</label>
            <VisionInput value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="session.start, session.stop..." />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">URL</label>
            <VisionInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !eventType.trim() || !url.trim()}>
          {creating ? 'Создание...' : 'Создать'}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Хуки уведомлений</h3>
        {loading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : hooks.length === 0 ? (
          <p className="text-sm text-white/40">Нет хуков.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Событие</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">URL</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {hooks.map((hook) => {
                  const h = hook as Record<string, unknown>
                  return (
                    <tr key={String(h.id)} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{String(h.id)}</td>
                      <td className="px-4 py-3 text-white/70">{String(h.event_type ?? '—')}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate font-mono text-xs text-white/60">{String(h.url ?? '—')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(String(h.id))} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30">
                          <Trash2 className="h-3 w-3" /> Удалить
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 7: Аудит ─── */

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
    <div className="vision-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Журнал аудита</h3>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-white/40">Загрузка...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-white/40">Нет записей.</p>
      ) : (
        <div className="max-h-[500px] overflow-auto rounded-xl border border-white/10 bg-white/5 p-4">
          <pre className="whitespace-pre-wrap text-xs text-white/70">
            {JSON.stringify(logs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 8: Расписания ─── */

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
    <div className="space-y-5">
      <div className="vision-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          <Plus className="inline h-4 w-4 mr-2 text-[#0075FF]" />
          Создать расписание
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Тип отчёта</label>
            <VisionSelect value={reportType} onChange={setReportType}>
              <option value="org-kpi" className="bg-[#111C44]">org-kpi</option>
              <option value="project-kpi" className="bg-[#111C44]">project-kpi</option>
            </VisionSelect>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Интервал (дни)</label>
            <VisionInput type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} min={1} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Дата начала</label>
            <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Дата окончания</label>
            <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Team ID (необязательно)</label>
            <VisionInput value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team_id" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Project ID (необязательно)</label>
            <VisionInput value={schedProjectId} onChange={(e) => setSchedProjectId(e.target.value)} placeholder="project_id" />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating}>
          {creating ? 'Создание...' : 'Создать'}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Расписания</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Формат:</span>
            <VisionSelect value={runFormat} onChange={setRunFormat}>
              <option value="json" className="bg-[#111C44]">json</option>
              <option value="csv" className="bg-[#111C44]">csv</option>
            </VisionSelect>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-white/40">Нет расписаний.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Тип</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Интервал</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Начало</th>
                  <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Конец</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((sched) => {
                  const s = sched as Record<string, unknown>
                  return (
                    <tr key={String(s.id)} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{String(s.id)}</td>
                      <td className="px-4 py-3 text-white/70">{String(s.report_type ?? '—')}</td>
                      <td className="px-4 py-3 text-white/70">{String(s.interval_days ?? '—')} дн.</td>
                      <td className="px-4 py-3 text-white/70">{String(s.start_date ?? '—')}</td>
                      <td className="px-4 py-3 text-white/70">{String(s.end_date ?? '—')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleRun(String(s.id))} className="flex items-center gap-1 rounded-lg bg-[#01B574]/20 px-3 py-1.5 text-xs font-bold text-[#01B574] hover:bg-[#01B574]/30">
                          <Play className="h-3 w-3" /> Запустить
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab Config ─── */

const tabs = [
  { id: 0, label: 'Организация', icon: Building2 },
  { id: 1, label: 'Проекты', icon: FolderKanban },
  { id: 2, label: 'Команды', icon: UsersIcon },
  { id: 3, label: 'Пользователи', icon: UserCircle },
  { id: 4, label: 'Приватность', icon: Shield },
  { id: 5, label: 'Уведомления', icon: Bell },
  { id: 6, label: 'Аудит', icon: FileSearch },
  { id: 7, label: 'Расписания', icon: CalendarClock },
]

/* ─── Main AdminConsolePage ─── */

export default function AdminConsolePage() {
  const { orgId } = useOrgStore()
  const [activeTab, setActiveTab] = useState(0)

  if (!orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-white/40">
          Присоединитесь к организации, чтобы открыть консоль администратора.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Консоль администратора</h1>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
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
      {activeTab === 0 && <OrgTab orgId={orgId} />}
      {activeTab === 1 && <ProjectsTab orgId={orgId} />}
      {activeTab === 2 && <TeamsTab orgId={orgId} />}
      {activeTab === 3 && <UsersTab orgId={orgId} />}
      {activeTab === 4 && <PrivacyTab orgId={orgId} />}
      {activeTab === 5 && <NotificationsTab orgId={orgId} />}
      {activeTab === 6 && <AuditTab orgId={orgId} />}
      {activeTab === 7 && <SchedulesTab orgId={orgId} />}
    </div>
  )
}
