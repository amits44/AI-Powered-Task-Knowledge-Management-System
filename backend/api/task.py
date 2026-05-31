from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from models.db_setup import get_db
from models.task import TaskStatus
from models.user import User
from schema.task import CreateTask, UpdateTask, TaskOut
from services.task_service import TaskService
from core.dependencies import require_admin, require_user_or_admin

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskOut)
def create_task(payload: CreateTask,db: Session = Depends(get_db),current_user: User = Depends(require_admin),):
    return TaskService.create(db, payload, creator_id=current_user.id)

@router.get("", response_model=List[TaskOut])
def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user id"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):

    if current_user.role.name == "user":
        assigned_to = current_user.id  
    return TaskService.list_tasks(db, status=status, assigned_to=assigned_to)

@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    return TaskService.get_by_id(db, task_id)

@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: int,
    payload: UpdateTask,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    return TaskService.update_status(db, task_id, payload, user_id=current_user.id)