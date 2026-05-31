from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from models.db_setup import get_db
from models.user import User
from schema.auth import CreateUser, UserOut
from services.auth_service import AuthService
from core.dependencies import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only: list all registered users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserOut(id=u.id, name=u.name, email=u.email, role=u.role.name)
        for u in users
    ]


@router.post("", response_model=UserOut)
def create_user(
    payload: CreateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only: create a new user account."""
    user = AuthService.register(db, payload)
    return UserOut(id=user.id, name=user.name, email=user.email, role=user.role.name)


@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only: delete a user account."""
    if user_id == current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} deleted successfully"}
