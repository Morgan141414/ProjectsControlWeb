import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { MessageCircle, Users } from 'lucide-react'

export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  async function handleAccept() {
    setLoading(true)
    setError('')
    try {
      // TODO: call accept-invitation API with token
      void token
      await new Promise((r) => setTimeout(r, 500))
      setAccepted(true)
    } catch {
      setError('Failed to accept invitation. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center bg-primary">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white">ProjectsControl</h2>
          <p className="mt-2 text-white/60 text-lg">You've been invited</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-[400px]">
          {accepted ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold text-foreground">Invitation Accepted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You have successfully joined the organization.
              </p>
              <Link
                to="/dashboard"
                className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold text-foreground">Organization Invitation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You have been invited to join an organization on ProjectsControl.
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleAccept}
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>

              <p className="mt-4 text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
