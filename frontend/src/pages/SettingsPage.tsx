import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { getConsentStatus, acceptConsent } from '@/api/consent'
import { setup2FA, verify2FA, disable2FA } from '@/api/twoFactor'
import type { ConsentStatus } from '@/types'
import { LogOut, Shield, Palette, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SettingsPage() {
  const { t } = useTranslation()
  const isDark = useUiStore((s) => s.theme === 'dark')
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const orgId = useOrgStore((s) => s.activeOrgId)
  const clearOrg = useOrgStore((s) => s.clear)

  const [consent, setConsent] = useState<ConsentStatus | null>(null)
  const [consentLoading, setConsentLoading] = useState(false)

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFAMode, setTwoFAMode] = useState<'idle' | 'setup' | 'disabling'>('idle')
  const [twoFASecret, setTwoFASecret] = useState('')
  const [twoFAUri, setTwoFAUri] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [twoFAError, setTwoFAError] = useState('')

  async function handleSetup2FA() {
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await setup2FA()
      setTwoFASecret(res.data.secret)
      setTwoFAUri(res.data.qr_uri)
      setTwoFAMode('setup')
    } catch {
      toast.error(t('settings.twoFactorSetupError'))
    } finally {
      setTwoFALoading(false)
    }
  }

  async function handleVerify2FA() {
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      await verify2FA(twoFACode)
      setTwoFAEnabled(true)
      setTwoFAMode('idle')
      setTwoFACode('')
      toast.success(t('settings.twoFactorEnabled'))
    } catch {
      setTwoFAError(t('settings.twoFactorVerifyError'))
    } finally {
      setTwoFALoading(false)
    }
  }

  async function handleDisable2FA() {
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      await disable2FA(twoFACode)
      setTwoFAEnabled(false)
      setTwoFAMode('idle')
      setTwoFACode('')
      toast.success(t('settings.twoFactorDisabled'))
    } catch {
      setTwoFAError(t('settings.twoFactorDisableError'))
    } finally {
      setTwoFALoading(false)
    }
  }

  useEffect(() => {
    if (!orgId) return
    setConsentLoading(true)
    getConsentStatus(orgId)
      .then((r) => setConsent(r.data))
      .catch(() => toast.error(t('settings.consentLoadError')))
      .finally(() => setConsentLoading(false))
  }, [orgId])

  async function handleAcceptConsent() {
    if (!orgId) return
    setConsentLoading(true)
    try {
      await acceptConsent(orgId, 'v1')
      setConsent({ accepted: true })
      toast.success(t('settings.consentAcceptSuccess'))
    } catch {
      toast.error(t('settings.consentAcceptError'))
    } finally {
      setConsentLoading(false)
    }
  }

  function handleLogout() {
    logout()
    clearOrg()
    navigate('/login')
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

      {/* Appearance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">{t('settings.appearance')}</h3>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{isDark ? 'Dark' : 'Light'} theme</p>
            <p className="text-xs text-muted-foreground">{t('settings.currentTheme')}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
          </button>
        </div>
      </div>

      {/* 2FA section */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">{t('settings.security')}</h3>
        </div>

        {twoFAMode === 'idle' && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t('settings.twoFactor')}</p>
              <p className="text-xs text-muted-foreground">
                {twoFAEnabled ? t('settings.twoFactorEnabledDesc') : t('settings.twoFactorDisabledDesc')}
              </p>
            </div>
            {twoFAEnabled ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('settings.enabled')}
                </span>
                <button
                  onClick={() => { setTwoFAMode('disabling'); setTwoFACode(''); setTwoFAError('') }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                >
                  {t('settings.disable')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSetup2FA}
                disabled={twoFALoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {twoFALoading ? t('common.loading') : t('settings.enable2FA')}
              </button>
            )}
          </div>
        )}

        {twoFAMode === 'setup' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground mb-2">{t('settings.scanQRCode')}</p>
              <div className="rounded-lg bg-background border border-border p-3 mb-3">
                <p className="text-xs text-muted-foreground break-all font-mono">{twoFAUri}</p>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{t('settings.secretKey')}</p>
              <code className="block rounded bg-background border border-border px-3 py-2 text-sm font-mono text-foreground select-all">
                {twoFASecret}
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('settings.verificationCode')}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => { setTwoFACode(e.target.value); setTwoFAError('') }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            {twoFAError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {twoFAError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleVerify2FA}
                disabled={twoFALoading || !twoFACode}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {twoFALoading ? t('common.loading') : t('settings.verify')}
              </button>
              <button
                onClick={() => { setTwoFAMode('idle'); setTwoFACode(''); setTwoFAError('') }}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {twoFAMode === 'disabling' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-foreground">{t('settings.disable2FADescription')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('settings.verificationCode')}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => { setTwoFACode(e.target.value); setTwoFAError('') }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            {twoFAError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {twoFAError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDisable2FA}
                disabled={twoFALoading || !twoFACode}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {twoFALoading ? t('common.loading') : t('settings.disable2FA')}
              </button>
              <button
                onClick={() => { setTwoFAMode('idle'); setTwoFACode(''); setTwoFAError('') }}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Consent */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">{t('settings.consent')}</h3>
          </div>
          {orgId && !consentLoading && (
            consent?.accepted ? (
              <span className="flex items-center gap-1 rounded bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {t('settings.consentActive')}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                <XCircle className="h-3 w-3" />
                {t('settings.consentNotAccepted')}
              </span>
            )
          )}
        </div>

        {!orgId ? (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t('settings.joinOrgForConsent')}
          </div>
        ) : consentLoading ? (
          <p className="text-sm text-muted-foreground">{t('settings.loadingStatus')}</p>
        ) : consent?.accepted ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t('settings.consentAccepted')}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">{t('settings.consentRequired')}</p>
            <button
              onClick={handleAcceptConsent}
              disabled={consentLoading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {t('settings.acceptConsent')}
            </button>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="rounded-lg border border-destructive/20 bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <LogOut className="h-5 w-5 text-destructive" />
          <h3 className="text-base font-semibold text-foreground">{t('settings.logoutTitle')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t('settings.logoutWarning')}</p>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
        >
          {t('settings.logoutButton')}
        </button>
      </div>
    </div>
  )
}
