import os
import shutil
from typing import List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from core.config import settings
from models.document import Document
from services.activity_service import ActivityService

ALLOWED_EXTENSIONS = {"txt", "pdf"}

class DocumentService:
    @staticmethod
    def upload(db: Session, file: UploadFile, title: str, user_id: int) -> Document:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only .txt and .pdf files are allowed")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        stored_name = f"{user_id}_{file.filename}"
        stored_path = os.path.join(settings.UPLOAD_DIR, stored_name)
        with open(stored_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        preview = None
        if ext == "txt":
            with open(stored_path, "r", errors="ignore") as f:
                preview = f.read(500)

        doc = Document(
            title=title,
            filename=file.filename,
            stored_path=stored_path,
            file_type=ext,
            content_preview=preview,
            uploaded_by=user_id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        ActivityService.log(db, user_id, "document_upload", {"document_id": doc.id})
        return doc

    @staticmethod
    def list_documents(db: Session) -> List[Document]:
        return db.query(Document).order_by(Document.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, doc_id: int) -> Document:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    @staticmethod
    def mark_indexed(db: Session, doc_id: int) -> None:
        doc = DocumentService.get_by_id(db, doc_id)
        doc.is_indexed = True
        db.commit()