import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Building2, Users, AlertTriangle, Activity, Shield, ArrowRight,
  Server, ScrollText,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function PlatformDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fullName = useAuthStore((s) => s.fullName)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)

  const stats = [
    { label: t('platform.totalCompanies'), value: '—', icon: Building2, to: '/platform/companies' },
    { label: t('platform.activeUsers'), value: '—', icon: Users, to: '/platform/roles' },
    { label: t('platform.openIncidents'), value: '0', icon: AlertTriangle, to: '/platform/incidents' },
    { label: t('platform.systemHealth'), value: 'OK', icon: Server, to: '/platform/health' },
  ]

  const quickActions = [
    { label: t('platform.manageCompanies'), icon: Building2, to: '/platform/companies' },
    { label: t('platform.viewAuditLogs'), icon: ScrollText, to: '/platform/logs' },
    { label: t('platform.reviewIncidents'), icon: AlertTriangle, to: '/platform/incidents' },
    { label: t('platform.accessRequests'), icon: Shield, to: '/platform/access-requests' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-blue-600 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
          {t('platform.platformConsole')}
        </p>
        <h2 className="mt-1.5 text-xl font-bold text-white">
          {fullName ?? t('common.user')}
        </h2>
        <p className="mt-1 text-sm text-blue-200">
          {isSuperAdmin ? t('platform.superAdminAccess') : t('platform.platformAccess')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <s.icon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickActions.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <a.icon className="h-5 w-5 text-blue-500" />
              <span className="flex-1 text-sm font-medium text-foreground">{a.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-4 w-4 text-blue-500" />
          <h3 className="text-[15px] font-semibold text-foreground">{t('platform.recentActivity')}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">{t('platform.noRecentActivity')}</p>
        </div>
      </div>
    </div>
  )
}
