import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  try {
    // Check localStorage first (persistent / "remember me"), then sessionStorage (tab-only)
    const raw = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token: string | undefined = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {
    // ignore malformed storage
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      sessionStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
