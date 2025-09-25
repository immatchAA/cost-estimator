from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VerificationCodeRequest(BaseModel):
    email: str

class VerificationCodeVerify(BaseModel):
    email: str
    code: str

class VerificationCode(BaseModel):
    id: Optional[str] = None
    email: str
    code: str
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_used: Optional[bool] = False

