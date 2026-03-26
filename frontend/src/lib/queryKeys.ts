/** Centralised query-key factory. */

export const queryKeys = {
  // -- Profile
  profile: {
    me: () => ['profile', 'me'] as const,
  },

  // -- Org
  org: {
    myOrgs: () => ['orgs', 'my'] as const,
    detail: (orgId: string) => ['org', orgId] as const,
    joinRequests: (orgId: string) => ['org', orgId, 'join-requests'] as const,
  },

  // -- Projects
  projects: {
    list: (orgId: string) => ['projects', orgId] as const,
    detail: (orgId: string, projectId: string) => ['projects', orgId, projectId] as const,
  },

  // -- Tasks
  tasks: {
    today: (orgId: string) => ['tasks', orgId, 'today'] as const,
  },

  // -- Teams
  teams: {
    list: (orgId: string) => ['teams', orgId] as const,
    my: (orgId: string) => ['teams', orgId, 'me'] as const,
  },

  // -- Users
  users: {
    list: (orgId: string) => ['users', orgId] as const,
  },

  // -- Reports
  reports: {
    orgKpi: (orgId: string, params?: Record<string, unknown>) =>
      ['reports', orgId, 'org-kpi', params ?? {}] as const,
    projectKpi: (orgId: string, params?: Record<string, unknown>) =>
      ['reports', orgId, 'project-kpi', params ?? {}] as const,
    exports: (orgId: string) => ['reports', orgId, 'exports'] as const,
  },

  // -- AI
  ai: {
    kpi: (orgId: string, params?: Record<string, unknown>) =>
      ['ai', orgId, 'kpi', params ?? {}] as const,
    scorecards: (orgId: string, params?: Record<string, unknown>) =>
      ['ai', orgId, 'scorecards', params ?? {}] as const,
  },

  // -- Audit
  audit: {
    list: (orgId: string) => ['audit', orgId] as const,
  },

  // -- Privacy
  privacy: {
    rules: (orgId: string) => ['privacy', orgId, 'rules'] as const,
  },

  // -- Consent
  consent: {
    status: (orgId: string) => ['consent', orgId] as const,
  },

  // -- Notifications
  notifications: {
    hooks: (orgId: string) => ['notifications', orgId, 'hooks'] as const,
  },

  // -- Schedules
  schedules: {
    list: (orgId: string) => ['schedules', orgId] as const,
  },

  // -- Board
  board: {
    columns: (orgId: string, projectId: string) =>
      ['board', orgId, projectId, 'columns'] as const,
    tasks: (orgId: string, projectId: string) =>
      ['board', orgId, projectId, 'tasks'] as const,
    task: (orgId: string, projectId: string, taskId: string) =>
      ['board', orgId, projectId, 'tasks', taskId] as const,
    stats: (orgId: string, projectId: string) =>
      ['board', orgId, projectId, 'stats'] as const,
    comments: (orgId: string, taskId: string) =>
      ['board', orgId, 'comments', taskId] as const,
    checklist: (orgId: string, taskId: string) =>
      ['board', orgId, 'checklist', taskId] as const,
    attachments: (orgId: string, taskId: string) =>
      ['board', orgId, 'attachments', taskId] as const,
  },
} as const
