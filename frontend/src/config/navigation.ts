import type { ShellType, OrgRole } from '@/types'
import {
  Building2, Shield, AlertTriangle, Key, Heart,
  Users, ClipboardCheck, FileText, ScrollText, FolderKanban,
  LayoutDashboard, Kanban, MessageSquare, Clock, BarChart3,
  AlertCircle, UserPlus, Settings, Wrench, Server, Headphones,
  Scale, PieChart, History, BookOpen, UserCheck, UserMinus,
  PenTool, Calendar, Send, CreditCard, Lock, Bell,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  /** Roles that can see this item (empty = all roles in the shell) */
  roles?: OrgRole[]
  /** Whether this item requires platform-level isSuperAdmin */
  requiresSuperAdmin?: boolean
  /** Badge type for visual indicators */
  badge?: 'emergency' | 'governance' | 'count'
}

export interface NavSection {
  labelKey: string
  items: NavItem[]
}

// ── Platform Shell Navigation ──
export const platformNav: NavSection[] = [
  {
    labelKey: 'nav.sections.overview',
    items: [
      { to: '/platform', labelKey: 'nav.platformOverview', icon: LayoutDashboard },
      { to: '/platform/companies', labelKey: 'nav.companies', icon: Building2 },
      { to: '/platform/roles', labelKey: 'nav.roleAssignment', icon: UserPlus },
    ],
  },
  {
    labelKey: 'nav.sections.security',
    items: [
      { to: '/platform/logs', labelKey: 'nav.globalAudit', icon: ScrollText },
      { to: '/platform/incidents', labelKey: 'nav.incidents', icon: AlertTriangle },
      { to: '/platform/access-requests', labelKey: 'nav.accessRequests', icon: Key, badge: 'emergency' },
      { to: '/platform/health', labelKey: 'nav.platformHealth', icon: Heart },
    ],
  },
  {
    labelKey: 'nav.sections.settings',
    items: [
      { to: '/platform/settings', labelKey: 'nav.platformSettings', icon: Settings, requiresSuperAdmin: true },
    ],
  },
]

