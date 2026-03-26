import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  AlertTriangle, AlertCircle, ScrollText, Key,
  ArrowRight, ShieldAlert, Clock, Shield, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useEmergencySession, EMERGENCY_SESSION_MAX_MS } from '@/hooks/useEmergency'
import { cn } from '@/lib/utils'

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function EmergencyTimer({ startedAt }: { startedAt: number }) {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const elapsed = now - startedAt
  const remaining = Math.max(0, EMERGENCY_SESSION_MAX_MS - elapsed)
  const progress = (elapsed / EMERGENCY_SESSION_MAX_MS) * 100
  const isLow = remaining < 5 * 60 * 1000 // less than 5 min

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Clock className={cn('h-4 w-4', isLow ? 'text-red-500 animate-pulse' : 'text-amber-500')} />
          <span className={cn('font-medium', isLow ? 'text-red-500' : 'text-foreground')}>
            {t('emergency.timeRemaining', 'Осталось')}: {formatTime(remaining)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('emergency.maxSession', 'Макс. 30 минут')}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            isLow ? 'bg-red-500' : progress > 50 ? 'bg-amber-500' : 'bg-emerald-500',
          )}
          style={{ width: `${Math.min(100, 100 - (remaining / EMERGENCY_SESSION_MAX_MS) * 100)}%` }}
        />
      </div>
    </div>
  )
}

function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  reason,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  reason: string
}) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-card p-6 shadow-2xl mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t('emergency.confirmTitle', 'Подтвердите активацию режима ЧП')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('emergency.confirmWarning', 'Вы получите временный доступ к защищённым данным. Все действия будут записаны в аудит.')}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">{t('emergency.reason')}:</p>
          <p className="text-sm font-medium text-foreground">{reason}</p>
        </div>

        <ul className="space-y-1.5 mb-5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
            {t('emergency.confirmTime', 'Сессия ограничена 30 минутами')}
          </li>
          <li className="flex items-center gap-2">
            <ScrollText className="h-3 w-3 text-red-500 shrink-0" />
            {t('emergency.confirmLog', 'Все просмотры и действия логируются')}
          </li>
          <li className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-blue-500 shrink-0" />
            {t('emergency.confirmReview', 'Запись будет доступна для аудита')}
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            {t('emergency.confirmActivate', 'Активировать ЧП')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmergencyActivateForm({ onActivate }: { onActivate: (reason: string) => void }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('emergency.reasonPlaceholder')}
          className="flex-1 h-9 rounded-lg border border-red-500/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500/40 focus:outline-none"
        />
        <button
          onClick={() => { if (reason.trim()) setShowConfirm(true) }}
          disabled={!reason.trim()}
          className="h-9 rounded-lg bg-red-500 px-4 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {t('emergency.activate')}
        </button>
      </div>
      <ConfirmDialog
        open={showConfirm}
        reason={reason}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false)
          onActivate(reason.trim())
          setReason('')
        }}
      />
    </>
  )
}

export default function EmergencyDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fullName = useAuthStore((s) => s.fullName)
  const { isActive, reason, startedAt, activate, deactivate } = useEmergencySession()

  const sections = [
    { label: t('emergency.incidents'), description: t('emergency.incidentsDesc'), icon: AlertCircle, to: '/emergency/incidents' },
    { label: t('emergency.forensicLogs'), description: t('emergency.forensicLogsDesc'), icon: ScrollText, to: '/emergency/logs' },
    { label: t('emergency.accessHistory'), description: t('emergency.accessHistoryDesc'), icon: Key, to: '/emergency/access-history' },
  ]

  return (
    <div className="space-y-6">
      {/* Emergency banner */}
      <div className={cn(
        'rounded-xl px-6 py-5',
        isActive ? 'bg-red-600' : 'bg-gradient-to-r from-red-600 to-red-700',
      )}>
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-6 w-6 text-white" />
          <p className="text-xs font-bold uppercase tracking-wider text-red-200">
            {t('emergency.securityConsole')}
          </p>
        </div>
        <h2 className="text-xl font-bold text-white">
          {fullName ?? t('common.user')}
        </h2>
        <p className="mt-1 text-sm text-red-200">
          {t('emergency.allActionsLogged')}
        </p>
      </div>

      {/* Session timer (when active) */}
      {isActive && startedAt && (
        <div className="rounded-xl border border-red-500/20 bg-card p-4">
          <EmergencyTimer startedAt={startedAt} />
        </div>
      )}

      {/* Emergency mode control */}
      {!isActive ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-foreground">{t('emergency.activateTitle')}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{t('emergency.activateDescription')}</p>
              <EmergencyActivateForm onActivate={activate} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="text-[15px] font-semibold text-red-600">{t('emergency.modeActive')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('emergency.reason')}: {reason}
                </p>
              </div>
            </div>
            <button
              onClick={deactivate}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t('emergency.deactivate')}
            </button>
          </div>
        </div>
      )}

      {/* Access restrictions info */}
      {isActive && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              label: t('emergency.accessLevel', 'Уровень доступа'),
              value: t('emergency.fullAccess', 'Полный'),
              color: 'text-red-500 bg-red-500/10',
            },
            {
              icon: ScrollText,
              label: t('emergency.logging', 'Логирование'),
              value: t('emergency.enhanced', 'Усиленное'),
              color: 'text-amber-500 bg-amber-500/10',
            },
            {
              icon: Key,
              label: t('emergency.dataMasking', 'Маскирование'),
              value: t('emergency.disabled', 'Отключено'),
              color: 'text-emerald-500 bg-emerald-500/10',
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', item.color.split(' ')[1])}>
                  <item.icon className={cn('h-4 w-4', item.color.split(' ')[0])} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="grid grid-cols-1 gap-3">
        {sections.map((s) => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <s.icon className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{s.label}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
