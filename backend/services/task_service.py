from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.task import Task, TaskStatus
from schema.task import TaskCreate, TaskUpdate
from services.activity_service import ActivityService

class TaskService:
    @staticmethod
    def create(db: Session, payload: TaskCreate, creator_id: int) -> Task:
        task = Task(
            title=payload.title,
            description=payload.description,
            assigned_to=payload.assigned_to,
            created_by=creator_id,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        ActivityService.log(db, creator_id, "task_create", {"task_id": task.id})
        return task

    @staticmethod
    def list_tasks(db: Session,status: Optional[TaskStatus] = None,assigned_to: Optional[int] = None,) -> List[Task]:
        q = db.query(Task)
        if status:
            q = q.filter(Task.status == status)
        if assigned_to:
            q = q.filter(Task.assigned_to == assigned_to)
        return q.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, task_id: int) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @staticmethod
    def update_status(db: Session, task_id: int, payload: TaskUpdate, user_id: int) -> Task:
        task = TaskService.get_by_id(db, task_id)
        task.status = payload.status
        db.commit()
        db.refresh(task)
        ActivityService.log(
            db, user_id, "task_update",
            {"task_id": task_id, "new_status": payload.status},
        )
        return task