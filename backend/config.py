"""
Centralized Configuration for Backend Paths

This file manages all file paths used across the backend.
Change paths here instead of modifying each individual file.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# BASE PATHS
# ==========================================

# Backend root directory
BACKEND_DIR = Path(__file__).parent.resolve()

# Project root (one level up from backend)
PROJECT_DIR = BACKEND_DIR.parent.parent

# ==========================================
# AI MODEL PATHS
# ==========================================

# LayoutLMv3 model weights directory
MODEL_PATH = BACKEND_DIR / "content" / "final-v3-weights"

# ==========================================
# DATABASE PATHS
# ==========================================

# ChromaDB vector database storage
CHROMADB_PATH = BACKEND_DIR / "resume_vectordb"

# Search history SQLite database
SEARCH_HISTORY_DB_PATH = BACKEND_DIR / "search_history.db"

# ==========================================
# FILE UPLOAD/STORAGE PATHS
# ==========================================

# Temporary upload directory for processing
UPLOAD_DIR = BACKEND_DIR / "uploads"

# Permanent resume storage directory
RESUMES_DIR = BACKEND_DIR / "resumes_pdf_db"

# ==========================================
# CREATE DIRECTORIES IF THEY DON'T EXIST
# ==========================================

def ensure_directories():
    """Create all necessary directories if they don't exist"""
    UPLOAD_DIR.mkdir(exist_ok=True)
    RESUMES_DIR.mkdir(exist_ok=True)
    CHROMADB_PATH.mkdir(exist_ok=True)
    
# Call this on startup
ensure_directories()

# ==========================================
# EMAIL PIPELINE CONFIGURATION
# ==========================================

# Email pipeline database (tracks which emails have been processed)
EMAIL_PIPELINE_DB_PATH = BACKEND_DIR / "email_pipeline.db"

# IMAP Settings (loaded from .env file)
IMAP_HOST = os.getenv("IMAP_HOST", "imap.gmail.com")
IMAP_PORT = int(os.getenv("IMAP_PORT", 993))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
MAILBOX = os.getenv("MAILBOX", "INBOX")
MARK_SEEN = os.getenv("MARK_SEEN", "true").lower() == "true"

# ==========================================
# PATH STRINGS FOR LOGGING/DISPLAY
# ==========================================

def log_paths():
    """Print all configured paths for debugging"""
    print("\n" + "="*60)
    print("BACKEND CONFIGURATION PATHS")
    print("="*60)
    print(f"Backend Dir: {BACKEND_DIR}")
    print(f"Project Dir: {PROJECT_DIR}")
    print(f"Model Path: {MODEL_PATH}")
    print(f"ChromaDB Path: {CHROMADB_PATH}")
    print(f"Search History DB: {SEARCH_HISTORY_DB_PATH}")
    print(f"Upload Dir: {UPLOAD_DIR}")
    print(f"Resumes Dir: {RESUMES_DIR}")
    print(f"Email Pipeline DB: {EMAIL_PIPELINE_DB_PATH}")
    print(f"IMAP Host: {IMAP_HOST}")
    print(f"Email User: {EMAIL_USER or '(not set)'}")
    print("="*60 + "\n")
