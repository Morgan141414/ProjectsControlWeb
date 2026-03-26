import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  FolderKanban, Users, Shield, BarChart3, FileText, Lock,
  Building2, Clock, Globe, MessageSquare, AlertTriangle, PieChart,
  ArrowRight,
} from 'lucide-react'

const FEATURES = [
  {
    category: 'Project Management',
    items: [
      { icon: FolderKanban, title: 'Kanban Boards', desc: 'Drag-and-drop task management with custom columns, priorities, and story points.' },
      { icon: BarChart3, title: 'KPI Tracking', desc: 'Set and monitor key performance indicators per project and per team member.' },
      { icon: Clock, title: 'Deadlines & Timeline', desc: 'Gantt-style timeline view, calendar view, and deadline notifications.' },
      { icon: MessageSquare, title: 'Project Chat', desc: 'Built-in messaging for each project. Keep discussions in context.' },
    ],
  },
  {
    category: 'Team & HR',
    items: [
      { icon: Users, title: 'Employee Management', desc: 'Directory, profiles, onboarding flows, and offboarding procedures.' },
      { icon: FileText, title: 'Digital Signatures', desc: 'Sign documents digitally. Track signature status and history.' },
      { icon: Clock, title: 'Schedules & Leave', desc: 'Work schedules, vacation tracking, sick leave, and business trips.' },
      { icon: Building2, title: 'Multi-Company', desc: 'Manage multiple organizations from a single account.' },
    ],
  },
  {
    category: 'Security & Governance',
    items: [
      { icon: Shield, title: '10 Role Types', desc: 'Super CEO, CEO, Superadmin, HR, SysAdmin, Team Lead, PM, Developer, Founder, Member.' },
      { icon: Lock, title: 'Emergency Access', desc: 'Time-limited access with mandatory reason, full audit trail, masked data.' },
      { icon: AlertTriangle, title: 'Incident Management', desc: 'Report, track, and resolve incidents with forensic logging.' },
      { icon: PieChart, title: 'Corporate Governance', desc: 'Ownership structure, share percentages, critical approval workflows.' },
    ],
  },
  {
    category: 'Platform',
    items: [
      { icon: Globe, title: 'Multi-language', desc: 'Full support for Russian, English, and Kazakh interfaces.' },
      { icon: Clock, title: 'Audit Logs', desc: 'Every action is logged. Filter by user, role, date, or entity.' },
      { icon: FileText, title: 'Document Flow', desc: 'Policies, approvals, templates with version control.' },
      { icon: BarChart3, title: 'Reports & Analytics', desc: 'Daily reports, project analytics, and exportable data.' },
    ],
  },
]

export default function FeaturesPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t('features.title', 'Features')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.desc', 'Everything you need to manage projects, teams, documents, and corporate governance in one secure platform.')}
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {FEATURES.map((section, idx) => (
        <section
          key={section.category}
          className={`py-12 sm:py-16 ${idx % 2 === 0 ? 'bg-card border-y border-border' : ''}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-8">{section.category}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((feat) => (
                <div key={feat.title} className="rounded-xl border border-border bg-background p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{feat.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="text-2xl font-bold text-foreground">{t('features.ctaTitle', 'Ready to get started?')}</h2>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/register" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              {t('public.getStarted', 'Get Started')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
