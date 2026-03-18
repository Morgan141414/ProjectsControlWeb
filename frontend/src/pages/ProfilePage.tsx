import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { Mail, Edit3, Save } from 'lucide-react'

export default function ProfilePage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  const email = useAuthStore((s) => s.email)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [socials, setSocials] = useState('')

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setFullName(data.full_name)
        setPatronymic(data.patronymic ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? '')
        setSocials(data.socials_json ?? '')
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: Partial<Omit<User, 'id' | 'email'>> = {
        full_name: fullName,
        patronymic: patronymic || undefined,
        bio: bio || undefined,
        specialty: specialty || undefined,
        socials_json: socials || undefined,
      }

      const { data: updated } = await updateMe(payload)

      if (token) {
        setAuth(token, {
          id: updated.id,
          email: updated.email,
          full_name: updated.full_name,
          patronymic: updated.patronymic,
        })
      }

      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="vision-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #01B574 0%, #0075FF 100%)' }}
              >
                {fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
                <Edit3 className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <p className="text-sm text-white/50">{email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-[#0075FF] px-6 py-2 text-sm font-bold text-white hover:bg-[#0063D6]">
              OVERVIEW
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-bold text-white/60 hover:text-white">
              TEAMS
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-bold text-white/60 hover:text-white">
              PROJECTS
            </button>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Welcome back card */}
        <div
          className="relative overflow-hidden rounded-[20px] p-6"
          style={{
            background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 50%, #C851FF 100%)',
            minHeight: '250px',
          }}
        >
          <div
            className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            }}
          />
          <h3 className="text-2xl font-bold text-white">Welcome back!</h3>
          <p className="mt-2 text-sm text-white/80">Nice to see you, {fullName}!</p>
          <button className="mt-4 text-sm font-bold text-white underline decoration-white/50 underline-offset-4">
            Turn on your car &rarr;
          </button>
        </div>

        {/* Profile info card */}
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
          <p className="text-sm text-white/50 mb-6">{bio || 'No bio yet. Tell us about yourself!'}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">Full Name:</span>
              <span className="text-sm font-medium text-white">{fullName}</span>
            </div>
            {patronymic && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">Patronymic:</span>
                <span className="text-sm font-medium text-white">{patronymic}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Email:</span>
              <span className="text-sm font-medium text-white">{email}</span>
            </div>
            {specialty && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">Specialty:</span>
                <span className="text-sm font-medium text-white">{specialty}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit profile form */}
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Full Name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Patronymic</label>
              <input
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">About</label>
              <textarea
                rows={3}
                placeholder="Tell about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Specialty</label>
              <input
                placeholder="Developer, Designer..."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Social Media (JSON)</label>
              <textarea
                rows={2}
                placeholder='{"telegram": "@handle"}'
                value={socials}
                onChange={(e) => setSocials(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 h-10 rounded-xl bg-[#0075FF] text-sm font-bold text-white uppercase hover:bg-[#0063D6] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase">Account</p>
            {[
              { label: 'Email me when someone follows me', checked: true },
              { label: 'Email me when someone answers to...', checked: false },
              { label: 'Email me when someone mentions me', checked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{item.label}</span>
                <div
                  className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${item.checked ? 'bg-[#0075FF]' : 'bg-white/20'}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${item.checked ? 'translate-x-5' : ''}`}
                  />
                </div>
              </div>
            ))}

            <p className="text-xs font-bold text-white/40 uppercase mt-6">Application</p>
            {[
              { label: 'New launches and projects', checked: false },
              { label: 'Monthly product updates', checked: false },
              { label: 'Subscribe to newsletter', checked: true },
              { label: 'Receive mails weekly', checked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{item.label}</span>
                <div
                  className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${item.checked ? 'bg-[#0075FF]' : 'bg-white/20'}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${item.checked ? 'translate-x-5' : ''}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-1">Projects</h3>
          <p className="text-sm text-white/40 mb-4">Architects design houses</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {['Modern', 'Scandinavian', 'Minimalist'].map((name, i) => (
              <div key={name} className="overflow-hidden rounded-xl">
                <div
                  className="h-32 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${['#0075FF', '#7551FF', '#01B574'][i]} 0%, ${['#00D1FF', '#C851FF', '#0075FF'][i]} 100%)`,
                  }}
                />
                <div className="p-3 bg-white/5 rounded-b-xl">
                  <p className="text-[10px] text-white/40">Project #{i + 1}</p>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">
                    Different design approaches for modern architecture.
                  </p>
                  <button className="mt-2 rounded-lg border border-white/10 px-3 py-1 text-xs font-bold text-white/60 hover:text-white">
                    VIEW ALL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
