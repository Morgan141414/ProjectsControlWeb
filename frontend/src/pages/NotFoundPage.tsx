import { Link } from 'react-router'
import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <h1 className="text-[120px] font-black leading-none text-primary/20 sm:text-[180px]">
        404
      </h1>
      <p className="mt-2 text-2xl font-bold text-foreground">{t('errors.notFound')}</p>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        {t('errors.notFoundMessage')}
      </p>
      <Link
        to="/dashboard"
        className="mt-8 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 no-underline"
      >
        <Home className="h-4 w-4" />
        {t('errors.goHome')}
      </Link>
    </div>
  )
}
