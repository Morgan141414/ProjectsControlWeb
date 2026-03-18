import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import {
  startSession,
  stopSession,
  listMySessions,
  listOrgSessions,
} from '@/api/sessions'
import type { Session } from '@/types'
import { Play, Square, Monitor, Cpu, Clock, Users } from 'lucide-react'

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU')
}

function SessionTable({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-white/40 py-4">Нет сессий.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">ID</th>
            <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Начало</th>
            <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Конец</th>
            <th className="px-4 py-3 text-xs font-medium text-white/40 uppercase">Статус</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-white/5">
              <td className="px-4 py-3 font-mono text-xs text-white/60">{s.id}</td>
              <td className="px-4 py-3 text-white/70">{formatDate(s.started_at)}</td>
              <td className="px-4 py-3 text-white/70">{formatDate(s.ended_at)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-xl px-3 py-1 text-xs font-bold ${
                    s.ended_at
                      ? 'bg-white/10 text-white/50'
                      : 'bg-[#01B574]/20 text-[#01B574]'
                  }`}
                >
                  {s.ended_at ? 'Завершена' : 'Активна'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  const [activeTab, setActiveTab] = useState(0)

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
        <p className="text-white/40">
          Присоединитесь к организации, чтобы отслеживать активность.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Management */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0075FF]">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Управление сессией</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <div>
            <label className="block text-xs text-white/50 mb-2">
              <Monitor className="inline h-3 w-3 mr-1" />
              Устройство
            </label>
            <input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Имя устройства"
              className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">
              <Cpu className="inline h-3 w-3 mr-1" />
              ОС
            </label>
            <input
              value={osName}
              onChange={(e) => setOsName(e.target.value)}
              placeholder="Операционная система"
              className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            disabled={starting || !!activeSessionId}
            className="flex items-center gap-2 rounded-xl bg-[#01B574] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#01A066] disabled:opacity-50 transition-colors"
          >
            <Play className="h-4 w-4" />
            {starting ? 'Запуск...' : 'Начать сессию'}
          </button>
          <button
            onClick={handleStop}
            disabled={stopping || !activeSessionId}
            className="flex items-center gap-2 rounded-xl bg-[#E31A1A]/20 border border-[#E31A1A]/30 px-6 py-2.5 text-sm font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30 disabled:opacity-50 transition-colors"
          >
            <Square className="h-4 w-4" />
            {stopping ? 'Завершение...' : 'Завершить сессию'}
          </button>
        </div>

        {activeSessionId && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#01B574]/10 border border-[#01B574]/20 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-[#01B574] animate-pulse" />
            <span className="text-sm text-white/70">Текущая сессия:</span>
            <span className="font-mono text-xs text-[#01B574]">{activeSessionId}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="vision-card p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === 0
                ? 'bg-[#0075FF] text-white shadow-[0_0_15px_rgba(0,117,255,0.3)]'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="h-4 w-4" />
            Мои сессии
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === 1
                ? 'bg-[#0075FF] text-white shadow-[0_0_15px_rgba(0,117,255,0.3)]'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="h-4 w-4" />
            Все сессии
          </button>
        </div>

        {activeTab === 0 && (
          <>
            <h3 className="text-lg font-bold text-white mb-4">Мои сессии</h3>
            {loadingMy ? (
              <p className="text-sm text-white/40">Загрузка...</p>
            ) : (
              <SessionTable sessions={mySessions} />
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <h3 className="text-lg font-bold text-white mb-4">Все сессии организации</h3>
            {loadingOrg ? (
              <p className="text-sm text-white/40">Загрузка...</p>
            ) : (
              <SessionTable sessions={orgSessions} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
