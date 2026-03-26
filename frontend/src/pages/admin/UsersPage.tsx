import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listUsers } from '@/api/users'
import type { User } from '@/types'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function UsersPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listUsers(orgId)
      setUsers(r.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.usersTab')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <PageHeader title={t('admin.usersTab')} />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">{t('admin.members')}</span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{users.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No users</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2 font-medium text-foreground">{u.full_name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2">
                    <StatusBadge variant={u.org_role === 'super_ceo' || u.org_role === 'ceo' ? 'error' : u.org_role === 'team_lead' || u.org_role === 'project_manager' ? 'warning' : 'info'}>
                      {u.org_role ?? 'member'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
