import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { forgotPassword } from '@/api/auth'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      toast.error(t('auth.forgotPasswordError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center bg-primary">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white">ProjectsControl</h2>
          <p className="mt-2 text-white/60 text-lg">{t('auth.resetPassword')}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.forgotPassword')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.forgotPasswordSubtitle')}</p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-sm text-foreground">{t('auth.resetLinkSent')}</p>
              <Link to="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {loading ? t('common.loading') : t('auth.sendResetLink')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">{t('auth.backToLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
