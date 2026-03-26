import { useTranslation } from 'react-i18next'
import { useOrgStore } from '@/stores/orgStore'
import { useUsers } from '@/hooks/useAdmin'
import { Building2, Users, Search, Shield, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ROLE_LABELS } from '@/types'
import type { OrgRole } from '@/types'
import { DataMask } from '@/components/shared/DataMask'

const ROLE_COLORS: Partial<Record<OrgRole, string>> = {
  super_ceo: 'bg-red-500/10 text-red-600',
  ceo: 'bg-red-500/10 text-red-600',
  superadmin: 'bg-blue-500/10 text-blue-600',
  hr: 'bg-emerald-500/10 text-emerald-600',
  sysadmin: 'bg-blue-500/10 text-blue-600',
  team_lead: 'bg-amber-500/10 text-amber-600',
  project_manager: 'bg-amber-500/10 text-amber-600',
  developer: 'bg-violet-500/10 text-violet-600',
  founder: 'bg-amber-500/10 text-amber-600',
  member: 'bg-gray-500/10 text-gray-600',
}

export default function CompanyPeoplePage() {
  const { t } = useTranslation()
  const { activeOrgId } = useOrgStore()
  const { data: users, isLoading } = useUsers(activeOrgId ?? '')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('company.noOrgSelected')}</h2>
        <p className="text-sm text-muted-foreground">{t('company.selectOrgHint')}</p>
      </div>
    )
  }

  const filtered = (users ?? []).filter((u: any) => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.org_role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleCounts: Record<string, number> = {}
  for (const u of users ?? []) {
    const r = (u as any).org_role || 'member'
    roleCounts[r] = (roleCounts[r] || 0) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('nav.people')}</h1>
          <p className="text-sm text-muted-foreground">
            {(users ?? []).length} {t('company.totalEmployees', 'сотрудников')}
          </p>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRoleFilter('all')}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            roleFilter === 'all'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-accent'
          }`}
        >
          {t('common.all', 'Все')} ({(users ?? []).length})
        </button>
        {Object.entries(roleCounts).map(([role, count]) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              roleFilter === role
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            {ROLE_LABELS[role as OrgRole] || role} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('profile.fullName')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('auth.email')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('reports.role')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('profile.position')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: any) => {
                const role = (user.org_role || 'member') as OrgRole
                const colorClass = ROLE_COLORS[role] || 'bg-gray-500/10 text-gray-600'
                return (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-foreground">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <DataMask maskedValue="••••@••••.••">{user.email}</DataMask>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[role] || role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.position || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
