import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useOrgStore } from '@/stores/orgStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Briefcase, MapPin, Clock, Building2, Loader2, Search, DollarSign } from 'lucide-react'
import api from '@/api/client'

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

export default function VacancyCatalogPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<Vacancy[]>(`/orgs/${orgId}/vacancies`)
      setVacancies(r.data)
    } catch {
      setVacancies([])
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const filtered = vacancies.filter((v) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return v.title.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
  })

  if (!orgId) {
    return (
      <div className="page-enter space-y-6">
        <PageHeader title={t('vacancies.title')} description={t('vacancies.subtitle')} />
        <div className="flex flex-col items-center justify-center py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">{t('vacancies.joinOrg')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <PageHeader title={t('vacancies.title')} description={t('vacancies.subtitle')} />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('vacancies.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('vacancies.noVacancies')}</h3>
          <p className="text-sm text-muted-foreground">{t('vacancies.noVacanciesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              to={`/vacancies/${v.id}`}
              className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
              {v.description && (
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{v.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {v.city && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>
                )}
                {v.employment_type && (
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.employment_type}</span>
                )}
                {(v.salary_from || v.salary_to) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {v.salary_from && v.salary_to
                      ? `${v.salary_from.toLocaleString()} – ${v.salary_to.toLocaleString()}`
                      : v.salary_from
                        ? `${t('vacancies.from')} ${v.salary_from.toLocaleString()}`
                        : `${t('vacancies.to')} ${v.salary_to!.toLocaleString()}`
                    }
                  </span>
                )}
              </div>
              {v.skills && v.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {v.skills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{s}</span>
                  ))}
                  {v.skills.length > 4 && (
                    <span className="text-[11px] text-muted-foreground">+{v.skills.length - 4}</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
