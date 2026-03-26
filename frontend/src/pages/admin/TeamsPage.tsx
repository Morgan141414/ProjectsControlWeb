import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listTeams, createTeam, addTeamMember } from '@/api/teams'
import type { Team } from '@/types'
import { Plus, Loader2, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

export default function TeamsPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [creating, setCreating] = useState(false)
  const [memberTeamId, setMemberTeamId] = useState('')
  const [memberUserId, setMemberUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listTeams(orgId)
      setTeams(r.data)
    } catch {
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!orgId || !teamName.trim()) return
    setCreating(true)
    try {
      await createTeam(orgId, teamName.trim(), projectId.trim() || undefined)
      setTeamName('')
      setProjectId('')
      toast.success(t('admin.createTeam') + ' OK')
      load()
    } catch {
      toast.error('Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  async function handleAddMember() {
    if (!orgId || !memberTeamId || !memberUserId.trim()) return
    setAddingMember(true)
    try {
      await addTeamMember(orgId, memberTeamId, memberUserId.trim())
      setMemberUserId('')
      toast.success(t('admin.addMember') + ' OK')
      load()
    } catch {
      toast.error('Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.teamsTab')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <PageHeader title={t('admin.teamsTab')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Create team */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.createTeam')}</h3>
          <div className="space-y-3 mb-3">
            <input placeholder={t('admin.teamName')} value={teamName} onChange={(e) => setTeamName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input placeholder="Project ID (optional)" value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <button onClick={handleCreate} disabled={creating || !teamName.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t('common.create')}
          </button>
        </div>

        {/* Add member */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.addMember')}</h3>
          <div className="space-y-3 mb-3">
            <select value={memberTeamId} onChange={(e) => setMemberTeamId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
              <option value="">Select team...</option>
              {teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
            <input placeholder="User ID" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <button onClick={handleAddMember} disabled={addingMember || !memberTeamId || !memberUserId.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t('admin.addMember')}
          </button>
        </div>
      </div>

      {/* Teams list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">{t('admin.teamsTab')}</span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{teams.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : teams.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('admin.noTeams')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('admin.teamName')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Project</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((tm) => (
                <tr key={tm.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{tm.id.slice(0, 8)}...</td>
                  <td className="px-4 py-2 font-medium text-foreground">{tm.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{tm.project_id ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
