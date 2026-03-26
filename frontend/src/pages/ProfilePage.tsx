import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useNavigate } from 'react-router'
import {
  Mail, MapPin, Globe, Briefcase, GraduationCap, Clock,
  Heart, Settings, FolderOpen, Users,
  Award, Star, Calendar,
} from 'lucide-react'

interface ProfileData {
  first_name?: string
  last_name?: string
  patronymic?: string
  email: string
  phone?: string
  bio?: string
  specialty?: string
  city?: string
  education?: string
  portfolio_url?: string
  experience_years?: number
  skills?: string[]
  is_looking_for_job?: boolean
  desired_salary?: number
  position?: string
  avatar_url?: string
  created_at?: string
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.email)
  const { orgs } = useOrgStore()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    getMe()
      .then(({ data }) => setProfile(data as ProfileData))
      .catch(() => toast.error(t('profile.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profile) return null

  const fullName = [profile.last_name, profile.first_name, profile.patronymic].filter(Boolean).join(' ') || email || ''
  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((w) => w!.charAt(0))
    .join('')
    .toUpperCase() || 'U'

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : null

  // Placeholder stats — will be real when backend supports
  const stats = [
    { label: t('profile.projects'), value: 0 },
    { label: t('profile.teams'), value: orgs.length },
    { label: t('profile.experience'), value: profile.experience_years ?? 0 },
  ]

  return (
    <div className="page-enter mx-auto max-w-4xl space-y-6">
      {/* Profile header — GitHub style */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="h-[120px] w-[120px] rounded-full border-2 border-border object-cover" />
          ) : (
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-border bg-primary/10 text-3xl font-bold text-primary">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
              {(profile.position || profile.specialty) && (
                <p className="mt-0.5 text-base text-muted-foreground">
                  {[profile.position, profile.specialty].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/profile/settings')}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors shrink-0"
            >
              <Settings className="h-3.5 w-3.5" />
              {t('profile.editProfile')}
            </button>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-sm text-foreground leading-relaxed max-w-lg">
              {profile.bio}
            </p>
          )}

          {/* Meta info row — GitHub style */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {profile.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />{profile.city}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />{email}
            </span>
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />{profile.portfolio_url.replace(/^https?:\/\//, '')}
              </a>
            )}
            {joinDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />{joinDate}
              </span>
            )}
          </div>

          {/* Stats row — Instagram style */}
          <div className="mt-4 flex gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="text-lg font-bold text-foreground">{s.value}</span>
                <span className="ml-1.5 text-sm text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Open to work badge */}
          {profile.is_looking_for_job && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                <Heart className="h-3 w-3" />
                {t('profile.openToWork')}
                {profile.desired_salary ? ` · ${profile.desired_salary.toLocaleString()}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — sidebar info */}
        <div className="space-y-5">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                <Award className="h-4 w-4 text-muted-foreground" />
                {t('profile.skills')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                {t('profile.education')}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.education}</p>
            </div>
          )}

          {/* Experience */}
          {profile.experience_years != null && profile.experience_years > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('profile.experience')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile.experience_years} {t('profile.years')}
              </p>
            </div>
          )}

          {/* Organizations */}
          {orgs.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.myCompanies')}
              </h3>
              <div className="space-y-2">
                {orgs.map((org) => (
                  <div key={org.orgId} className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                      {org.orgName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{org.orgName}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground capitalize">{org.role}</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <div className="flex items-center gap-px">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — pinned repos / achievements style */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pinned projects placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('profile.projects')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Empty state */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center text-center min-h-[120px]">
                <FolderOpen className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">{t('dashboard.noProjects')}</p>
              </div>
            </div>
          </div>

          {/* Teams */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('profile.teams')}
            </h3>
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center text-center min-h-[120px]">
              <Users className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">{t('profile.noTeams')}</p>
            </div>
          </div>

          {/* Achievements / Hackathons placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('profile.achievements')}
            </h3>
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center text-center min-h-[120px]">
              <Award className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">{t('profile.noAchievements')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
