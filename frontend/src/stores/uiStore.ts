import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
<<<<<<< HEAD
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
=======
  theme: 'dark'
  sidebarCollapsed: boolean
  toggleTheme: () => void
  setTheme: (theme: 'dark') => void
  toggleSidebar: () => void
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark' as const,
<<<<<<< HEAD

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setTheme: (theme) => set({ theme }),
=======
      sidebarCollapsed: false,

      toggleTheme: () => set({ theme: 'dark' }),
      setTheme: () => set({ theme: 'dark' }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    }),
    { name: 'ui-storage' },
  ),
)
