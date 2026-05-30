from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.db_setup import get_db
from models.user import User
from services.analytics_service import AnalyticsService
from core.dependencies import require_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return AnalyticsService.get_summary(db)

    