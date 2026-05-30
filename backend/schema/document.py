from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    file_type: str
    is_indexed: bool
    uploaded_by: int
    created_at: datetime
    content_preview: Optional[str]

    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    document_id: int
    document_title: str
    chunk: str
    score: float

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]