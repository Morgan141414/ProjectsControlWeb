import api from './client'

export function register(email: string, password: string, full_name: string) {
  return api.post('/auth/register', { email, password, full_name })
}

export function login(email: string, password: string) {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  return api.post<{ access_token: string }>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function googleLogin(idToken: string) {
  return api.post('/auth/google', { id_token: idToken })
}
