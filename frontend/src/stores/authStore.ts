import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StorageType = 'local' | 'session'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userId: string | null
  fullName: string | null
  patronymic: string | null
  email: string | null
  avatarUrl: string | null
  isSuperAdmin: boolean
  isAuthenticated: boolean
  setAuth: (
    token: string,
    refreshToken: string | null,
    user: {
      id: string
      email: string
      full_name: string
      patronymic?: string
      is_superadmin?: boolean
      avatar_url?: string | null
    },
    storage?: StorageType,
  ) => void
  setAvatarUrl: (url: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      fullName: null,
      patronymic: null,
      email: null,
      avatarUrl: null,
      isSuperAdmin: false,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user, storage?: StorageType) => {
        if (storage === 'session') {
          sessionStorage.setItem(
            'auth-storage',
            JSON.stringify({ state: { token, refreshToken }, version: 0 }),
          )
        }
        set({
          token,
          refreshToken,
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          patronymic: user.patronymic ?? null,
          avatarUrl: user.avatar_url ?? null,
          isSuperAdmin: user.is_superadmin ?? false,
          isAuthenticated: true,
        })
      },

      setAvatarUrl: (url) => set({ avatarUrl: url }),

      logout: () => {
        sessionStorage.removeItem('auth-storage')
        set({
          token: null,
          refreshToken: null,
          userId: null,
          fullName: null,
          patronymic: null,
          email: null,
          avatarUrl: null,
          isSuperAdmin: false,
          isAuthenticated: false,
        })
      },
    }),
    { name: 'auth-storage' },
  ),
)
