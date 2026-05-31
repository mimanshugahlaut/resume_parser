"""
ResumeIQ — FastAPI Backend Entry Point
========================================
Handles app startup, CORS configuration, spaCy model loading,
and router registration.

Run with:
    uvicorn main:app --reload --port 8000
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

try:
    import spacy
except ImportError:  # spaCy is optional; parsing still works without NER.
    spacy = None

from .routers import match, parse, resumes

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lifespan: load spaCy model once at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — runs on startup and shutdown."""
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("Starting ResumeIQ backend...")

    # Load spaCy model (downloaded via: python -m spacy download en_core_web_sm)
    if spacy is None:
        logger.warning(
            "spaCy is not installed. Install requirements or run: pip install spacy\n"
            "Name extraction will use local heuristics and Gemini when configured."
        )
        app.state.nlp_model = None
    else:
        try:
            app.state.nlp_model = spacy.load(
                "en_core_web_sm",
                disable=["tok2vec", "tagger", "parser", "attribute_ruler", "lemmatizer"],
            )
            logger.info("spaCy model 'en_core_web_sm' loaded successfully.")
        except OSError:
            logger.warning(
                "spaCy model 'en_core_web_sm' not found. "
                "Run: python -m spacy download en_core_web_sm\n"
                "Name extraction will use local heuristics and Gemini when configured."
            )
            app.state.nlp_model = None

    # Initialise in-memory resume store
    app.state.resumes = {}
    logger.info("In-memory resume store initialised.")

    yield  # App is running

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("Shutting down ResumeIQ backend. Clearing %d stored resumes.", len(app.state.resumes))
    app.state.resumes.clear()


# ---------------------------------------------------------------------------
# FastAPI app instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ResumeIQ API",
    description=(
        "AI-Powered Resume Parser. Upload PDF or DOCX resumes and get structured JSON data "
        "including contact info, education, experience, skills, and a professional summary. "
        "Also supports job description matching and ATS scoring."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

origins = [
    "http://localhost:5173",       # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",       # Alternative dev port
    "https://huggingface.co",
]

configured_frontend_origin = os.getenv("FRONTEND_ORIGIN")
if configured_frontend_origin:
    origins.append(configured_frontend_origin.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com|hf\.space)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(parse.router)
app.include_router(match.router)
app.include_router(resumes.router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    """Returns API status and spaCy model availability."""
    return {
        "status": "ok",
        "service": "ResumeIQ API",
        "version": "1.0.0",
        "spacy_loaded": getattr(app.state, "nlp_model", None) is not None,
        "resumes_in_session": len(getattr(app.state, "resumes", {})),
    }


# ---------------------------------------------------------------------------
# Static frontend for single-container deployments
# ---------------------------------------------------------------------------

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_frontend_index():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend_route(path: str):
        candidate = frontend_dist / path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(frontend_dist / "index.html")
