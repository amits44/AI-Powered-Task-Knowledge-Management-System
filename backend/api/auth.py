from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.db_setup import get_db
from schema.auth import LoginRequest, TokenResponse, CreateUser, UserOut
from services.auth_service import AuthService
from core.dependencies import require_admin

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.login(db, payload)

@router.post("/register", response_model=UserOut)
def register(payload: CreateUser, db: Session = Depends(get_db)):
    user = AuthService.register(db, payload)
    return UserOut(id=user.id, name=user.name, email=user.email, role=user.role.name)