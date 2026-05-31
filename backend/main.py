from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.db_setup import Base, engine, SessionLocal
from api import auth, task, documents, search, analytics, users
from services.auth_service import AuthService
import models.role
import models.user
import models.task
import models.document
import models.activity_log

app = FastAPI(
    title="AI Task & Knowledge Management API",
    description="Semantic search + task management with RBAC",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(task.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(analytics.router)
app.include_router(users.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        AuthService.seed_roles(db)
    finally:
        db.close()


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "message": "AI Task & Knowledge Management API"}
