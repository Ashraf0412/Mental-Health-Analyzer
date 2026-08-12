from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int]
    role: Optional[str]


class UserOut(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    email: str
    password: str

