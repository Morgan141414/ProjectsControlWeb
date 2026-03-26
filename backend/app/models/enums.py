from enum import Enum


class CertificateStatus(str, Enum):
    active = "active"
    expired = "expired"
    revoked = "revoked"


class OrgRole(str, Enum):
    super_ceo = "super_ceo"
    ceo = "ceo"
    superadmin = "superadmin"
    hr = "hr"
    sysadmin = "sysadmin"
    team_lead = "team_lead"
    project_manager = "project_manager"
    developer = "developer"
    founder = "founder"
    member = "member"


class JoinStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TeamRole(str, Enum):
    team_lead = "team_lead"
    project_manager = "project_manager"
    developer = "developer"
    member = "member"



class AuditAction(str, Enum):
    create = "create"
    update = "update"
    delete = "delete"
    approve = "approve"
    reject = "reject"
    login = "login"


class PrivacyTarget(str, Enum):
    app_name = "app_name"
    window_title = "window_title"


class MatchType(str, Enum):
    equals = "equals"
    contains = "contains"
    regex = "regex"


class PrivacyAction(str, Enum):
    redact = "redact"
    ignore = "ignore"


class NotificationEvent(str, Enum):
    report_export_ready = "report_export_ready"


class ScorePeriod(str, Enum):
    daily = "daily"
    weekly = "weekly"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"
