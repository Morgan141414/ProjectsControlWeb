import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Loader2 } from 'lucide-react'
import api from '@/api/client'
import { useOrgStore } from '@/stores/orgStore'

interface Vacancy {
  id: string
  title: string
  description?: string
  city?: string
  salary_from?: number
  salary_to?: number
  employment_type?: string
  experience_years?: number
  skills?: string[]
  is_active: boolean
  created_at: string
}

export default function VacancyDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orgId || !id) return
    api.get<Vacancy>(`/orgs/${orgId}/vacancies/${id}`)
      .then(({ data }) => setVacancy(data))
      .catch(() => setVacancy(null))
      .finally(() => setLoading(false))
  }, [orgId, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="page-enter space-y-6">
        <Link to="/vacancies" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">{t('vacancies.notFound')}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-6">
      <Link to="/vacancies" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t('vacancies.backToList')}
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <PageHeader title={vacancy.title} />

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {vacancy.city && (
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{vacancy.city}</span>
          )}
          {vacancy.employment_type && (
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{vacancy.employment_type}</span>
          )}
          {vacancy.experience_years != null && (
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{vacancy.experience_years} {t('profile.years')}</span>
          )}
          {(vacancy.salary_from || vacancy.salary_to) && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              {vacancy.salary_from && vacancy.salary_to
                ? `${vacancy.salary_from.toLocaleString()} – ${vacancy.salary_to.toLocaleString()}`
                : vacancy.salary_from
                  ? `${t('vacancies.from')} ${vacancy.salary_from.toLocaleString()}`
                  : `${t('vacancies.to')} ${vacancy.salary_to!.toLocaleString()}`
              }
            </span>
          )}
        </div>

        {vacancy.skills && vacancy.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {vacancy.skills.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s}</span>
            ))}
          </div>
        )}

        {vacancy.description && (
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-base font-semibold text-foreground mb-3">{t('vacancies.description')}</h3>
            <div className="prose prose-sm text-foreground/80 whitespace-pre-wrap">{vacancy.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}
