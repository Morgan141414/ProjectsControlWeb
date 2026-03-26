import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import { listProjects, createProject } from '@/api/projects'
import type { Project } from '@/types'
import { Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

export default function ProjectsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await listProjects(orgId)
      setProjects(r.data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!orgId || !name.trim()) return
    setCreating(true)
    try {
      await createProject(orgId, name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      toast.success(t('admin.createProject') + ' OK')
      load()
    } catch {
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  if (!orgId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('admin.projectsTab')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <PageHeader title={t('admin.projectsTab')} />

      {/* Create form */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.createProject')}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <input
            placeholder={t('admin.projectName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            placeholder={t('admin.description') || 'Description'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t('common.create')}
        </button>
      </div>

      {/* Projects list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">{t('admin.projectsTab')}</span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{projects.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('admin.noProjects')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('admin.projectName')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)} className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.id.slice(0, 8)}...</td>
                  <td className="px-4 py-2 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
