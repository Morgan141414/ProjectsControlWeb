import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { Mail, Edit3, Save } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/40">Загрузка...</p>
      </div>
    )
  }

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: 'ОБЗОР' },
    { key: 'teams', label: 'КОМАНДЫ' },
    { key: 'projects', label: 'ПРОЕКТЫ' },
  ]

  const accountToggles = [
    { label: 'Уведомлять по email при подписке', value: emailOnFollow, setter: setEmailOnFollow },
    { label: 'Уведомлять по email при ответе', value: emailOnAnswer, setter: setEmailOnAnswer },
    { label: 'Уведомлять по email при упоминании', value: emailOnMention, setter: setEmailOnMention },
  ]

  const appToggles = [
    { label: 'Новые запуски и проекты', value: newLaunches, setter: setNewLaunches },
    { label: 'Ежемесячные обновления', value: monthlyUpdates, setter: setMonthlyUpdates },
    { label: 'Подписка на рассылку', value: newsletter, setter: setNewsletter },
    { label: 'Еженедельные письма', value: weeklyMails, setter: setWeeklyMails },
  ]

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
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-6 py-2 text-sm font-bold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#0075FF] text-white'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      {activeTab === 'overview' && (
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
            <h3 className="text-2xl font-bold text-white">С возвращением!</h3>
            <p className="mt-2 text-sm text-white/80">Рады видеть вас, {fullName}!</p>
          </div>

          {/* Profile info card */}
          <div className="vision-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Информация о профиле</h3>
            <p className="text-sm text-white/50 mb-6">{bio || 'Пока нет описания. Расскажите о себе!'}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">Полное имя:</span>
                <span className="text-sm font-medium text-white">{fullName}</span>
              </div>
              {patronymic && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/40">Отчество:</span>
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
                  <span className="text-sm text-white/40">Специальность:</span>
                  <span className="text-sm font-medium text-white">{specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit profile form */}
          <div className="vision-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Редактировать профиль</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Полное имя</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Отчество</label>
                <input
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#0075FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">О себе</label>
                <textarea
                  rows={3}
                  placeholder="Расскажите о себе..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Специальность</label>
                <input
                  placeholder="Разработчик, Дизайнер..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Соц. сети (JSON)</label>
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
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Команды</h3>
          <p className="text-sm text-white/50">Вы пока не состоите ни в одной команде.</p>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-1">Проекты</h3>
          <p className="text-sm text-white/40 mb-4">Архитектурные проекты</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {['Современный', 'Скандинавский', 'Минималистичный'].map((name, i) => (
              <div key={name} className="overflow-hidden rounded-xl">
                <div
                  className="h-32 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${['#0075FF', '#7551FF', '#01B574'][i]} 0%, ${['#00D1FF', '#C851FF', '#0075FF'][i]} 100%)`,
                  }}
                />
                <div className="p-3 bg-white/5 rounded-b-xl">
                  <p className="text-[10px] text-white/40">Проект #{i + 1}</p>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">
                    Различные подходы к дизайну современной архитектуры.
                  </p>
                  <button className="mt-2 rounded-lg border border-white/10 px-3 py-1 text-xs font-bold text-white/60 hover:text-white">
                    СМОТРЕТЬ ВСЕ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Settings - always visible */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="vision-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Настройки платформы</h3>
          <div className="space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase">Аккаунт</p>
            {accountToggles.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{item.label}</span>
                <button
                  type="button"
                  onClick={() => item.setter(!item.value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? 'bg-[#0075FF]' : 'bg-white/20'}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : ''}`}
                  />
                </button>
              </div>
            ))}

            <p className="text-xs font-bold text-white/40 uppercase mt-6">Приложение</p>
            {appToggles.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{item.label}</span>
                <button
                  type="button"
                  onClick={() => item.setter(!item.value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? 'bg-[#0075FF]' : 'bg-white/20'}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : ''}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects grid - only show if on overview tab */}
        {activeTab === 'overview' && (
          <div className="vision-card p-6">
            <h3 className="text-lg font-bold text-white mb-1">Проекты</h3>
            <p className="text-sm text-white/40 mb-4">Архитектурные проекты</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Современный', 'Скандинавский', 'Минималистичный'].map((name, i) => (
                <div key={name} className="overflow-hidden rounded-xl">
                  <div
                    className="h-32 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${['#0075FF', '#7551FF', '#01B574'][i]} 0%, ${['#00D1FF', '#C851FF', '#0075FF'][i]} 100%)`,
                    }}
                  />
                  <div className="p-3 bg-white/5 rounded-b-xl">
                    <p className="text-[10px] text-white/40">Проект #{i + 1}</p>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="mt-1 text-xs text-white/40 line-clamp-2">
                      Различные подходы к дизайну современной архитектуры.
                    </p>
                    <button className="mt-2 rounded-lg border border-white/10 px-3 py-1 text-xs font-bold text-white/60 hover:text-white">
                      СМОТРЕТЬ ВСЕ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
