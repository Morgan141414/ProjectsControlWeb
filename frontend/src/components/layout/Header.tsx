import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { useUiStore } from '@/stores/uiStore'

export function Header() {
  const fullName = useAuthStore((s) => s.fullName)
  const orgName = useOrgStore((s) => s.orgName)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Left: page title placeholder */}
      <div />

      {/* Right: user info, org, theme toggle */}
      <div className="flex items-center gap-4">
        {orgName && (
          <span className="text-sm text-muted-foreground">{orgName}</span>
        )}

        {fullName && (
          <span className="text-sm font-medium">{fullName}</span>
        )}

        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </button>
      </div>
    </header>
  )
}
