import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StorageType = 'local' | 'session'

interface AuthState {
  token: string | null
<<<<<<< HEAD
  refreshToken: string | null
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  userId: string | null
  fullName: string | null
  patronymic: string | null
  email: string | null
<<<<<<< HEAD
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
=======
  isAuthenticated: boolean
  setAuth: (token: string, user: { id: string; email: string; full_name: string; patronymic?: string }, storage?: StorageType) => void
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
<<<<<<< HEAD
      refreshToken: null,
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      userId: null,
      fullName: null,
      patronymic: null,
      email: null,
<<<<<<< HEAD
      avatarUrl: null,
      isSuperAdmin: false,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user, storage?: StorageType) => {
        if (storage === 'session') {
          sessionStorage.setItem(
            'auth-storage',
            JSON.stringify({ state: { token, refreshToken }, version: 0 }),
=======
      isAuthenticated: false,

      setAuth: (token, user, storage?: StorageType) => {
        // If sessionStorage requested, mirror the data there so the API client can find it
        if (storage === 'session') {
          sessionStorage.setItem(
            'auth-storage',
            JSON.stringify({ state: { token }, version: 0 }),
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          )
        }
        set({
          token,
<<<<<<< HEAD
          refreshToken,
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          patronymic: user.patronymic ?? null,
<<<<<<< HEAD
          avatarUrl: user.avatar_url ?? null,
          isSuperAdmin: user.is_superadmin ?? false,
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          isAuthenticated: true,
        })
      },

<<<<<<< HEAD
      setAvatarUrl: (url) => set({ avatarUrl: url }),

=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
      logout: () => {
        sessionStorage.removeItem('auth-storage')
        set({
          token: null,
<<<<<<< HEAD
          refreshToken: null,
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          userId: null,
          fullName: null,
          patronymic: null,
          email: null,
<<<<<<< HEAD
          avatarUrl: null,
          isSuperAdmin: false,
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
          isAuthenticated: false,
        })
      },
    }),
    { name: 'auth-storage' },
  ),
)
