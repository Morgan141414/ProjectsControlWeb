import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { register, login } from '@/api/auth'
import { getMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { OAuthButtons } from '@/components/OAuthButtons'
import axios from 'axios'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function extractError(err: unknown, fallback: string): string {
    if (!axios.isAxiosError(err)) return fallback
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) {
      return detail
        .map((e: { msg?: string }) => (e.msg ?? '').replace(/^Value error,\s*/i, ''))
        .filter(Boolean)
        .join('; ') || fallback
    }
    if (typeof detail === 'string') return detail
    if (err.response?.status === 429) return t('auth.tooManyAttempts')
    return fallback
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await register(email, password, fullName)
    } catch (err: unknown) {
      setErrorMessage(extractError(err, t('auth.registerError')))
      setLoading(false)
      return
    }

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
      navigate('/dashboard')
    } catch (err: unknown) {
      setErrorMessage(extractError(err, t('auth.loginError')))
    } finally {
      setLoading(false)
    }
  }

  function clearError() {
    if (errorMessage) setErrorMessage('')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ProjectsControl</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {t('auth.registerSubtitle')}
          </h2>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
            {t('auth.trustedBy')}
          </p>
        </div>

        <p className="text-xs text-white/40">&copy; 2024 ProjectsControl</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 sm:px-16">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">ProjectsControl</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.welcomeNew')}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                placeholder={t('auth.namePlaceholder')}
                required
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearError() }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError() }}
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
                  placeholder={t('auth.passwordMinLength')}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError() }}
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
              <p className="mt-1 text-xs text-muted-foreground">{t('auth.passwordRequirements')}</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-border"
              />
              {t('auth.rememberMe')}
            </label>

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
              {loading ? t('auth.registering') : t('auth.registerButton')}
            </button>
          </form>

          <OAuthButtons remember={remember} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
