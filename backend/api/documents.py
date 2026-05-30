from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from models.db_setup import get_db
from models.user import User
from schema.document import DocumentOut
from services.document_service import DocumentService
from ai.indexer import index_document
from core.dependencies import require_admin, require_user_or_admin

router = APIRouter(prefix="/documents", tags=["documents"])

def _background_index(db: Session, document_id: int):
    index_document(db, document_id)

@router.post("", response_model=DocumentOut)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    doc = DocumentService.upload(db, file, title, user_id=current_user.id)
    background_tasks.add_task(_background_index, db, doc.id)
    return doc


@router.get("", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    return DocumentService.list_documents(db)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_or_admin),
):
    return DocumentService.get_by_id(db, doc_id)


@router.post("/{doc_id}/reindex", response_model=dict)
def reindex_document(
    doc_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    background_tasks.add_task(_background_index, db, doc_id)
    return {"message": "Re-indexing started", "document_id": doc_id}