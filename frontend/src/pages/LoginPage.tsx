import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { getMe } from '@/api/profile'
import { getOrg } from '@/api/orgs'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setOrg = useOrgStore((s) => s.setOrg)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: tokenData } = await login(email, password)
      const token = tokenData.access_token

      // Temporarily set token so the interceptor picks it up
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token }, version: 0 }),
      )

      const { data: user } = await getMe()
      setAuth(token, user)

      // Check if user belongs to an org
      if ((user as Record<string, unknown>).org_id) {
        try {
          const orgId = (user as Record<string, unknown>).org_id as string
          const { data: org } = await getOrg(orgId)
          setOrg(org.id, org.name)
        } catch {
          // org fetch failed, proceed without org
        }
      }

      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Ошибка входа'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Вход</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
