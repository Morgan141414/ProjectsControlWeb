from pydantic import BaseModel, ConfigDict, Field

<<<<<<< HEAD
from app.models.enums import JoinStatus, OrgRole
=======
from app.models.enums import JoinStatus
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb


class OrgCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)


class OrgResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    join_code: str
<<<<<<< HEAD
    description: str | None = None
    industry: str | None = None
    website: str | None = None
    logo_url: str | None = None
    owner_id: str | None = None
    is_active: bool = True
    max_members: int = 50
    auto_approve: bool = False
    welcome_message: str | None = None
    theme_color: str | None = None


class OrgWithRoleResponse(BaseModel):
    """Organization with the current user's role in it."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    join_code: str
    description: str | None = None
    industry: str | None = None
    website: str | None = None
    logo_url: str | None = None
    owner_id: str | None = None
    is_active: bool = True
    max_members: int = 50
    auto_approve: bool = False
    welcome_message: str | None = None
    theme_color: str | None = None
    role: str = "member"
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb


class JoinRequestCreate(BaseModel):
    org_code: str = Field(min_length=4, max_length=16)


class JoinRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    user_id: str
    status: JoinStatus
