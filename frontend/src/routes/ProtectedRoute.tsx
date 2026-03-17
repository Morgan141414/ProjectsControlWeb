import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}
