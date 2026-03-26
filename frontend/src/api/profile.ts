import api from './client'
import type { User } from '../types'

export function getMe() {
  return api.get<User>('/users/me')
}

export function updateMe(data: Partial<Omit<User, 'id' | 'email'>>) {
  return api.patch<User>('/users/me', data)
}
<<<<<<< HEAD

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('file', file)
  return api.post<{ avatar_url: string }>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
