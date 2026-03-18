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
      .catch(() => toast.error('Failed to load consent status'))
      .finally(() => setConsentLoading(false))
  }, [orgId])

  async function handleAcceptConsent() {
    if (!orgId) return
    setConsentLoading(true)
    try {
      await acceptConsent(orgId, 'v1')
      setConsent({ accepted: true })
      toast.success('Consent accepted')
    } catch {
      toast.error('Failed to accept consent')
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
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Theme info */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0075FF]">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Appearance</h3>
        </div>
        <p className="text-sm text-white/50">
          Vision UI Dark Theme is active. This design uses a permanent dark mode for the best experience.
        </p>
      </div>

      {/* Consent */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7551FF]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Privacy Consent</h3>
        </div>
        {!orgId ? (
          <p className="text-sm text-white/40">Join an organization to manage consent.</p>
        ) : consentLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : consent?.accepted ? (
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#01B574]/20 px-4 py-1.5 text-sm font-bold text-[#01B574]">Accepted</span>
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
            Accept Consent
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31A1A]">
            <LogOut className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Sign Out</h3>
        </div>
        <p className="text-sm text-white/40 mb-4">You will be redirected to the login page.</p>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-[#E31A1A]/20 border border-[#E31A1A]/30 px-6 py-2 text-sm font-bold text-[#E31A1A] hover:bg-[#E31A1A]/30 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
