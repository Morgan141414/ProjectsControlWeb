import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark' as const,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-storage' },
  ),
)
