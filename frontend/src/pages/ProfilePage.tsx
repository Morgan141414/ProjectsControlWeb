import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

export default function ProfilePage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [socials, setSocials] = useState('')

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

      // Sync authStore if name changed
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
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Профиль</CardTitle>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patronymic">Отчество</Label>
              <Input
                id="patronymic"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Расскажите о себе..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="specialty">Специальность</Label>
              <Input
                id="specialty"
                placeholder="Разработчик, дизайнер..."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="socials">Соцсети (JSON)</Label>
              <Textarea
                id="socials"
                rows={3}
                placeholder='{"telegram": "@handle", "github": "username"}'
                value={socials}
                onChange={(e) => setSocials(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
