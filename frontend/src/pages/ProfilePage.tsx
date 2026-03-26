import { useEffect, useState } from 'react'
<<<<<<< HEAD
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
=======
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import {
  Mail, Edit3, Save, User as UserIcon, Briefcase, FileText,
  Link2, Users, FolderOpen, Settings, Bell, Rocket, Newspaper,
  CalendarDays, AtSign, MessageSquare,
} from 'lucide-react'

type ProfileTab = 'overview' | 'teams' | 'projects'

export default function ProfilePage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  const email = useAuthStore((s) => s.email)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')

  const [fullName, setFullName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [socials, setSocials] = useState('')

  // Platform Settings toggles
  const [emailOnFollow, setEmailOnFollow] = useState(true)
  const [emailOnAnswer, setEmailOnAnswer] = useState(false)
  const [emailOnMention, setEmailOnMention] = useState(true)
  const [newLaunches, setNewLaunches] = useState(false)
  const [monthlyUpdates, setMonthlyUpdates] = useState(false)
  const [newsletter, setNewsletter] = useState(true)
  const [weeklyMails, setWeeklyMails] = useState(true)

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setFullName(data.full_name)
        setPatronymic(data.patronymic ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? '')
        setSocials(data.socials_json ?? '')
      })
      .catch(() => toast.error('Не удалось загрузить профиль'))
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

      toast.success('Профиль обновлён')
    } catch {
      toast.error('Не удалось сохранить профиль')
    } finally {
      setSaving(false)
    }
  }
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
<<<<<<< HEAD
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
=======
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#0075FF',
              animation: 'spinSlow 1s linear infinite',
            }}
          />
          <p className="text-sm text-white/40">Загрузка профиля...</p>
        </div>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      </div>
    )
  }

