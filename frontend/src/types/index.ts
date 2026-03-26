export interface User {
  id: string
  email: string
  full_name: string
<<<<<<< HEAD
  first_name?: string
  last_name?: string
  patronymic?: string
  phone?: string
=======
  patronymic?: string
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
  bio?: string
  specialty?: string
  avatar_url?: string
  socials_json?: string
<<<<<<< HEAD
  is_superadmin?: boolean
  totp_enabled?: boolean
  position?: string
  experience_years?: number
  skills?: string[]
  education?: string
  city?: string
  portfolio_url?: string
  is_looking_for_job?: boolean
  desired_salary?: number
  org_id?: string
  org_role?: OrgRole | null
}

export type OrgRole =
  | 'super_ceo'
  | 'ceo'
  | 'superadmin'
  | 'hr'
  | 'sysadmin'
  | 'team_lead'
  | 'project_manager'
  | 'developer'
  | 'founder'
  | 'member'

// ── Shell / Context system ──

/** The 5 interface shells that determine what the user sees */
export type ShellType = 'platform' | 'company' | 'project' | 'governance' | 'emergency'

/** Active context describes WHERE the user is working right now */
export interface AppContext {
  shell: ShellType
  orgId?: string | null
  projectId?: string | null
  /** True when superadmin is in emergency access mode */
  emergencyMode?: boolean
  /** Reason for emergency access (required when emergencyMode is true) */
  emergencyReason?: string
}

/** Maps roles to their primary (default) shell */
export const ROLE_DEFAULT_SHELL: Record<OrgRole, ShellType> = {
  super_ceo: 'platform',
  superadmin: 'platform',
  sysadmin: 'platform',
  ceo: 'company',
  hr: 'company',
  founder: 'governance',
  team_lead: 'company',
  project_manager: 'company',
  developer: 'company',
  member: 'company',
}

/** Which shells each role is allowed to access */
export const ROLE_ALLOWED_SHELLS: Record<OrgRole, ShellType[]> = {
  super_ceo: ['platform', 'company', 'project', 'governance'],
  superadmin: ['platform', 'company', 'emergency'],
  sysadmin: ['platform', 'company', 'emergency'],
  ceo: ['company', 'project', 'governance'],
  hr: ['company'],
  founder: ['governance', 'company'],
  team_lead: ['company', 'project'],
  project_manager: ['company', 'project'],
  developer: ['company', 'project'],
  member: ['company', 'project'],
}

/** Human-readable role labels (actual roles, not legacy labels) */
export const ROLE_LABELS: Record<OrgRole, string> = {
  super_ceo: 'Super CEO',
  ceo: 'CEO',
  superadmin: 'Super Admin',
  hr: 'HR',
  sysadmin: 'Sys Admin',
  team_lead: 'Team Lead',
  project_manager: 'Project Manager',
  developer: 'Developer',
  founder: 'Founder',
  member: 'Member',
=======
  org_id?: string
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
}

export interface Org {
  id: string
  name: string
<<<<<<< HEAD
  code?: string
  join_code: string
  owner_id?: string
  description?: string
  industry?: string
  website?: string
  logo_url?: string
  is_active?: boolean
  suspended_at?: string
  max_members?: number
  auto_approve?: boolean
  welcome_message?: string
  theme_color?: string
}

export interface OrgWithRole extends Org {
  role: OrgRole
=======
  code: string
  owner_id: string
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
}

export interface JoinRequest {
  id: string
  user_id: string
  org_id: string
  status: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  org_id: string
}

export interface Team {
  id: string
  name: string
  project_id?: string
  org_id: string
  members?: TeamMember[]
}

export interface TeamMember {
  user_id: string
  role?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  assignee_id?: string
  team_id?: string
  due_date?: string
  report?: string
  created_at: string
}

<<<<<<< HEAD
// Board types
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TaskColumn {
  id: string
  org_id: string
  project_id: string
  name: string
  name_ru?: string | null
  name_kz?: string | null
  color?: string | null
  position: number
  mapped_status?: string | null
  created_at: string
}

export interface BoardTask {
  id: string
  org_id: string
  project_id?: string | null
  team_id?: string | null
  assignee_id?: string | null
  column_id?: string | null
  title: string
  description?: string | null
  status: string
  priority?: string | null
  story_points?: number | null
  position: number
  report?: string | null
  due_date?: string | null
  reminders?: Record<string, unknown> | null
  created_at: string
  checklist_total: number
  checklist_done: number
  comments_count: number
}

export interface TaskChecklistItem {
  id: string
  task_id: string
  text: string
  is_done: boolean
  position: number
  created_at: string
}

export interface TaskComment {
  id: string
  org_id: string
  task_id: string
  user_id: string
  text: string
  created_at: string
  updated_at?: string | null
}

export interface TaskAttachment {
  id: string
  org_id: string
  task_id: string
  filename: string
  path: string
  size_bytes: number
  content_type?: string | null
  uploaded_by?: string | null
  created_at: string
}

export interface ProjectStats {
  total_tasks: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  overdue: number
  total_story_points: number
=======
export interface Session {
  id: string
  user_id: string
  device_name?: string
  os_name?: string
  started_at: string
  ended_at?: string
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
}

export interface ConsentStatus {
  accepted: boolean
  policy_version?: string
  accepted_at?: string
}

<<<<<<< HEAD
export interface Certificate {
  id: string
  org_id: string
  certificate_number: string
  issued_at: string
  expires_at: string
  status: 'active' | 'expired' | 'revoked'
  issued_by: string
  revoked_at?: string
  revoke_reason?: string
  pdf_url?: string
}

export interface Permission {
  id: string
  codename: string
  description?: string
}

export interface RolePermission {
  id: string
  role: string
  permission_id: string
}

=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
export type KpiReport = Record<string, unknown>
export type AiScorecard = Record<string, unknown>
export type AuditLog = Record<string, unknown>
export type PrivacyRule = Record<string, unknown>
export type NotificationHook = Record<string, unknown>
export type ReportExport = Record<string, unknown>
export type ReportSchedule = Record<string, unknown>
<<<<<<< HEAD
export interface SupportMessage {
  id: string
  thread_id: string
  author_id: string
  author_name: string
  author_role: string
  body: string
  created_at: string
  attachments: SupportMessageAttachment[]
}

export interface SupportMessageAttachment {
  id: string
  file_name: string
  content_type: string
  size_bytes: number
  url: string
}

export interface SupportThread {
  id: string
  org_id: string
  requester_id: string
  requester_name: string
  requester_role: string
  subject: string
  status: 'open' | 'answered' | 'closed'
  created_at: string
  updated_at: string
  last_message_preview?: string | null
  unread_count: number
  messages: SupportMessage[]
}

export interface SupportStats {
  total: number
  open: number
  answered: number
  closed: number
  unread_total: number
}
=======
export type SessionMetrics = Record<string, unknown>
export type UserMetrics = Record<string, unknown>
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
