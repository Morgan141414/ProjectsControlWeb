import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { AlertCircle, Plus, Shield, TrendingDown, AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectRisksPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('project.risks', 'Риски')}</h1>
          <p className="text-sm text-muted-foreground">{t('project.risksDesc', 'Управление рисками проекта')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
          <Plus className="h-4 w-4" />
          {t('project.addRisk', 'Добавить риск')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t('project.highRisks', 'Высокие'), value: 0, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
          { label: t('project.mediumRisks', 'Средние'), value: 0, icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10' },
          { label: t('project.mitigated', 'Снижены'), value: 0, icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' },
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
          icon={TrendingDown}
          title={t('project.noRisks', 'Нет зарегистрированных рисков')}
          description={t('project.noRisksDesc', 'Добавьте риски проекта для их мониторинга и управления')}
        />
      </div>
    </div>
  )
}
