import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Building2, ChevronDown, Plus, User, Check, Globe,
  FolderKanban, Scale, AlertTriangle, Shield,
} from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { useAuthStore } from '@/stores/authStore'
import { useContextStore } from '@/stores/contextStore'
import { useMyOrgs } from '@/hooks/useOrg'
import { cn } from '@/lib/utils'
import type { ShellType } from '@/types'
import { ROLE_LABELS, ROLE_ALLOWED_SHELLS } from '@/types'

const SHELL_META: Record<ShellType, { icon: typeof Building2; labelKey: string; color: string }> = {
  platform: { icon: Globe, labelKey: 'shell.platform', color: 'text-blue-500' },
  company: { icon: Building2, labelKey: 'shell.company', color: 'text-emerald-500' },
  project: { icon: FolderKanban, labelKey: 'shell.project', color: 'text-violet-500' },
  governance: { icon: Scale, labelKey: 'shell.governance', color: 'text-amber-500' },
  emergency: { icon: AlertTriangle, labelKey: 'shell.emergency', color: 'text-red-500' },
}

export function ContextSwitcher({ onCreateOrg }: { onCreateOrg?: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orgs, activeOrgId, setActiveOrg, activeOrg } = useOrgStore()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const { shell, setShell, emergencyMode } = useContextStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
  const currentRole = current?.role ?? null
  const currentShell = shell ?? 'company'
  const shellMeta = SHELL_META[currentShell]
  const ShellIcon = shellMeta.icon

  // Determine which shells the user can switch to
  const availableShells: ShellType[] = []
  if (isSuperAdmin) {
    availableShells.push('platform', 'emergency')
  }
  if (currentRole) {
    for (const s of ROLE_ALLOWED_SHELLS[currentRole]) {
      if (!availableShells.includes(s)) availableShells.push(s)
    }
  }
  if (!availableShells.includes('company')) availableShells.push('company')

  function handleShellSwitch(newShell: ShellType) {
    setShell(newShell)
    setOpen(false)
    // Navigate to the shell's root
    switch (newShell) {
      case 'platform': navigate('/platform'); break
      case 'company': navigate('/company'); break
      case 'project': navigate('/project'); break
      case 'governance': navigate('/governance'); break
      case 'emergency': navigate('/emergency'); break
    }
  }

  function handleOrgSwitch(orgId: string | null) {
    setActiveOrg(orgId)
    setOpen(false)
    if (orgId) {
      navigate('/company')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent w-full',
          emergencyMode ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-background',
        )}
      >
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-md shrink-0', emergencyMode ? 'bg-red-500/10' : 'bg-primary/10')}>
          <ShellIcon className={cn('h-4 w-4', shellMeta.color)} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate font-medium text-foreground text-sm">
            {current ? current.orgName : (isSuperAdmin ? t('shell.platform') : t('orgSwitcher.personal'))}
          </p>
          <div className="flex items-center gap-1.5">
            {emergencyMode && (
              <span className="inline-flex items-center gap-0.5 rounded bg-red-500/10 px-1 py-px text-[9px] font-semibold text-red-500 uppercase">
                <AlertTriangle className="h-2.5 w-2.5" />
                ЧП
              </span>
            )}
            <p className="text-[10px] text-muted-foreground">
              {currentRole ? ROLE_LABELS[currentRole] : (isSuperAdmin ? 'Platform Admin' : '')}
            </p>
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[260px] rounded-lg border border-border bg-card shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* Shell switcher */}
          {availableShells.length > 1 && (
            <>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {t('contextSwitcher.context')}
                </span>
              </div>
              <div className="px-1.5 pb-1">
                {availableShells.map((s) => {
                  const meta = SHELL_META[s]
                  const Icon = meta.icon
                  return (
                    <button
                      key={s}
                      onClick={() => handleShellSwitch(s)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent',
                        currentShell === s && 'bg-primary/5',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', meta.color)} />
                      <span className="flex-1 text-left text-foreground">{t(meta.labelKey)}</span>
                      {currentShell === s && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  )
                })}
              </div>
              <div className="h-px bg-border mx-2" />
            </>
          )}

          {/* Organization switcher */}
          <div className="px-3 pt-2.5 pb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {t('contextSwitcher.organizations')}
            </span>
          </div>

          {/* Personal */}
          <button
            onClick={() => handleOrgSwitch(null)}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent',
              !activeOrgId && 'bg-primary/5',
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left text-foreground">{t('orgSwitcher.personal')}</span>
            {!activeOrgId && <Check className="h-4 w-4 text-primary" />}
          </button>

          {/* Org list */}
          {orgs.map((org) => (
            <button
              key={org.orgId}
              onClick={() => handleOrgSwitch(org.orgId)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent',
                activeOrgId === org.orgId && 'bg-primary/5',
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-foreground">{org.orgName}</p>
                <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[org.role]}</p>
              </div>
              {activeOrgId === org.orgId && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}

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
