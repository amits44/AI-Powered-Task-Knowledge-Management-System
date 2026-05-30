from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.db_setup import get_db
from models.user import User
from schema.document import SearchRequest, SearchResponse
from services.search_service import SearchService
from core.dependencies import require_user_or_admin

router = APIRouter(prefix="/search", tags=["search"])

@router.post("", response_model=SearchResponse)
def semantic_search(
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):

    return SearchService.search(
        db,
        query=payload.query,
        top_k=payload.top_k,
        user_id=current_user.id,
    )