import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { listOrgs, suspendOrg, activateOrg, issueCertificate } from '@/api/adminPlatform'
import type { Org } from '@/types'
import { Building2, Loader2, ShieldCheck, ShieldOff, Award } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listOrgs()
      setOrgs(r.data)
    } catch {
      toast.error(t('superadmin.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  async function handleSuspend(orgId: string) {
    try {
      await suspendOrg(orgId)
      toast.success(t('superadmin.orgSuspended'))
      load()
    } catch {
      toast.error(t('superadmin.suspendError'))
    }
  }

  async function handleActivate(orgId: string) {
    try {
      await activateOrg(orgId)
      toast.success(t('superadmin.orgActivated'))
      load()
    } catch {
      toast.error(t('superadmin.activateError'))
    }
  }

  async function handleIssueCert(orgId: string) {
    try {
      await issueCertificate(orgId)
      toast.success(t('superadmin.certIssued'))
    } catch {
      toast.error(t('superadmin.certIssueError'))
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageHeader title={t('superadmin.companies')} description={t('superadmin.companiesDesc')} />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">{t('superadmin.noCompanies')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('superadmin.name')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('superadmin.code')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('superadmin.industry')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('superadmin.status')}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2 font-medium text-foreground">{org.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{org.code}</td>
                  <td className="px-4 py-2 text-muted-foreground">{org.industry || '—'}</td>
                  <td className="px-4 py-2">
                    {org.is_active !== false ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        {t('superadmin.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                        {t('superadmin.suspended')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      {org.is_active !== false ? (
                        <button onClick={() => handleSuspend(org.id)}
                          className="flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30">
                          <ShieldOff className="h-3 w-3" /> {t('superadmin.suspend')}
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(org.id)}
                          className="flex items-center gap-1 rounded-md bg-green-100 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30">
                          <ShieldCheck className="h-3 w-3" /> {t('superadmin.activate')}
                        </button>
                      )}
                      <button onClick={() => handleIssueCert(org.id)}
                        className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                        <Award className="h-3 w-3" /> {t('superadmin.issueCert')}
                      </button>
                    </div>
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
