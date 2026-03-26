import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Building2, Users, FolderKanban, CheckCircle2,
  ArrowRight, Plus, Loader2, Sparkles,
} from 'lucide-react'
import { useCreateOrg, useJoinOrg } from '@/hooks/useOrg'
import { toast } from 'sonner'

type Step = 'welcome' | 'choose' | 'create' | 'join'

export function OnboardingFlow() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createOrgMutation = useCreateOrg()
  const joinOrgMutation = useJoinOrg()
  const [step, setStep] = useState<Step>('welcome')
  const [newOrgName, setNewOrgName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  async function handleCreate() {
    if (!newOrgName.trim()) return
    try {
      await createOrgMutation.mutateAsync(newOrgName.trim())
      toast.success(t('dashboard.orgCreated'))
      setStep('welcome')
    } catch {
      toast.error(t('dashboard.failedCreateOrg'))
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    try {
      await joinOrgMutation.mutateAsync(joinCode.trim())
      toast.success(t('dashboard.joinRequestSent'))
      setStep('welcome')
    } catch {
      toast.error(t('dashboard.failedJoinOrg'))
    }
  }

  if (step === 'welcome') {
    return (
      <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('onboarding.welcome', 'Добро пожаловать в ProjectsControl')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t('onboarding.welcomeDesc', 'Для начала работы создайте организацию или присоединитесь к существующей')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => setStep('create')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t('onboarding.createOrg', 'Создать организацию')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('onboarding.createOrgDesc', 'Вы станете CEO и сможете приглашать сотрудников')}</p>
            </div>
          </button>

          <button
            onClick={() => setStep('join')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:border-emerald-500 hover:bg-emerald-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t('onboarding.joinOrg', 'Присоединиться')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('onboarding.joinOrgDesc', 'Введите код организации, полученный от работодателя')}</p>
            </div>
          </button>
        </div>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('onboarding.setupProfile', 'Настроить профиль')}
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => navigate('/vacancies')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('onboarding.browseVacancies', 'Просмотреть вакансии')}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'create') {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <button
          onClick={() => setStep('welcome')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t('common.back')}
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('onboarding.createOrgTitle', 'Создание организации')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('onboarding.createOrgSubtitle', 'Введите название вашей компании')}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t('onboarding.orgName', 'Название организации')}
            </label>
            <input
              placeholder={t('dashboard.namePlaceholder')}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              autoFocus
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newOrgName.trim() || createOrgMutation.isPending}
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createOrgMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t('onboarding.createButton', 'Создать')}
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h4 className="text-xs font-semibold text-foreground mb-2">{t('onboarding.whatHappens', 'Что произойдёт:')}</h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              {t('onboarding.step1', 'Вы станете CEO организации')}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              {t('onboarding.step2', 'Будет сгенерирован код приглашения для сотрудников')}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              {t('onboarding.step3', 'Вы сможете создавать проекты и команды')}
            </li>
          </ul>
        </div>
      </div>
    )
  }

  if (step === 'join') {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <button
          onClick={() => setStep('welcome')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t('common.back')}
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Users className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('onboarding.joinOrgTitle', 'Присоединиться к организации')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('onboarding.joinOrgSubtitle', 'Введите код организации')}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t('onboarding.joinCode', 'Код организации')}
            </label>
            <input
              placeholder={t('dashboard.orgCodePlaceholder')}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              autoFocus
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!joinCode.trim() || joinOrgMutation.isPending}
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {joinOrgMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                {t('onboarding.joinButton', 'Отправить заявку')}
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            {t('onboarding.joinHint', 'Код организации можно получить у HR-менеджера или руководителя вашей компании. После отправки заявки администратор рассмотрит ваш запрос.')}
          </p>
        </div>
      </div>
    )
  }

  return null
}
