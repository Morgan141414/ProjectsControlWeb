import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
<<<<<<< HEAD
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
=======
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { getConsentStatus, acceptConsent } from '@/api/consent'
import type { ConsentStatus } from '@/types'
import { LogOut, Shield, Palette, CheckCircle2, XCircle, AlertTriangle, Moon, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { orgId } = useOrgStore()
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  const clearOrg = useOrgStore((s) => s.clear)

  const [consent, setConsent] = useState<ConsentStatus | null>(null)
  const [consentLoading, setConsentLoading] = useState(false)

<<<<<<< HEAD
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

=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  useEffect(() => {
    if (!orgId) return
    setConsentLoading(true)
    getConsentStatus(orgId)
      .then((r) => setConsent(r.data))
<<<<<<< HEAD
      .catch(() => toast.error(t('settings.consentLoadError')))
=======
      .catch(() => toast.error('Не удалось загрузить статус согласия'))
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      .finally(() => setConsentLoading(false))
  }, [orgId])

  async function handleAcceptConsent() {
    if (!orgId) return
    setConsentLoading(true)
    try {
      await acceptConsent(orgId, 'v1')
      setConsent({ accepted: true })
<<<<<<< HEAD
      toast.success(t('settings.consentAcceptSuccess'))
    } catch {
      toast.error(t('settings.consentAcceptError'))
=======
      toast.success('Согласие принято')
    } catch {
      toast.error('Не удалось принять согласие')
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
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
<<<<<<< HEAD
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
=======
      {/* Page title */}
      <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        <h1
          className="text-3xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #868CFF, #4318FF, #0075FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}
        >
          Настройки
        </h1>
        <p className="mt-1 text-sm text-white/40">Управление приложением и аккаунтом</p>
      </div>

      {/* Theme info card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.05s both' }}
      >
        {/* Gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #0075FF, #7551FF, #C851FF)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
          >
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Внешний вид</h3>
            <p className="text-xs text-white/40">Текущая тема оформления</p>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Dark mode decorative illustration */}
          <div className="absolute -right-4 -top-4 opacity-[0.07]">
            <Moon className="h-32 w-32 text-[#7551FF]" />
          </div>
          <div className="absolute right-8 bottom-3 opacity-[0.05]">
            <Sparkles className="h-16 w-16 text-[#0075FF]" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3.5 w-3.5 rounded-full bg-[#0075FF] shadow-[0_0_8px_rgba(0,117,255,0.4)]" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#7551FF] shadow-[0_0_8px_rgba(117,81,255,0.4)]" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#01B574] shadow-[0_0_8px_rgba(1,181,116,0.4)]" />
            </div>
            <span className="text-sm font-semibold text-white">Vision UI Dark</span>
            <span
              className="ml-auto rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#01B574]"
              style={{ background: 'rgba(1, 181, 116, 0.12)', border: '1px solid rgba(1, 181, 116, 0.15)' }}
            >
              Активна
            </span>
          </div>
          <p className="relative mt-3 text-xs text-white/40 leading-relaxed">
            Активна тёмная тема Vision UI. Этот дизайн использует постоянный тёмный режим
            для комфортной работы в любых условиях освещения.
          </p>
        </div>
      </div>

      {/* Consent card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}
      >
        {/* Purple accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #7551FF, #C851FF)' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #7551FF, #C851FF)' }}
          >
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Согласие на обработку данных</h3>
            <p className="text-xs text-white/40">Политика конфиденциальности и обработки</p>
          </div>

          {/* Status badge */}
          {orgId && !consentLoading && (
            consent?.accepted ? (
              <div
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold"
                style={{ background: 'rgba(1, 181, 116, 0.12)', color: '#01B574', border: '1px solid rgba(1, 181, 116, 0.15)' }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Активно
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold"
                style={{ background: 'rgba(255, 181, 71, 0.12)', color: '#FFB547', border: '1px solid rgba(255, 181, 71, 0.15)' }}
              >
                <XCircle className="h-3.5 w-3.5" />
                Не принято
              </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
            )
          )}
        </div>

        {!orgId ? (
<<<<<<< HEAD
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
=======
          <div
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: 'rgba(255, 181, 71, 0.06)', border: '1px solid rgba(255, 181, 71, 0.15)' }}
          >
            <AlertTriangle className="h-5 w-5 text-[#FFB547] shrink-0" />
            <p className="text-sm text-white/60">
              Присоединитесь к организации для управления согласием на обработку данных.
            </p>
          </div>
        ) : consentLoading ? (
          <div className="flex items-center gap-3 py-4">
            <div
              className="h-5 w-5 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#7551FF', animation: 'spinSlow 1s linear infinite' }}
            />
            <p className="text-sm text-white/40">Загрузка статуса...</p>
          </div>
        ) : consent?.accepted ? (
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(1, 181, 116, 0.06)', border: '1px solid rgba(1, 181, 116, 0.12)' }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#01B574]" />
              <div>
                <p className="text-sm font-medium text-white">Согласие принято</p>
                {consent.accepted_at && (
                  <p className="text-xs text-white/40 mt-0.5">
                    Дата принятия: {new Date(consent.accepted_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/50">
              Для продолжения работы необходимо принять согласие на обработку персональных данных.
            </p>
            <button
              onClick={handleAcceptConsent}
              disabled={consentLoading}
              className="btn-primary self-start flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              Принять согласие
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
            </button>
          </div>
        )}
      </div>

<<<<<<< HEAD
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
=======
      {/* Logout card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.15s both' }}
      >
        {/* Red accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #E31A1A, #FF6B6B)' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #E31A1A, #FF4444)' }}
          >
            <LogOut className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Выход из аккаунта</h3>
            <p className="text-xs text-white/40">Завершение текущей сессии</p>
          </div>
        </div>

        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: 'rgba(227, 26, 26, 0.04)', border: '1px solid rgba(227, 26, 26, 0.1)' }}
        >
          <p className="text-sm text-white/50 leading-relaxed">
            После выхода вы будете перенаправлены на страницу авторизации.
            Все несохранённые данные будут потеряны.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300"
          style={{
            background: 'rgba(227, 26, 26, 0.1)',
            border: '1px solid rgba(227, 26, 26, 0.25)',
            color: '#E31A1A',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(227, 26, 26, 0.2)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(227, 26, 26, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(227, 26, 26, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Выйти из системы
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        </button>
      </div>
    </div>
  )
}