<<<<<<< HEAD
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
=======
  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'ОБЗОР', icon: <UserIcon className="h-4 w-4" /> },
    { key: 'teams', label: 'КОМАНДЫ', icon: <Users className="h-4 w-4" /> },
    { key: 'projects', label: 'ПРОЕКТЫ', icon: <FolderOpen className="h-4 w-4" /> },
  ]

  const accountToggles = [
    { label: 'Уведомлять по email при подписке', desc: 'Получайте уведомления, когда кто-то подписывается на вас', value: emailOnFollow, setter: setEmailOnFollow, icon: <Bell className="h-4 w-4" /> },
    { label: 'Уведомлять по email при ответе', desc: 'Уведомления о новых ответах на ваши сообщения', value: emailOnAnswer, setter: setEmailOnAnswer, icon: <MessageSquare className="h-4 w-4" /> },
    { label: 'Уведомлять по email при упоминании', desc: 'Узнайте, когда вас упоминают в обсуждениях', value: emailOnMention, setter: setEmailOnMention, icon: <AtSign className="h-4 w-4" /> },
  ]

  const appToggles = [
    { label: 'Новые запуски и проекты', desc: 'Уведомления о новых проектах на платформе', value: newLaunches, setter: setNewLaunches, icon: <Rocket className="h-4 w-4" /> },
    { label: 'Ежемесячные обновления', desc: 'Сводка изменений и обновлений за месяц', value: monthlyUpdates, setter: setMonthlyUpdates, icon: <CalendarDays className="h-4 w-4" /> },
    { label: 'Подписка на рассылку', desc: 'Новости, статьи и полезные материалы', value: newsletter, setter: setNewsletter, icon: <Newspaper className="h-4 w-4" /> },
    { label: 'Еженедельные письма', desc: 'Краткая сводка активности за неделю', value: weeklyMails, setter: setWeeklyMails, icon: <Mail className="h-4 w-4" /> },
  ]

  const initials = fullName
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="page-enter space-y-6">
      {/* =========== PROFILE HEADER =========== */}
      <div className="vision-card relative overflow-hidden p-8">
        {/* Subtle top gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #0075FF, #7551FF, #C851FF, #0075FF)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar + Info */}
          <div className="flex items-center gap-5">
            {/* Animated conic-gradient spinning border */}
            <div className="relative">
              <div
                className="absolute -inset-[3px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #0075FF, #7551FF, #C851FF, #01B574, #0075FF)',
                  animation: 'spinSlow 4s linear infinite',
                  filter: 'blur(4px)',
                  opacity: 0.7,
                }}
              />
              <div
                className="absolute -inset-[3px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #0075FF, #7551FF, #C851FF, #01B574, #0075FF)',
                  animation: 'spinSlow 4s linear infinite',
                }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 100%)' }}
              >
                {initials}
              </div>
              <button
                className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#060B26] text-white transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <div className="mt-1 flex items-center gap-2 text-white/50">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-sm">{email}</span>
              </div>
              {specialty && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1" style={{ background: 'rgba(117, 81, 255, 0.12)', border: '1px solid rgba(117, 81, 255, 0.2)' }}>
                  <Briefcase className="h-3 w-3 text-[#7551FF]" />
                  <span className="text-xs font-semibold text-[#7551FF]">{specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab pills with sliding indicator */}
          <div
            className="relative flex gap-1 rounded-2xl p-1.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative z-10 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300"
                style={
                  activeTab === tab.key
                    ? {
                        background: 'linear-gradient(135deg, #0075FF 0%, #2563EB 100%)',
                        boxShadow: '0 4px 20px rgba(0, 117, 255, 0.35)',
                        color: '#fff',
                      }
                    : {
                        color: 'rgba(255,255,255,0.4)',
                      }
                }
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========== OVERVIEW TAB =========== */}
      {activeTab === 'overview' && (
        <div
          key="overview"
          className="grid grid-cols-1 gap-6 xl:grid-cols-3"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          {/* Welcome card */}
          <div
            className="relative overflow-hidden rounded-[20px] p-8"
            style={{
              background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 50%, #C851FF 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 6s ease infinite',
              minHeight: '280px',
            }}
          >
            {/* Floating orbs */}
            <div
              className="absolute -right-8 -top-8 h-44 w-44 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)', animation: 'orbFloat1 8s ease-in-out infinite' }}
            />
            <div
              className="absolute -left-6 -bottom-6 h-36 w-36 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', animation: 'orbFloat2 10s ease-in-out infinite' }}
            />
            <div
              className="absolute right-10 bottom-10 h-20 w-20 rounded-full"
              style={{
                border: '2px solid rgba(255,255,255,0.2)',
                animation: 'float 4s ease-in-out infinite',
              }}
            />
            <div
              className="absolute left-1/2 top-1/3 h-3 w-3 rounded-full bg-white/30"
              style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
            />

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Добро пожаловать</p>
              <h3 className="mt-3 text-3xl font-bold text-white">С возвращением!</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Рады видеть вас, {fullName}! Это ваша панель профиля.
                Здесь вы можете управлять своими данными, настройками и проектами.
              </p>
              <div
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white/90"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
              >
                <Settings className="h-3.5 w-3.5" />
                Настройте свой профиль ниже
              </div>
            </div>
          </div>

          {/* Profile info card */}
          <div className="vision-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Информация о профиле</h3>
            </div>

            <p className="text-sm leading-relaxed text-white/50 mb-6">
              {bio || 'Пока нет описания. Расскажите о себе в разделе редактирования!'}
            </p>

            <div className="space-y-1">
              {[
                { icon: <UserIcon className="h-4 w-4" />, label: 'Полное имя', value: fullName },
                ...(patronymic
                  ? [{ icon: <UserIcon className="h-4 w-4" />, label: 'Отчество', value: patronymic }]
                  : []),
                { icon: <Mail className="h-4 w-4" />, label: 'Email', value: email },
                ...(specialty
                  ? [{ icon: <Briefcase className="h-4 w-4" />, label: 'Специальность', value: specialty }]
                  : []),
                ...(socials
                  ? [{ icon: <Link2 className="h-4 w-4" />, label: 'Соц. сети', value: socials }]
                  : []),
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-white/[0.04]"
                  style={{
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(0, 117, 255, 0.1)' }}
                  >
                    <span className="text-[#0075FF]">{row.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-white/40 w-24 shrink-0">{row.label}</span>
                  <span className="text-sm font-medium text-white truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit profile form */}
          <div className="vision-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #01B574, #0075FF)' }}
              >
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Редактировать профиль</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Полное имя</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Отчество</label>
                <input
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">О себе</label>
                <textarea
                  rows={3}
                  placeholder="Расскажите о себе..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="vision-input w-full px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Специальность</label>
                <input
                  placeholder="Разработчик, Дизайнер..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Соц. сети (JSON)</label>
                <textarea
                  rows={2}
                  placeholder='{"telegram": "@handle"}'
                  value={socials}
                  onChange={(e) => setSocials(e.target.value)}
                  className="vision-input w-full px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold text-white uppercase tracking-wide disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========== TEAMS TAB =========== */}
      {activeTab === 'teams' && (
        <div
          key="teams"
          className="vision-card p-10"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Decorative background orb */}
            <div className="relative mb-8">
              <div
                className="absolute -inset-6 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, #7551FF 0%, transparent 70%)',
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}
              />
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(117, 81, 255, 0.15), rgba(0, 117, 255, 0.15))',
                  border: '1px solid rgba(117, 81, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                <Users className="h-14 w-14 text-[#7551FF]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Нет команд</h3>
            <p className="text-sm text-white/40 max-w-md leading-relaxed">
              Вы пока не состоите ни в одной команде. Присоединитесь к существующей
              команде или создайте новую для совместной работы над проектами.
            </p>
            <button
              className="btn-primary mt-8 flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white"
            >
              <Users className="h-4 w-4" />
              Найти команду
            </button>
          </div>
        </div>
      )}

      {/* =========== PROJECTS TAB =========== */}
      {activeTab === 'projects' && (
        <div key="projects" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="vision-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Проекты</h3>
                <p className="text-sm text-white/40 mt-0.5">Архитектурные проекты</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Современный', desc: 'Современные архитектурные решения с чистыми линиями и открытым пространством.' },
                { name: 'Скандинавский', desc: 'Уютный минимализм скандинавского стиля с натуральными материалами.' },
                { name: 'Минималистичный', desc: 'Простота форм и функциональность в каждой детали интерьера.' },
              ].map((project, i) => (
                <div
                  key={project.name}
                  className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div
                    className="relative h-40 w-full overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${['#0075FF', '#7551FF', '#01B574'][i]} 0%, ${['#00D1FF', '#C851FF', '#0075FF'][i]} 100%)`,
                    }}
                  >
                    {/* Decorative floating orbs */}
                    <div
                      className="absolute -right-4 -top-4 h-24 w-24 rounded-full transition-all duration-700 group-hover:scale-[2] group-hover:opacity-30"
                      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', opacity: 0.15 }}
                    />
                    <div
                      className="absolute left-1/2 top-1/2 h-16 w-16 rounded-full opacity-10 transition-all duration-700 group-hover:scale-150"
                      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
                    />
                    <div
                      className="absolute left-4 bottom-4 text-xs font-bold uppercase tracking-widest text-white/60"
                    >
                      Проект #{i + 1}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-base font-bold text-white">{project.name}</p>
                    <p className="mt-2 text-xs text-white/40 leading-relaxed line-clamp-2">
                      {project.desc}
                    </p>
                    <button
                      className="mt-4 rounded-lg px-4 py-2 text-xs font-bold text-[#0075FF] transition-all duration-300 hover:bg-[#0075FF]/10 hover:shadow-[0_0_15px_rgba(0,117,255,0.15)]"
                      style={{ border: '1px solid rgba(0, 117, 255, 0.3)' }}
                    >
                      ПОДРОБНЕЕ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========== PLATFORM SETTINGS (always visible) =========== */}
      <div
        className="vision-card p-6"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0075FF, #01B574)' }}
          >
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Настройки платформы</h3>
            <p className="text-xs text-white/40">Управление уведомлениями и подписками</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Account section */}
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Аккаунт</p>
              <p className="text-[11px] text-white/20 mt-1">Настройки уведомлений вашего аккаунта</p>
            </div>
            <div className="space-y-1">
              {accountToggles.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: item.value ? 'rgba(0, 117, 255, 0.1)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <span className={item.value ? 'text-[#0075FF]' : 'text-white/20'}>{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm text-white/70 block">{item.label}</span>
                      <span className="text-[11px] text-white/25 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className="relative h-7 w-12 shrink-0 rounded-full transition-all duration-300"
                    style={{
                      background: item.value
                        ? 'linear-gradient(135deg, #0075FF, #7551FF)'
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: item.value ? '0 0 15px rgba(0, 117, 255, 0.3)' : 'none',
                    }}
                  >
                    <span
                      className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{
                        transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* App section */}
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Приложение</p>
              <p className="text-[11px] text-white/20 mt-1">Подписки и рассылки платформы</p>
            </div>
            <div className="space-y-1">
              {appToggles.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: item.value ? 'rgba(0, 117, 255, 0.1)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <span className={item.value ? 'text-[#0075FF]' : 'text-white/20'}>{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm text-white/70 block">{item.label}</span>
                      <span className="text-[11px] text-white/25 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className="relative h-7 w-12 shrink-0 rounded-full transition-all duration-300"
                    style={{
                      background: item.value
                        ? 'linear-gradient(135deg, #0075FF, #7551FF)'
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: item.value ? '0 0 15px rgba(0, 117, 255, 0.3)' : 'none',
                    }}
                  >
                    <span
                      className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{
                        transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
