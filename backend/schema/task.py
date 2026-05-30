from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.task import TaskStatus


class CreateTask(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None

class UpdateTask(BaseModel):
    status: TaskStatus

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    assigned_to: Optional[int]
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True