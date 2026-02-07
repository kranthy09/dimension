from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import get_settings
from app.api.routes import content, auth, github

settings = get_settings()

app = FastAPI(
    title="Portfolio API",
    description="Markdown-first content management with admin auth",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files - serve media files in development (Nginx handles in production)
media_path = Path(settings.MEDIA_ROOT)
if media_path.exists():
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

# Routes
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(content.router, prefix=settings.API_V1_PREFIX)
app.include_router(github.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {
        "message": "Portfolio API",
        "docs": "/docs",
        "health": "/health"
    }
