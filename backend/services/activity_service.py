from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from models.activity_log import ActivityLog

class ActivityService:
    @staticmethod
    def log(db: Session,user_id: int,action: str,metadata: Optional[Dict[str, Any]] = None,) -> ActivityLog:
        entry = ActivityLog(user_id=user_id, action=action, metadata_=metadata or {})
        db.add(entry)
        db.commit()
        return entry