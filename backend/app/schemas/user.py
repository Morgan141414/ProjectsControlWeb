from pydantic import BaseModel, ConfigDict, EmailStr

<<<<<<< HEAD
from app.models.enums import OrgRole

=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None
<<<<<<< HEAD
    phone: str | None = None
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    bio: str | None = None
    specialty: str | None = None
    avatar_url: str | None = None
    socials_json: str | None = None
<<<<<<< HEAD
    is_superadmin: bool = False
    totp_enabled: bool = False
    position: str | None = None
    experience_years: int | None = None
    skills: str | None = None
    education: str | None = None
    city: str | None = None
    portfolio_url: str | None = None
    is_looking_for_job: bool = False
    desired_salary: int | None = None
    org_id: str | None = None
    org_role: OrgRole | None = None
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None
<<<<<<< HEAD
    phone: str | None = None
=======
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    bio: str | None = None
    specialty: str | None = None
    avatar_url: str | None = None
    socials_json: str | None = None
