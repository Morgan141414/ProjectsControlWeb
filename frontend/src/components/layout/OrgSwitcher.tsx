import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, ChevronDown, Plus, User, Check } from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { useMyOrgs } from '@/hooks/useOrg'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  director: 'Director',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  project_manager: 'PM',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
}

export function OrgSwitcher({ onCreateOrg }: { onCreateOrg?: () => void }) {
  const { t } = useTranslation()
  const { orgs, activeOrgId, setActiveOrg, activeOrg } = useOrgStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch orgs on mount
  useMyOrgs()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = activeOrg()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent w-full"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
          {current ? (
            <Building2 className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate font-medium text-foreground text-sm">
            {current ? current.orgName : t('orgSwitcher.personal')}
          </p>
          {current && (
            <p className="text-[10px] text-muted-foreground">
              {ROLE_LABELS[current.role] || current.role}
            </p>
          )}
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          open && 'rotate-180'
        )} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[220px] rounded-lg border border-border bg-card shadow-lg z-50">
          {/* Personal dashboard */}
          <button
            onClick={() => { setActiveOrg(null); setOpen(false) }}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent',
              !activeOrgId && 'bg-primary/5'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left text-foreground">{t('orgSwitcher.personal')}</span>
            {!activeOrgId && <Check className="h-4 w-4 text-primary" />}
          </button>

          {orgs.length > 0 && <div className="h-px bg-border mx-2" />}

          {/* Org list */}
          <div className="max-h-[240px] overflow-y-auto">
            {orgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => { setActiveOrg(org.orgId); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent',
                  activeOrgId === org.orgId && 'bg-primary/5'
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-foreground">{org.orgName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ROLE_LABELS[org.role] || org.role}
                  </p>
                </div>
                {activeOrgId === org.orgId && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>

          <div className="h-px bg-border mx-2" />

          {/* Create new org */}
          <button
            onClick={() => { onCreateOrg?.(); setOpen(false) }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-border">
              <Plus className="h-4 w-4" />
            </div>
            <span>{t('orgSwitcher.createOrg')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
