import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useUiStore } from '@/stores/uiStore'
import { getConsentStatus, acceptConsent } from '@/api/consent'
import type { ConsentStatus } from '@/types'

export default function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { orgId } = useOrgStore()
  const clearOrg = useOrgStore((s) => s.clear)
  const { theme, toggleTheme } = useUiStore()

  const [consent, setConsent] = useState<ConsentStatus | null>(null)
  const [consentLoading, setConsentLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setConsentLoading(true)
    getConsentStatus(orgId)
      .then((r) => setConsent(r.data))
      .catch(() => toast.error('Не удалось загрузить статус согласия'))
      .finally(() => setConsentLoading(false))
  }, [orgId])

  async function handleAcceptConsent() {
    if (!orgId) return
    setConsentLoading(true)
    try {
      await acceptConsent(orgId, 'v1')
      setConsent({ accepted: true })
      toast.success('Согласие принято')
    } catch {
      toast.error('Не удалось принять согласие')
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
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <Card>
        <CardHeader>
          <CardTitle>Тема</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Тёмная тема</Label>
              <p className="text-sm text-muted-foreground">
                Текущая тема: {theme === 'dark' ? 'Тёмная' : 'Светлая'}
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Согласие</CardTitle>
        </CardHeader>
        <CardContent>
          {!orgId ? (
            <p className="text-sm text-muted-foreground">
              Присоединитесь к организации, чтобы управлять согласием.
            </p>
          ) : consentLoading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : consent?.accepted ? (
            <div className="flex items-center gap-3">
              <Badge variant="default">Принято</Badge>
              {consent.accepted_at && (
                <span className="text-sm text-muted-foreground">
                  {new Date(consent.accepted_at).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          ) : (
            <Button onClick={handleAcceptConsent} disabled={consentLoading}>
              Принять
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Выйти</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Вы будете перенаправлены на страницу входа.
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
