import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SubscriptionPage() {
  return (
    <div>
      <PageHeader title="Subscription" />
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Subscription</h2>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}
