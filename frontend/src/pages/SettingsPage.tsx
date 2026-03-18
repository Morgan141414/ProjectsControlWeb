import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { getConsentStatus, acceptConsent } from '@/api/consent'
import type { ConsentStatus } from '@/types'
import { LogOut, Shield, Bell } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { orgId } = useOrgStore()
  const clearOrg = useOrgStore((s) => s.clear)

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
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Настройки</h1>

      {/* Theme info */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0075FF]">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Внешний вид</h3>
        </div>
        <p className="text-sm text-white/50">
          Активна тёмная тема Vision UI. Этот дизайн использует постоянный тёмный режим.
        </p>
      </div>

      {/* Consent */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7551FF]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Согласие на обработку данных</h3>
        </div>
        {!orgId ? (
          <p className="text-sm text-white/40">Присоединитесь к организации для управления согласием.</p>
        ) : consentLoading ? (
          <p className="text-sm text-white/40">Загрузка...</p>
        ) : consent?.accepted ? (
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#01B574]/20 px-4 py-1.5 text-sm font-bold text-[#01B574]">Принято</span>
            {consent.accepted_at && (
              <span className="text-sm text-white/40">
                {new Date(consent.accepted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={handleAcceptConsent}
            disabled={consentLoading}
            className="rounded-xl bg-[#0075FF] px-6 py-2 text-sm font-bold text-white hover:bg-[#0063D6] disabled:opacity-50"
          >
            Принять согласие
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31A1A]">
            <LogOut className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Выход</h3>
        </div>
        <p className="text-sm text-white/40 mb-4">Вы будете перенаправлены на страницу входа.</p>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-[#E31A1A]/20 border border-[#E31A1A]/30 px-6 py-2 text-sm font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30 transition-colors"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}
