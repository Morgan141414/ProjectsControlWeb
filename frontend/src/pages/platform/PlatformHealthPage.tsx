import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Heart, CheckCircle2, Server, Database, Wifi, Shield,
  HardDrive, Cpu, Clock, AlertTriangle, RefreshCw, Activity,
} from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

type ServiceStatus = 'ok' | 'degraded' | 'down'

interface ServiceInfo {
  name: string
  status: ServiceStatus
  icon: typeof Server
  responseTime?: string
  uptime?: string
  lastChecked: Date
}

const statusColors: Record<ServiceStatus, { bg: string; text: string; label: string }> = {
  ok: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Работает' },
  degraded: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Деградация' },
  down: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Недоступен' },
}

export default function PlatformHealthPage() {
  const { t } = useTranslation()
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const services: ServiceInfo[] = [
    { name: 'API Server', status: 'ok', icon: Server, responseTime: '45ms', uptime: '99.98%', lastChecked: lastRefresh },
    { name: 'Database (PostgreSQL)', status: 'ok', icon: Database, responseTime: '12ms', uptime: '99.99%', lastChecked: lastRefresh },
    { name: 'WebSocket Server', status: 'ok', icon: Wifi, responseTime: '8ms', uptime: '99.95%', lastChecked: lastRefresh },
    { name: 'Auth Service', status: 'ok', icon: Shield, responseTime: '35ms', uptime: '99.99%', lastChecked: lastRefresh },
    { name: 'File Storage', status: 'ok', icon: HardDrive, responseTime: '120ms', uptime: '99.90%', lastChecked: lastRefresh },
    { name: 'Task Queue', status: 'ok', icon: Cpu, responseTime: '5ms', uptime: '99.97%', lastChecked: lastRefresh },
  ]

  const allOk = services.every((s) => s.status === 'ok')
  const degraded = services.filter((s) => s.status === 'degraded')
  const down = services.filter((s) => s.status === 'down')

  const systemMetrics = [
    { label: 'CPU', value: '23%', max: 100, current: 23, color: 'bg-emerald-500' },
    { label: 'RAM', value: '4.2 / 8 GB', max: 100, current: 52, color: 'bg-blue-500' },
    { label: 'Disk', value: '45 / 100 GB', max: 100, current: 45, color: 'bg-violet-500' },
    { label: 'Network', value: '12 Mbps', max: 100, current: 12, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('nav.platformHealth')}</h1>
          <p className="text-sm text-muted-foreground">{t('platform.healthDesc', 'Состояние сервисов платформы')}</p>
        </div>
        <button
          onClick={() => setLastRefresh(new Date())}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Обновить
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl border p-5 ${
        allOk
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : down.length > 0
            ? 'border-red-500/20 bg-red-500/5'
            : 'border-amber-500/20 bg-amber-500/5'
      }`}>
        <div className="flex items-center gap-3">
          {allOk ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : down.length > 0 ? (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          )}
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              {allOk
                ? t('platform.allSystemsOk', 'Все системы работают нормально')
                : down.length > 0
                  ? `${down.length} сервис(ов) недоступно`
                  : `${degraded.length} сервис(ов) с деградацией`
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('platform.lastCheck', 'Последняя проверка')}: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* System metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {systemMetrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
              <span className="text-sm font-semibold text-foreground">{m.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color} transition-all duration-500`}
                style={{ width: `${m.current}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-foreground">Сервисы ({services.length})</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          {services.map((svc) => {
            const sc = statusColors[svc.status]
            return (
              <div key={svc.name} className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${sc.bg}`}>
                    <svc.icon className={`h-4 w-4 ${sc.text}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {svc.responseTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{svc.responseTime}
                        </span>
                      )}
                      {svc.uptime && (
                        <span>Uptime: {svc.uptime}</span>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge variant={svc.status === 'ok' ? 'success' : svc.status === 'degraded' ? 'warning' : 'error'}>
                  {sc.label}
                </StatusBadge>
              </div>
            )
          })}
        </div>
      </div>

      {/* Uptime summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-4 w-4 text-blue-500" />
          <h3 className="text-[15px] font-semibold text-foreground">Uptime за 30 дней</h3>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className={`h-8 flex-1 rounded-sm ${i === 18 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              title={`${new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('ru-RU')}: ${i === 18 ? '99.5%' : '100%'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>30 дней назад</span>
          <span>Сегодня</span>
        </div>
      </div>
    </div>
  )
}
