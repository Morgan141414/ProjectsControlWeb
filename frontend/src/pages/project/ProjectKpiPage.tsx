import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { BarChart3, TrendingUp, Target, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectKpiPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('project.kpi', 'KPI')}</h1>
        <p className="text-sm text-muted-foreground">{t('project.kpiDesc', 'Ключевые показатели эффективности проекта')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('project.velocity', 'Velocity'), value: '—', icon: TrendingUp, color: 'text-violet-500 bg-violet-500/10' },
          { label: t('project.completion', 'Прогресс'), value: '—', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: t('project.teamLoad', 'Загрузка команды'), value: '—', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
          { label: t('project.quality', 'Качество'), value: '—', icon: BarChart3, color: 'text-amber-500 bg-amber-500/10' },
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
          icon={BarChart3}
          title={t('project.noKpiData', 'Нет данных KPI')}
          description={t('project.noKpiDataDesc', 'KPI рассчитываются на основе задач проекта. Создайте задачи для начала отслеживания.')}
        />
      </div>
    </div>
  )
}
