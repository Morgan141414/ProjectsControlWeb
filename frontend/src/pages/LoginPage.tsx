import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { login } from '@/api/auth'
import { getMe } from '@/api/profile'
import { listMyOrgs } from '@/api/orgs'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { OAuthButtons } from '@/components/OAuthButtons'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setOrgs = useOrgStore((s) => s.setOrgs)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const { data: tokenData } = await login(email, password)
      const token = tokenData.access_token
      const refreshTkn = tokenData.refresh_token ?? null

      const storage = remember ? localStorage : sessionStorage
      storage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token, refreshToken: refreshTkn }, version: 0 }),
      )

      const { data: user } = await getMe()
      setAuth(token, refreshTkn, user, remember ? 'local' : 'session')

      try {
        const { data: orgs } = await listMyOrgs()
        setOrgs(
          orgs.map((o) => ({
            orgId: o.id,
            orgName: o.name,
            role: o.role,
            logoUrl: o.logo_url ?? undefined,
          })),
        )
      } catch {
        // not critical
      }

      navigate('/dashboard')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail
      let message: string
      if (Array.isArray(detail)) {
        message = detail.map((e: { msg?: string }) => e.msg ?? '').join('; ')
      } else if (typeof detail === 'string') {
        message = detail
      } else {
        message = t('auth.loginError')
      }
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ProjectsControl</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {t('auth.loginSubtitle')}
          </h2>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
            {t('auth.trustedBy')}
          </p>
        </div>

        <p className="text-xs text-white/40">&copy; 2024 ProjectsControl</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 sm:px-16">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">ProjectsControl</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.welcomeBack')}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage('') }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage('') }}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-border"
                />
                {t('auth.rememberMe')}
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>

          <OAuthButtons remember={remember} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
