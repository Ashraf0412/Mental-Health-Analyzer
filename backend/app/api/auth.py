from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..schemas.auth import RegisterRequest, Token, LoginRequest, UserOut
from ..models.user import User
from ..models.patient import Patient
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        role="PATIENT",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # create corresponding patient record
    identifier = f"PID-{user.id:06d}"
    patient = Patient(user_id=user.id, patient_identifier=identifier, full_name=req.full_name or "")
    db.add(patient)
    db.commit()
    db.refresh(patient)

    return user


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=60 * 24 * 7)
    token = create_access_token({"user_id": user.id, "role": user.role}, expires_delta=access_token_expires)

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
