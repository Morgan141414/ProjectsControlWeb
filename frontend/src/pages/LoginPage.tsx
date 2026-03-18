import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { getMe } from '@/api/profile'
import { getOrg } from '@/api/orgs'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setOrg = useOrgStore((s) => s.setOrg)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: tokenData } = await login(email, password)
      const token = tokenData.access_token

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token }, version: 0 }),
      )

      const { data: user } = await getMe()
      setAuth(token, user)

      if ((user as unknown as Record<string, unknown>).org_id) {
        try {
          const orgId = (user as unknown as Record<string, unknown>).org_id as string
          const { data: org } = await getOrg(orgId)
          setOrg(org.id, org.name)
        } catch {
          // org fetch failed
        }
      }

      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#060B26' }}
    >
      {/* Left side - decorative gradient */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B0B3B 0%, #1A0533 30%, #2D1B69 60%, #0B0B3B 100%)',
        }}
      >
        {/* Neon lines decoration */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(138, 43, 226, 0.1) 100px, rgba(138, 43, 226, 0.1) 101px)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="text-center z-10">
          <h2
            className="text-5xl font-bold uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #868CFF, #C851FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The Vision UI Dashboard
          </h2>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">Nice to see you!</h1>
          <p className="text-white/50 mb-8">
            Enter your email and password to sign in
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-[#0075FF] focus:outline-none transition-colors"
              />
            </div>

            {/* Remember me toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`relative h-6 w-11 rounded-full transition-colors ${remember ? 'bg-[#0075FF]' : 'bg-white/20'}`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${remember ? 'translate-x-5' : ''}`}
                />
              </button>
              <span className="text-sm text-white/70">Remember me</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#0075FF] text-sm font-bold text-white uppercase tracking-wider transition-all hover:bg-[#0063D6] hover:shadow-[0_0_20px_rgba(0,117,255,0.4)] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-white hover:text-[#0075FF] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
