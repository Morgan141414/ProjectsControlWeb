import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'ui-storage' },
  ),
)
