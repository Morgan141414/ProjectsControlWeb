import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe, uploadAvatar } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router'
import {
  Save, Phone, Briefcase, GraduationCap, MapPin, Globe,
  Clock, Heart, DollarSign, ArrowLeft, Camera,
} from 'lucide-react'

const inputClass = 'w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors'
const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground'

export default function ProfileSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl)
  const token = useAuthStore((s) => s.token)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const email = useAuthStore((s) => s.email)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [education, setEducation] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [experienceYears, setExperienceYears] = useState<number | ''>('')
  const [skills, setSkills] = useState('')
  const [isLookingForJob, setIsLookingForJob] = useState(false)
  const [desiredSalary, setDesiredSalary] = useState<number | ''>('')
  const [position, setPosition] = useState('')
  const [avatarUrl, setAvatarUrlLocal] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setFirstName(data.first_name ?? '')
        setLastName(data.last_name ?? '')
        setPatronymic(data.patronymic ?? '')
        setPhone(data.phone ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? '')
        setCity(data.city ?? '')
        setEducation(data.education ?? '')
        setPortfolioUrl(data.portfolio_url ?? '')
        setExperienceYears(data.experience_years ?? '')
        setSkills(data.skills?.join(', ') ?? '')
        setIsLookingForJob(data.is_looking_for_job ?? false)
        setDesiredSalary(data.desired_salary ?? '')
        setPosition(data.position ?? '')
        setAvatarUrlLocal(data.avatar_url ?? null)
        // Sync avatar to global store
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
      })
      .catch(() => toast.error(t('profile.loadError')))
      .finally(() => setLoading(false))
  }, [t, setAvatarUrl])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const { data } = await uploadAvatar(file)
      setAvatarUrlLocal(data.avatar_url)
      // Update global authStore so Header and Sidebar show new avatar
      setAvatarUrl(data.avatar_url)
      toast.success(t('profile.avatarUpdated'))
    } catch {
      toast.error(t('profile.avatarError'))
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase() || 'U'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const computedFullName = [lastName, firstName, patronymic].filter(Boolean).join(' ')
      const payload: Partial<Omit<User, 'id' | 'email'>> = {
        full_name: computedFullName || firstName || 'User',
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        patronymic: patronymic || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        specialty: specialty || undefined,
        city: city || undefined,
        education: education || undefined,
        portfolio_url: portfolioUrl || undefined,
        experience_years: experienceYears !== '' ? Number(experienceYears) : undefined,
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        is_looking_for_job: isLookingForJob,
        desired_salary: desiredSalary !== '' ? Number(desiredSalary) : undefined,
        position: position || undefined,
      }
      const { data: updated } = await updateMe(payload)
      if (token) {
        setAuth(token, refreshToken, {
          id: updated.id,
          email: updated.email,
          full_name: updated.full_name,
          patronymic: updated.patronymic,
          avatar_url: avatarUrl,
        })
      }
      toast.success(t('profile.saveSuccess'))
    } catch {
      toast.error(t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{t('profile.profileSettings')}</h1>
          <p className="text-sm text-muted-foreground">{t('profile.profileSettingsDesc')}</p>
        </div>
      </div>

      {/* Avatar section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('profile.avatar')}</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {initials}
              </div>
            )}
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('profile.avatarHintShort')}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{t('profile.personalInfo')}</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t('profile.lastName')}</label>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('profile.firstName')}</label>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('profile.patronymic')}</label>
              <input value={patronymic} onChange={(e) => setPatronymic(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('profile.bio')}</label>
            <textarea rows={3} placeholder={t('profile.bioPlaceholder')} value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none" />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{t('profile.contactInfo')}</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{t('profile.phone')}</span>
              </label>
              <input type="tel" placeholder={t('profile.phonePlaceholder')} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('profile.email')}</label>
              <input disabled value={email ?? ''} className="w-full h-9 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{t('profile.portfolio')}</span>
            </label>
            <input type="url" placeholder="https://..." value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Professional */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{t('profile.professionalInfo')}</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{t('profile.position')}</span>
              </label>
              <input placeholder={t('profile.positionPlaceholder')} value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('profile.specialty')}</label>
              <input placeholder={t('profile.specialtyPlaceholder')} value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t('profile.city')}</span>
              </label>
              <input placeholder={t('profile.cityPlaceholder')} value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{t('profile.education')}</span>
              </label>
              <input placeholder={t('profile.educationPlaceholder')} value={education} onChange={(e) => setEducation(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t('profile.experience')}</span>
              </label>
              <input type="number" min={0} max={50} placeholder="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('profile.skills')}</label>
            <input placeholder={t('profile.skillsPlaceholder')} value={skills} onChange={(e) => setSkills(e.target.value)} className={inputClass} />
            <p className="mt-1 text-[11px] text-muted-foreground">{t('profile.skillsHint')}</p>
          </div>
        </div>

        {/* Job search */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{t('profile.jobSearch')}</h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isLookingForJob} onChange={(e) => setIsLookingForJob(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Heart className="h-3.5 w-3.5" />
              {t('profile.lookingForJob')}
            </span>
          </label>

          {isLookingForJob && (
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{t('profile.desiredSalary')}</span>
              </label>
              <input type="number" min={0} placeholder="0" value={desiredSalary} onChange={(e) => setDesiredSalary(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? t('common.saving') : t('common.saveChanges')}
        </button>
      </form>
    </div>
  )
}
