import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { ShellGuard } from './ShellGuard'

// ── Auth pages ──
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const InvitationAcceptPage = lazy(() => import('@/pages/auth/InvitationAcceptPage'))

// ── Personal / shared pages ──
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ProfileSettingsPage = lazy(() => import('@/pages/ProfileSettingsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const MessengerPage = lazy(() => import('@/pages/MessengerPage'))
const RatingsPage = lazy(() => import('@/pages/RatingsPage'))
const TariffPlansPage = lazy(() => import('@/pages/TariffPlansPage'))
const VacancyCatalogPage = lazy(() => import('@/pages/vacancies/VacancyCatalogPage'))
const VacancyDetailPage = lazy(() => import('@/pages/vacancies/VacancyDetailPage'))

// ── Platform shell pages ──
const PlatformDashboard = lazy(() => import('@/pages/platform/PlatformDashboard'))
const PlatformIncidentsPage = lazy(() => import('@/pages/platform/PlatformIncidentsPage'))
const PlatformHealthPage = lazy(() => import('@/pages/platform/PlatformHealthPage'))
const AccessRequestsPage = lazy(() => import('@/pages/platform/AccessRequestsPage'))
const CompaniesPage = lazy(() => import('@/pages/superadmin/CompaniesPage'))
const CertificatesPage = lazy(() => import('@/pages/superadmin/CertificatesPage'))

// ── Company shell pages ──
const CompanyDashboard = lazy(() => import('@/pages/company/CompanyDashboard'))
const CompanyPeoplePage = lazy(() => import('@/pages/company/CompanyPeoplePage'))
const CompanyApprovalsPage = lazy(() => import('@/pages/company/CompanyApprovalsPage'))
const HRWorkspacePage = lazy(() => import('@/pages/company/HRWorkspacePage'))
const JoinRequestsPage = lazy(() => import('@/pages/admin/JoinRequestsPage'))
const ProjectsPage = lazy(() => import('@/pages/admin/ProjectsPage'))
const TeamsPage = lazy(() => import('@/pages/admin/TeamsPage'))
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const PrivacyPage = lazy(() => import('@/pages/admin/PrivacyPage'))
const NotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'))
const AuditPage = lazy(() => import('@/pages/admin/AuditPage'))
const SchedulesPage = lazy(() => import('@/pages/admin/SchedulesPage'))
const SubscriptionPage = lazy(() => import('@/pages/admin/SubscriptionPage'))

// ── Project shell pages ──
const ProjectSelectorPage = lazy(() => import('@/pages/project/ProjectSelectorPage'))
const ProjectDashboard = lazy(() => import('@/pages/project/ProjectDashboard'))
const ProjectDetailPage = lazy(() => import('@/pages/admin/ProjectDetailPage'))
const ProjectChatPage = lazy(() => import('@/pages/project/ProjectChatPage'))
const ProjectMembersPage = lazy(() => import('@/pages/project/ProjectMembersPage'))
const ProjectFilesPage = lazy(() => import('@/pages/project/ProjectFilesPage'))
const ProjectDeadlinesPage = lazy(() => import('@/pages/project/ProjectDeadlinesPage'))
const ProjectKpiPage = lazy(() => import('@/pages/project/ProjectKpiPage'))
const ProjectRisksPage = lazy(() => import('@/pages/project/ProjectRisksPage'))

// ── Governance shell pages ──
const GovernanceDashboard = lazy(() => import('@/pages/governance/GovernanceDashboard'))
const OwnershipPage = lazy(() => import('@/pages/governance/OwnershipPage'))
const CriticalApprovalsPage = lazy(() => import('@/pages/governance/CriticalApprovalsPage'))
const DecisionHistoryPage = lazy(() => import('@/pages/governance/DecisionHistoryPage'))
const GovernanceDocumentsPage = lazy(() => import('@/pages/governance/GovernanceDocumentsPage'))

// ── Emergency shell pages ──
const EmergencyDashboard = lazy(() => import('@/pages/emergency/EmergencyDashboard'))
const IncidentsPage = lazy(() => import('@/pages/emergency/IncidentsPage'))
const ForensicLogsPage = lazy(() => import('@/pages/emergency/ForensicLogsPage'))
const AccessHistoryPage = lazy(() => import('@/pages/emergency/AccessHistoryPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-6 animate-in fade-in duration-300">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted/70 animate-pulse" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-5 w-12 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted/70" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-2.5 w-1/2 rounded bg-muted/60" />
                  </div>
                  <div className="h-5 w-16 rounded-md bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function W({ children }: { children: React.ReactNode }) {
  return <SuspenseWrapper>{children}</SuspenseWrapper>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Public routes ──
  { path: '/login', element: <W><LoginPage /></W> },
  { path: '/register', element: <W><RegisterPage /></W> },
  { path: '/forgot-password', element: <W><ForgotPasswordPage /></W> },
  { path: '/reset-password', element: <W><ResetPasswordPage /></W> },
  { path: '/invitation/:token', element: <W><InvitationAcceptPage /></W> },

  // ── Protected routes ──
  {
    element: <ProtectedRoute />,
    children: [
      // Personal / shared
      { path: '/dashboard', element: <W><DashboardPage /></W> },
      { path: '/profile', element: <W><ProfilePage /></W> },
      { path: '/profile/settings', element: <W><ProfileSettingsPage /></W> },
      { path: '/settings', element: <W><SettingsPage /></W> },
      { path: '/reports', element: <W><ReportsPage /></W> },
      { path: '/support', element: <W><SupportPage /></W> },
      { path: '/faq', element: <W><FaqPage /></W> },
      { path: '/messenger', element: <W><MessengerPage /></W> },
      { path: '/ratings', element: <W><RatingsPage /></W> },
      { path: '/tariffs', element: <W><TariffPlansPage /></W> },
      { path: '/vacancies', element: <W><VacancyCatalogPage /></W> },
      { path: '/vacancies/:id', element: <W><VacancyDetailPage /></W> },

      // ── Platform Shell (guarded) ──
      {
        element: <ShellGuard shell="platform" />,
        children: [
          { path: '/platform', element: <W><PlatformDashboard /></W> },
          { path: '/platform/companies', element: <W><CompaniesPage /></W> },
          { path: '/platform/certificates', element: <W><CertificatesPage /></W> },
          { path: '/platform/logs', element: <W><AuditPage /></W> },
          { path: '/platform/incidents', element: <W><PlatformIncidentsPage /></W> },
          { path: '/platform/access-requests', element: <W><AccessRequestsPage /></W> },
          { path: '/platform/health', element: <W><PlatformHealthPage /></W> },
          { path: '/platform/roles', element: <W><UsersPage /></W> },
          { path: '/platform/settings', element: <W><SettingsPage /></W> },
        ],
      },

      // ── Company Shell (guarded) ──
      {
        element: <ShellGuard shell="company" />,
        children: [
          { path: '/company', element: <W><CompanyDashboard /></W> },
          { path: '/company/people', element: <W><CompanyPeoplePage /></W> },
          { path: '/company/teams', element: <W><TeamsPage /></W> },
          { path: '/company/projects', element: <W><ProjectsPage /></W> },
          { path: '/company/activity', element: <Navigate to="/company" replace /> },
          { path: '/company/roles', element: <W><UsersPage /></W> },
          { path: '/company/approvals', element: <W><CompanyApprovalsPage /></W> },
          { path: '/company/policies', element: <W><PrivacyPage /></W> },
          { path: '/company/documents', element: <W><CompanyDashboard /></W> },
          { path: '/company/join-requests', element: <W><JoinRequestsPage /></W> },
          { path: '/company/hr', element: <W><HRWorkspacePage /></W> },
          { path: '/company/hr/onboarding', element: <W><HRWorkspacePage /></W> },
          { path: '/company/hr/offboarding', element: <W><HRWorkspacePage /></W> },
          { path: '/company/hr/signatures', element: <W><HRWorkspacePage /></W> },
          { path: '/company/hr/schedules', element: <W><SchedulesPage /></W> },
          { path: '/company/hr/leave', element: <W><HRWorkspacePage /></W> },
          { path: '/company/audit', element: <W><AuditPage /></W> },
          { path: '/company/subscription', element: <W><SubscriptionPage /></W> },
          { path: '/company/notifications', element: <W><NotificationsPage /></W> },
          { path: '/company/support', element: <W><SupportPage /></W> },
          { path: '/company/integrations', element: <W><CompanyDashboard /></W> },
          { path: '/company/system-logs', element: <W><AuditPage /></W> },
          { path: '/company/settings', element: <W><SettingsPage /></W> },
        ],
      },

      // ── Project Shell (guarded) ──
      {
        element: <ShellGuard shell="project" />,
        children: [
          { path: '/project', element: <W><ProjectSelectorPage /></W> },
          { path: '/project/:id', element: <W><ProjectDashboard /></W> },
          { path: '/project/:id/board', element: <W><ProjectDetailPage /></W> },
          { path: '/project/:id/tasks', element: <W><ProjectDetailPage /></W> },
          { path: '/project/:id/chat', element: <W><ProjectChatPage /></W> },
          { path: '/project/:id/members', element: <W><ProjectMembersPage /></W> },
          { path: '/project/:id/files', element: <W><ProjectFilesPage /></W> },
          { path: '/project/:id/deadlines', element: <W><ProjectDeadlinesPage /></W> },
          { path: '/project/:id/kpi', element: <W><ProjectKpiPage /></W> },
          { path: '/project/:id/risks', element: <W><ProjectRisksPage /></W> },
          { path: '/project/:id/reports', element: <W><ReportsPage /></W> },
          { path: '/project/:id/logs', element: <W><AuditPage /></W> },
          { path: '/project/:id/settings', element: <W><SettingsPage /></W> },
        ],
      },

      // ── Governance Shell (guarded) ──
      {
        element: <ShellGuard shell="governance" />,
        children: [
          { path: '/governance', element: <W><GovernanceDashboard /></W> },
          { path: '/governance/ownership', element: <W><OwnershipPage /></W> },
          { path: '/governance/critical-approvals', element: <W><CriticalApprovalsPage /></W> },
          { path: '/governance/decision-history', element: <W><DecisionHistoryPage /></W> },
          { path: '/governance/documents', element: <W><GovernanceDocumentsPage /></W> },
        ],
      },

      // ── Emergency Shell (guarded) ──
      {
        element: <ShellGuard shell="emergency" />,
        children: [
          { path: '/emergency', element: <W><EmergencyDashboard /></W> },
          { path: '/emergency/incidents', element: <W><IncidentsPage /></W> },
          { path: '/emergency/profile/:id', element: <W><EmergencyDashboard /></W> },
          { path: '/emergency/logs', element: <W><ForensicLogsPage /></W> },
          { path: '/emergency/access-history', element: <W><AccessHistoryPage /></W> },
        ],
      },

      // ── Legacy redirects (old routes → new routes) ──
      { path: '/admin', element: <Navigate to="/company" replace /> },
      { path: '/admin/join-requests', element: <Navigate to="/company/join-requests" replace /> },
      { path: '/admin/projects', element: <Navigate to="/company/projects" replace /> },
      { path: '/admin/projects/:projectId', element: <Navigate to="/company/projects" replace /> },
      { path: '/admin/teams', element: <Navigate to="/company/teams" replace /> },
      { path: '/admin/users', element: <Navigate to="/company/people" replace /> },
      { path: '/admin/privacy', element: <Navigate to="/company/policies" replace /> },
      { path: '/admin/notifications', element: <Navigate to="/company/notifications" replace /> },
      { path: '/admin/audit', element: <Navigate to="/company/audit" replace /> },
      { path: '/admin/schedules', element: <Navigate to="/company/hr/schedules" replace /> },
      { path: '/admin/subscription', element: <Navigate to="/company/subscription" replace /> },
      { path: '/admin/hr', element: <Navigate to="/company/hr" replace /> },
      { path: '/superadmin/companies', element: <Navigate to="/platform/companies" replace /> },
      { path: '/superadmin/certificates', element: <Navigate to="/platform/certificates" replace /> },
    ],
  },

  // ── 404 ──
  { path: '*', element: <W><NotFoundPage /></W> },
])
