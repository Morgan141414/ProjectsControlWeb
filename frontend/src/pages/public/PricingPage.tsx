import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'For small teams getting started',
    features: [
      'Up to 5 members',
      '1 organization',
      '3 projects',
      'Basic Kanban board',
      'Community support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Business',
    price: '990',
    currency: '₸',
    period: '/user/month',
    desc: 'For growing companies',
    features: [
      'Unlimited members',
      'Unlimited organizations',
      'Unlimited projects',
      'All shells & roles',
      'HR module',
      'Document flow',
      'KPI tracking',
      'Priority support',
    ],
    cta: 'Start Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large organizations',
    features: [
      'Everything in Business',
      'Emergency access module',
      'Governance shell',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated support',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
]

export default function PricingPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t('pricing.title', 'Simple, transparent pricing')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              {t('pricing.desc', 'Choose the plan that fits your team. Scale as you grow.')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'rounded-2xl border p-6 flex flex-col',
                  plan.featured
                    ? 'border-primary bg-card shadow-lg relative'
                    : 'border-border bg-card',
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-4 mb-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">{plan.currency ?? '$'}{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Enterprise' ? '/docs' : '/register'}
                  className={cn(
                    'flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
                    plan.featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-foreground hover:bg-accent',
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
