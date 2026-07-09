from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.seed import seed_database

# Import routers
from app.routers import auth, resume, analyze, roadmap, interview, chat, trends, admin

# Create DB tables
Base.metadata.create_all(bind=engine)

# Auto-seed database tables on application launch
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    description="Resume Parser and Cloud Job Skill gap matching system.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins (e.g. ['http://localhost:5173'])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registrations under '/api' prefix
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(trends.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Serve uploads directory statically if it exists for avatar rendering
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "app": settings.APP_NAME,
        "api_documentation": "/docs"
    }
