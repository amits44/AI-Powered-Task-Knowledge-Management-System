from sqlalchemy.orm import Session
from sqlalchemy import func
from models.task import Task, TaskStatus
from models.activity_log import ActivityLog
from models.document import Document


class AnalyticsService:
    @staticmethod
    def get_summary(db: Session) -> dict:
        total_tasks = db.query(func.count(Task.id)).scalar()
        completed = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.completed).scalar()
        pending = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.pending).scalar()
        in_progress = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.in_progress).scalar()
        total_docs = db.query(func.count(Document.id)).scalar()

        search_logs = (
            db.query(ActivityLog.metadata_).filter(ActivityLog.action == "search")
            .order_by(ActivityLog.created_at.desc()).limit(50).all()
        )
        query_counts: dict = {}
        for (meta,) in search_logs:
            q = (meta or {}).get("query", "")
            if q:
                query_counts[q] = query_counts.get(q, 0) + 1

        top_queries = sorted(query_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        return {
            "tasks": {
                "total": total_tasks,
                "completed": completed,
                "pending": pending,
                "in_progress": in_progress,
            },
            "documents": {"total": total_docs},
            "top_search_queries": [{"query": q, "count": c} for q, c in top_queries],
        }