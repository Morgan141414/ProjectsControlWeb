<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
<<<<<<< HEAD
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Give Zustand persist a tick to hydrate from storage
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    // Check storage directly for instant feedback
    const raw = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.token) {
          return (
            <div className="flex h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#0f8f5d]" />
            </div>
          )
        }
      } catch { /* ignore */ }
    }
    // No token in storage at all — redirect immediately
    return <Navigate to="/login" replace />
  }
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}
