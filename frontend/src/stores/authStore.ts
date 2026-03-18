import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StorageType = 'local' | 'session'

interface AuthState {
  token: string | null
  userId: string | null
  fullName: string | null
  patronymic: string | null
  email: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: { id: string; email: string; full_name: string; patronymic?: string }, storage?: StorageType) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      fullName: null,
      patronymic: null,
      email: null,
      isAuthenticated: false,

      setAuth: (token, user, storage?: StorageType) => {
        // If sessionStorage requested, mirror the data there so the API client can find it
        if (storage === 'session') {
          sessionStorage.setItem(
            'auth-storage',
            JSON.stringify({ state: { token }, version: 0 }),
          )
        }
        set({
          token,
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          patronymic: user.patronymic ?? null,
          isAuthenticated: true,
        })
      },

      logout: () => {
        sessionStorage.removeItem('auth-storage')
        set({
          token: null,
          userId: null,
          fullName: null,
          patronymic: null,
          email: null,
          isAuthenticated: false,
        })
      },
    }),
    { name: 'auth-storage' },
  ),
)
