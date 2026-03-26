import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { FolderKanban, ArrowRight, Plus, Loader2 } from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { useProjects } from '@/hooks/useProjects'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingState'

export default function ProjectSelectorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeOrgId } = useOrgStore()
  const { data: projects, isLoading } = useProjects(activeOrgId ?? '')

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
          <FolderKanban className="h-7 w-7 text-violet-500" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{t('project.selectProject', 'Выберите проект')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('project.selectProjectDesc', 'Выберите проект для перехода в рабочее пространство')}
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t('project.noProjects', 'Нет проектов')}
          description={t('project.noProjectsDesc', 'Проекты появятся здесь после их создания')}
          action={
            <button
              onClick={() => navigate('/company/projects')}
              className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('project.createProject', 'Создать проект')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:border-violet-500/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <FolderKanban className="h-5 w-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
                {project.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
