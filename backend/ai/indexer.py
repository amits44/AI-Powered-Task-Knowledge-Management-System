from sqlalchemy.orm import Session
from ai.embedder import chunk_text, embed_texts
from ai.vector_store import vector_store
from models.document import Document
from services.document_service import DocumentService

def index_document(db: Session, document_id: int) -> int:
    doc: Document = DocumentService.get_by_id(db, document_id)
    if doc.file_type != "txt":
        return 0
    with open(doc.stored_path, "r", errors="ignore") as f:
        text = f.read()
    if not text.strip():
        return 0
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    metadata_list = [
        {
            "document_id": doc.id,
            "document_title": doc.title,
            "chunk_index": i,
            "chunk_text": chunk,
        }
        for i, chunk in enumerate(chunks)
    ]
    vector_store.add(embeddings, metadata_list)
    DocumentService.mark_indexed(db, document_id)
    return len(chunks)