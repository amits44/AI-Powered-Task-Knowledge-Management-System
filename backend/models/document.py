from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from .db_setup import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)       
    stored_path = Column(String(500), nullable=False)    
    file_type = Column(String(10), default="txt")       
    content_preview = Column(Text, nullable=True)     
    is_indexed = Column(Boolean, default=False) 
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    
    uploader = relationship("User", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document {self.id}: {self.title}>"