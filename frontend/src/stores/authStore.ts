import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  userId: string | null
  fullName: string | null
  patronymic: string | null
  email: string | null
  setAuth: (token: string, user: { id: string; email: string; full_name: string; patronymic?: string }) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      fullName: null,
      patronymic: null,
      email: null,

      setAuth: (token, user) =>
        set({
          token,
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          patronymic: user.patronymic ?? null,
        }),

      logout: () =>
        set({
          token: null,
          userId: null,
          fullName: null,
          patronymic: null,
          email: null,
        }),

      isAuthenticated: () => get().token !== null,
    }),
    { name: 'auth-storage' },
  ),
)
