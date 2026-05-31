from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User
from models.role import Role
from core.security import hash_password, verify_password, create_access_token
from schema.auth import LoginRequest, TokenResponse, CreateUser
from services.activity_service import ActivityService

DEFAULT_ADMIN = {"name": "Admin", "email": "admin@demo.com", "password": "admin123", "role_id": 1}
DEFAULT_USER  = {"name": "User", "email": "user@demo.com", "password": "user123", "role_id": 2}


class AuthService:

    @staticmethod
    def seed_roles(db: Session) -> None:
        for name in ("admin", "user"):
            if not db.query(Role).filter(Role.name == name).first():
                db.add(Role(name=name))
        db.commit()

    @staticmethod
    def seed_default_accounts(db: Session) -> None:
        for account in (DEFAULT_ADMIN, DEFAULT_USER):
            if not db.query(User).filter(User.email == account["email"]).first():
                role = db.query(Role).filter(Role.id == account["role_id"]).first()
                user = User(
                    name=account["name"],
                    email=account["email"],
                    password_hash=hash_password(account["password"]),
                    role_id=account["role_id"],
                )
                db.add(user)
        db.commit()

        print("\n" + "="*50)
        print("  DEFAULT LOGIN CREDENTIALS")
        print("="*50)
        print(f"  Admin  →  {DEFAULT_ADMIN['email']}  /  {DEFAULT_ADMIN['password']}")
        print(f"  User   →  {DEFAULT_USER['email']}  /  {DEFAULT_USER['password']}")
        print("="*50 + "\n")

    @staticmethod
    def register(db: Session, payload: CreateUser) -> User:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        role = db.query(Role).filter(Role.id == payload.role_id).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role_id")
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role_id=payload.role_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, payload: LoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        token = create_access_token({"sub": str(user.id), "role": user.role.name})
        ActivityService.log(db, user.id, "login")
        return TokenResponse(
            access_token=token,
            role=user.role.name,
            user_id=user.id,
            name=user.name,
        )