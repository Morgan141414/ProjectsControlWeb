import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Clock, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectDeadlinesPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('project.deadlines', 'Дедлайны')}</h1>
        <p className="text-sm text-muted-foreground">{t('project.deadlinesDesc', 'Сроки и контрольные точки проекта')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t('project.overdue', 'Просрочено'), value: 0, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
          { label: t('project.upcoming', 'Предстоящие'), value: 0, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { label: t('project.completed', 'Завершены'), value: 0, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <EmptyState
          icon={CalendarDays}
          title={t('project.noDeadlines', 'Нет дедлайнов')}
          description={t('project.noDeadlinesDesc', 'Дедлайны задач появятся здесь автоматически')}
        />
      </div>
    </div>
  )
}
