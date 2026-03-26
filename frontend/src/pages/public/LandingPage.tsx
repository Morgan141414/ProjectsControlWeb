import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2, Shield, Users, FolderKanban, BarChart3, Lock,
  ArrowRight, CheckCircle2, Zap, Globe, Clock, FileText,
} from 'lucide-react'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{t('landing.badge', 'Enterprise-grade project management')}</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t('landing.heroTitle', 'Control projects.')}
              <br />
              <span className="text-primary">{t('landing.heroTitleAccent', 'Manage teams.')}</span>
              <br />
              {t('landing.heroTitleEnd', 'Grow business.')}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('landing.heroDesc', 'One platform for project management, HR processes, document flow, corporate governance, and emergency access control. Role-based. Secure. Built for real companies.')}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('landing.cta', 'Start Free')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/features"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-8 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                {t('landing.ctaSecondary', 'See Features')}
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {t('landing.freeStart', 'Free to start')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {t('landing.noCard', 'No credit card')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {t('landing.roles', '10 role types')}
              </div>
            </div>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* ── Value Proposition (5 seconds) ── */}
      <section className="border-t border-border bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: FolderKanban, label: t('landing.val1', 'Projects & Tasks'), desc: t('landing.val1d', 'Kanban boards, deadlines, KPIs') },
              { icon: Users, label: t('landing.val2', 'Team Management'), desc: t('landing.val2d', 'HR, onboarding, schedules') },
              { icon: Shield, label: t('landing.val3', 'Role-based Access'), desc: t('landing.val3d', '10 roles from CEO to developer') },
              { icon: Lock, label: t('landing.val4', 'Corporate Security'), desc: t('landing.val4d', 'Emergency access, audit logs') },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shells Overview ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('landing.shellsTitle', '5 workspaces. One platform.')}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t('landing.shellsDesc', 'Each role gets its own tailored workspace with relevant tools and data.')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: 'Platform', color: 'bg-blue-500', desc: t('landing.sh1', 'Global admin, companies, certificates'), roles: 'Super CEO, Superadmin' },
              { name: 'Company', color: 'bg-emerald-500', desc: t('landing.sh2', 'People, teams, projects, HR, policies'), roles: 'CEO, HR, Team Lead' },
              { name: 'Project', color: 'bg-violet-500', desc: t('landing.sh3', 'Board, tasks, chat, files, KPI'), roles: 'Team Lead, Developer' },
              { name: 'Governance', color: 'bg-amber-500', desc: t('landing.sh4', 'Ownership, shares, critical approvals'), roles: 'Founder, CEO' },
              { name: 'Emergency', color: 'bg-red-500', desc: t('landing.sh5', 'Incident center, forensic logs'), roles: 'Superadmin, SysAdmin' },
            ].map((shell) => (
              <div key={shell.name} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                <div className={`h-2 w-8 rounded-full ${shell.color} mb-4`} />
                <h3 className="text-sm font-semibold text-foreground">{shell.name}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{shell.desc}</p>
                <p className="mt-3 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">{shell.roles}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="border-t border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('landing.featTitle', 'Everything you need')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FolderKanban, title: t('landing.f1', 'Kanban & Tasks'), desc: t('landing.f1d', 'Drag-and-drop boards, priorities, checklists, deadlines, and automated reporting.') },
              { icon: Users, title: t('landing.f2', 'HR Management'), desc: t('landing.f2d', 'Onboarding, offboarding, schedules, leave tracking, digital signatures.') },
              { icon: Shield, title: t('landing.f3', '10 Role Types'), desc: t('landing.f3d', 'From Super CEO to Member. Each role sees only what it should.') },
              { icon: BarChart3, title: t('landing.f4', 'KPI & Reports'), desc: t('landing.f4d', 'Track performance, generate reports, AI-powered insights.') },
              { icon: FileText, title: t('landing.f5', 'Document Flow'), desc: t('landing.f5d', 'Policies, approvals, digital signatures, version control.') },
              { icon: Globe, title: t('landing.f6', 'Multi-language'), desc: t('landing.f6d', 'Russian, English, Kazakh. Full i18n support across all shells.') },
              { icon: Lock, title: t('landing.f7', 'Emergency Access'), desc: t('landing.f7d', 'Time-limited access with mandatory reason, full audit trail.') },
              { icon: Clock, title: t('landing.f8', 'Audit Logs'), desc: t('landing.f8d', 'Every action logged. Filter by user, role, date, entity.') },
              { icon: Building2, title: t('landing.f9', 'Multi-Company'), desc: t('landing.f9d', 'Manage multiple companies from one account. Switch instantly.') },
            ].map((feat) => (
              <div key={feat.title} className="rounded-xl border border-border bg-background p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t('landing.ctaTitle', 'Ready to take control?')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('landing.ctaDesc', 'Create your organization in 30 seconds. Free plan available.')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('landing.cta', 'Start Free')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-8 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              {t('landing.ctaLogin', 'I already have an account')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
