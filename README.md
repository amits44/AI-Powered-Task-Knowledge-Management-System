# KnowledgeAI

A task and knowledge management system where you can manage tasks, upload documents, and search through them using semantic search — all with role-based access control.

---

## What it does

- **Tasks** — create, assign, and track tasks across your team
- **Documents** — upload files and have them automatically indexed for search
- **Semantic Search** — find documents by meaning, not just keywords
- **Analytics** — get a bird's-eye view of team activity (admin only)
- **User Management** — create users, assign roles, control access

There are two roles: `admin` (full access) and `user` (tasks + search only).

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios

**Backend**
- FastAPI (Python)
- SQLAlchemy + MySQL
- JWT authentication (python-jose)
- bcrypt for password hashing

**AI / Search**
- `sentence-transformers` — generates embeddings using `all-MiniLM-L6-v2`
- FAISS — stores and searches vector embeddings locally

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL running locally

---

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env
# Fill in your DATABASE_URL and SECRET_KEY
```

Your `.env` should look like this:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/yourdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads
```

```bash
# Start the server
uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`.  
On first startup, it creates the DB tables and seeds two default accounts.

---

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be at `http://localhost:3000`.

---

## Default Login Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@demo.com    | admin123   |
| User  | user@demo.com     | user123    |


---

## Project Structure

```
├── backend/
│   ├── ai/          # Embeddings and FAISS vector store
│   ├── api/         # Route handlers
│   ├── core/        # Auth, config, dependencies
│   ├── models/      # Database models
│   ├── schema/      # Pydantic schemas
│   ├── services/    # Business logic
│   └── main.py      # App entry point
│
└── frontend/
    └── src/
        ├── api/       # Axios instance and API calls
        ├── context/   # Auth state
        ├── pages/     # Dashboard, Tasks, Documents, etc.
        └── components/ # Navbar and shared components
```