// ── Company Shell Navigation ──
export const companyNav: NavSection[] = [
  {
    labelKey: 'nav.sections.overview',
    items: [
      { to: '/company', labelKey: 'nav.companyDashboard', icon: LayoutDashboard },
      { to: '/company/people', labelKey: 'nav.people', icon: Users },
      { to: '/company/teams', labelKey: 'nav.teams', icon: Users, roles: ['super_ceo', 'ceo', 'team_lead', 'project_manager', 'developer'] },
      { to: '/company/projects', labelKey: 'nav.projects', icon: FolderKanban },
    ],
  },
  {
    labelKey: 'nav.sections.management',
    items: [
      { to: '/company/roles', labelKey: 'nav.rolesPermissions', icon: Shield, roles: ['super_ceo', 'ceo'] },
      { to: '/company/approvals', labelKey: 'nav.approvals', icon: ClipboardCheck, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/policies', labelKey: 'nav.policies', icon: Lock, roles: ['super_ceo', 'ceo', 'superadmin'] },
      { to: '/company/documents', labelKey: 'nav.documents', icon: FileText, roles: ['super_ceo', 'ceo', 'hr', 'founder'] },
      { to: '/company/join-requests', labelKey: 'nav.joinRequests', icon: UserPlus, roles: ['super_ceo', 'ceo', 'hr'] },
    ],
  },
  {
    labelKey: 'nav.sections.hr',
    items: [
      { to: '/company/hr', labelKey: 'nav.hrWorkspace', icon: Users, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/hr/onboarding', labelKey: 'nav.onboarding', icon: UserCheck, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/hr/offboarding', labelKey: 'nav.offboarding', icon: UserMinus, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/hr/signatures', labelKey: 'nav.signatures', icon: PenTool, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/hr/schedules', labelKey: 'nav.schedules', icon: Calendar, roles: ['super_ceo', 'ceo', 'hr'] },
      { to: '/company/hr/leave', labelKey: 'nav.leaveAbsence', icon: Calendar, roles: ['super_ceo', 'ceo', 'hr'] },
    ],
  },
  {
    labelKey: 'nav.sections.audit',
    items: [
      { to: '/company/audit', labelKey: 'nav.auditLog', icon: ScrollText, roles: ['super_ceo', 'ceo', 'superadmin', 'founder'] },
      { to: '/company/subscription', labelKey: 'nav.subscription', icon: CreditCard, roles: ['super_ceo', 'ceo'] },
      { to: '/company/notifications', labelKey: 'nav.notifications', icon: Bell, roles: ['super_ceo', 'ceo', 'superadmin'] },
    ],
  },
  {
    labelKey: 'nav.sections.support',
    items: [
      { to: '/company/support', labelKey: 'nav.techSupport', icon: Headphones, roles: ['super_ceo', 'ceo', 'superadmin', 'sysadmin'] },
      { to: '/company/integrations', labelKey: 'nav.integrations', icon: Wrench, roles: ['super_ceo', 'ceo', 'sysadmin'] },
      { to: '/company/system-logs', labelKey: 'nav.systemLogs', icon: Server, roles: ['super_ceo', 'ceo', 'superadmin', 'sysadmin'] },
    ],
  },
]

// ── Project Shell Navigation ──
export const projectNav: NavSection[] = [
  {
    labelKey: 'nav.sections.workspace',
    items: [
      { to: '/project/:id', labelKey: 'nav.projectHome', icon: LayoutDashboard },
      { to: '/project/:id/board', labelKey: 'nav.board', icon: Kanban },
      { to: '/project/:id/tasks', labelKey: 'nav.tasks', icon: FolderKanban },
      { to: '/project/:id/chat', labelKey: 'nav.projectChat', icon: MessageSquare },
      { to: '/project/:id/members', labelKey: 'nav.members', icon: Users },
      { to: '/project/:id/files', labelKey: 'nav.files', icon: FileText },
    ],
  },
  {
    labelKey: 'nav.sections.tracking',
    items: [
      { to: '/project/:id/deadlines', labelKey: 'nav.deadlines', icon: Clock },
      { to: '/project/:id/kpi', labelKey: 'nav.kpi', icon: BarChart3, roles: ['super_ceo', 'ceo', 'team_lead', 'project_manager'] },
      { to: '/project/:id/risks', labelKey: 'nav.risks', icon: AlertCircle, roles: ['super_ceo', 'ceo', 'team_lead', 'project_manager'] },
      { to: '/project/:id/reports', labelKey: 'nav.reports', icon: Send },
    ],
  },
  {
    labelKey: 'nav.sections.audit',
    items: [
      { to: '/project/:id/logs', labelKey: 'nav.projectLogs', icon: ScrollText },
      { to: '/project/:id/settings', labelKey: 'nav.projectSettings', icon: Settings, roles: ['super_ceo', 'ceo', 'team_lead', 'project_manager'] },
    ],
  },
]

// ── Governance Shell Navigation ──
export const governanceNav: NavSection[] = [
  {
    labelKey: 'nav.sections.ownership',
    items: [
      { to: '/governance', labelKey: 'nav.governanceOverview', icon: LayoutDashboard },
      { to: '/governance/ownership', labelKey: 'nav.ownership', icon: PieChart, badge: 'governance' },
      { to: '/governance/critical-approvals', labelKey: 'nav.criticalApprovals', icon: ClipboardCheck, badge: 'governance' },
      { to: '/governance/decision-history', labelKey: 'nav.decisionHistory', icon: History },
      { to: '/governance/documents', labelKey: 'nav.governanceDocuments', icon: BookOpen },
    ],
  },
]

// ── Emergency Shell Navigation ──
export const emergencyNav: NavSection[] = [
  {
    labelKey: 'nav.sections.emergency',
    items: [
      { to: '/emergency', labelKey: 'nav.emergencyCenter', icon: AlertTriangle, badge: 'emergency' },
      { to: '/emergency/incidents', labelKey: 'nav.incidents', icon: AlertCircle, badge: 'emergency' },
      { to: '/emergency/logs', labelKey: 'nav.forensicLogs', icon: ScrollText },
      { to: '/emergency/access-history', labelKey: 'nav.accessHistory', icon: Key },
    ],
  },
]

/** Get navigation config for a given shell */
export function getNavForShell(shell: ShellType): NavSection[] {
  switch (shell) {
    case 'platform': return platformNav
    case 'company': return companyNav
    case 'project': return projectNav
    case 'governance': return governanceNav
    case 'emergency': return emergencyNav
    default: return companyNav
  }
}

/** Filter nav items by role */
export function filterNavByRole(
  sections: NavSection[],
  role: OrgRole | null,
  isSuperAdmin: boolean,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiresSuperAdmin && !isSuperAdmin) return false
        if (!item.roles || item.roles.length === 0) return true
        if (isSuperAdmin) return true
        if (!role) return false
        return item.roles.includes(role)
      }),
    }))
    .filter((section) => section.items.length > 0)
}
