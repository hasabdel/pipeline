"""
Email PDF Pipeline
==================
Connects to Gmail (or any IMAP server) via IMAP, downloads PDF attachments,
saves them to a local /resumes/ folder, and logs everything to SQLite.

Setup:
1. pip install -r requirements.txt
2. Copy .env.example to .env and fill in your credentials
3. For Gmail: enable IMAP in settings + use an App Password
   (Google Account → Security → 2FA → App Passwords)
4. Run: python pipeline.py
"""

import imaplib
import email
import email.header
import os
import sqlite3
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# ── Config ──────────────────────────────────────────────────────────────────

load_dotenv()

IMAP_HOST   = os.getenv("IMAP_HOST", "imap.gmail.com")
IMAP_PORT   = int(os.getenv("IMAP_PORT", 993))
EMAIL_USER  = os.getenv("EMAIL_USER")          # your@gmail.com
EMAIL_PASS  = os.getenv("EMAIL_PASS")          # App Password (not your real pw)
MAILBOX     = os.getenv("MAILBOX", "INBOX")
RESUME_DIR  = Path(os.getenv("RESUME_DIR", "./resumes"))
DB_PATH     = Path(os.getenv("DB_PATH", "./pipeline.db"))
MARK_SEEN   = os.getenv("MARK_SEEN", "true").lower() == "true"

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.StreamHandler(open(os.devnull, 'w') if False else __import__('sys').stdout),
        logging.FileHandler("pipeline.log", encoding="utf-8"),
    ],
)
# Fix Windows console encoding
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
log = logging.getLogger(__name__)

# ── Database ─────────────────────────────────────────────────────────────────

def init_db(db_path: Path) -> sqlite3.Connection:
    """Create tables if they don't exist."""
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS emails (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id  TEXT    UNIQUE,
            sender      TEXT,
            subject     TEXT,
            received_at TEXT,
            processed_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS attachments (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id     INTEGER REFERENCES emails(id),
            filename     TEXT,
            sha256       TEXT,
            saved_path   TEXT,
            size_bytes   INTEGER,
            saved_at     TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    return conn


def save_email_record(conn, message_id, sender, subject, received_at) -> int:
    """Insert email metadata; return row id (or existing id if duplicate)."""
    cur = conn.execute(
        "SELECT id FROM emails WHERE message_id = ?", (message_id,)
    )
    row = cur.fetchone()
    if row:
        return row[0]

    cur = conn.execute(
        "INSERT INTO emails (message_id, sender, subject, received_at) VALUES (?,?,?,?)",
        (message_id, sender, subject, received_at),
    )
    conn.commit()
    return cur.lastrowid


def save_attachment_record(conn, email_id, filename, sha256, saved_path, size):
    conn.execute(
        "INSERT INTO attachments (email_id, filename, sha256, saved_path, size_bytes) VALUES (?,?,?,?,?)",
        (email_id, filename, sha256, str(saved_path), size),
    )
    conn.commit()


# ── Helpers ───────────────────────────────────────────────────────────────────

def decode_header(raw) -> str:
    """Decode email header (handles encoded words like =?UTF-8?...)."""
    parts = email.header.decode_header(raw or "")
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            decoded.append(part)
    return " ".join(decoded).strip()


def sha256_of(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def safe_filename(name: str) -> str:
    """Strip path separators from attachment filenames."""
    return Path(name).name.replace("/", "_").replace("\\", "_")


def unique_path(directory: Path, filename: str) -> Path:
    """If file exists, append _1, _2, … before extension."""
    stem = Path(filename).stem
    suffix = Path(filename).suffix
    candidate = directory / filename
    counter = 1
    while candidate.exists():
        candidate = directory / f"{stem}_{counter}{suffix}"
        counter += 1
    return candidate


# ── Core pipeline ─────────────────────────────────────────────────────────────

def fetch_pdfs(conn: sqlite3.Connection):
    RESUME_DIR.mkdir(parents=True, exist_ok=True)

    log.info(f"Connecting to {IMAP_HOST}:{IMAP_PORT} as {EMAIL_USER} …")
    with imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT) as imap:
        imap.login(EMAIL_USER, EMAIL_PASS)
        imap.select(MAILBOX)

        # Search for UNSEEN emails with PDF attachments
        # (We search ALL unseen; attachment filtering happens locally)
        _, msg_ids = imap.search(None, "UNSEEN")
        ids = msg_ids[0].split()

        if not ids:
            log.info("No new emails found.")
            return

        log.info(f"Found {len(ids)} unseen email(s). Scanning for PDF attachments …")

        total_saved = 0

        for uid in ids:
            _, data = imap.fetch(uid, "(RFC822)")
            raw = data[0][1]
            msg = email.message_from_bytes(raw)

            subject    = decode_header(msg.get("Subject"))
            sender     = decode_header(msg.get("From"))
            message_id = msg.get("Message-ID", f"no-id-{uid.decode()}")
            date_str   = msg.get("Date", "")

            has_pdf = any(
                part.get_content_type() == "application/pdf"
                or (part.get_filename() or "").lower().endswith(".pdf")
                for part in msg.walk()
            )

            if not has_pdf:
                continue

            log.info(f"  >> From: {sender} | Subject: {subject}")
            email_id = save_email_record(conn, message_id, sender, subject, date_str)

            for part in msg.walk():
                content_type = part.get_content_type()
                filename_raw = part.get_filename()

                if not filename_raw:
                    continue

                filename = safe_filename(decode_header(filename_raw))

                is_pdf = (
                    content_type == "application/pdf"
                    or filename.lower().endswith(".pdf")
                )
                if not is_pdf:
                    continue

                payload = part.get_payload(decode=True)
                if not payload:
                    continue

                digest = sha256_of(payload)

                # Skip exact duplicates (same hash already in DB)
                cur = conn.execute(
                    "SELECT id FROM attachments WHERE sha256 = ?", (digest,)
                )
                if cur.fetchone():
                    log.info(f"    -- Skipping duplicate: {filename}")
                    continue

                dest = unique_path(RESUME_DIR, filename)
                dest.write_bytes(payload)
                save_attachment_record(conn, email_id, filename, digest, dest, len(payload))

                log.info(f"    OK Saved: {dest}  ({len(payload):,} bytes)")
                total_saved += 1

            if MARK_SEEN:
                imap.store(uid, "+FLAGS", "\\Seen")

        log.info(f"\nDone. {total_saved} PDF(s) saved to {RESUME_DIR.resolve()}")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not EMAIL_USER or not EMAIL_PASS:
        raise SystemExit("❌  Set EMAIL_USER and EMAIL_PASS in your .env file first.")

    conn = init_db(DB_PATH)
    try:
        fetch_pdfs(conn)
    finally:
        conn.close()