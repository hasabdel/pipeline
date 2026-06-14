"""
Email Ingestion Service
========================
Fetches PDF attachments from IMAP inbox and processes them through
the main ATS pipeline (LayoutLMv3 → ChromaDB).

Adapted from Email-pipeline/pipeline.py but integrated with the
central ATS system.
"""

import imaplib
import email
import email.header
import sqlite3
import hashlib
import logging
import shutil
from pathlib import Path

from config import (
    IMAP_HOST, IMAP_PORT, EMAIL_USER, EMAIL_PASS,
    MAILBOX, MARK_SEEN, EMAIL_PIPELINE_DB_PATH,
    UPLOAD_DIR, RESUMES_DIR
)
from model import process_resume
from database import ResumeDatabase

log = logging.getLogger(__name__)


# ── Database (email tracking) ─────────────────────────────────────────────

def init_email_db() -> sqlite3.Connection:
    """Create the email tracking tables if they don't exist."""
    conn = sqlite3.connect(str(EMAIL_PIPELINE_DB_PATH))
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
            status       TEXT DEFAULT 'processed',
            saved_at     TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    return conn


def _email_already_processed(conn, message_id: str) -> bool:
    cur = conn.execute("SELECT id FROM emails WHERE message_id = ?", (message_id,))
    return cur.fetchone() is not None


def _attachment_already_processed(conn, sha256: str) -> bool:
    cur = conn.execute("SELECT id FROM attachments WHERE sha256 = ?", (sha256,))
    return cur.fetchone() is not None


def _save_email_record(conn, message_id, sender, subject, received_at) -> int:
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


def _save_attachment_record(conn, email_id, filename, sha256, saved_path, size, status="processed"):
    conn.execute(
        "INSERT INTO attachments (email_id, filename, sha256, saved_path, size_bytes, status) VALUES (?,?,?,?,?,?)",
        (email_id, filename, sha256, str(saved_path), size, status),
    )
    conn.commit()


# ── Helpers ───────────────────────────────────────────────────────────────

def _decode_header(raw) -> str:
    parts = email.header.decode_header(raw or "")
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            decoded.append(part)
    return " ".join(decoded).strip()


def _sha256_of(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _safe_filename(name: str) -> str:
    return Path(name).name.replace("/", "_").replace("\\", "_")


def _unique_path(directory: Path, filename: str) -> Path:
    stem = Path(filename).stem
    suffix = Path(filename).suffix
    candidate = directory / filename
    counter = 1
    while candidate.exists():
        candidate = directory / f"{stem}_{counter}{suffix}"
        counter += 1
    return candidate


# ── Core: Fetch + Process ─────────────────────────────────────────────────

def fetch_and_process_emails(db: ResumeDatabase) -> dict:
    """
    Main integration function:
    1. Connect to IMAP
    2. Download PDF attachments
    3. Process each through LayoutLMv3
    4. Index in ChromaDB
    5. Move to resumes_pdf_db/

    Returns a summary dict with counts and details.
    """
    if not EMAIL_USER or not EMAIL_PASS:
        return {
            "status": "error",
            "message": "Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.",
            "processed": 0, "skipped": 0, "errors": 0
        }

    conn = init_email_db()
    results = {
        "status": "success",
        "processed": 0,
        "skipped": 0,
        "errors": 0,
        "details": []
    }

    try:
        log.info(f"Connecting to {IMAP_HOST}:{IMAP_PORT} as {EMAIL_USER} …")
        with imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT) as imap:
            imap.login(EMAIL_USER, EMAIL_PASS)
            imap.select(MAILBOX)

            _, msg_ids = imap.search(None, "UNSEEN")
            ids = msg_ids[0].split()

            if not ids:
                results["message"] = "No new emails found."
                log.info("No new emails found.")
                return results

            log.info(f"Found {len(ids)} unseen email(s). Scanning for PDFs …")

            for uid in ids:
                _, data = imap.fetch(uid, "(RFC822)")
                raw = data[0][1]
                msg = email.message_from_bytes(raw)

                subject    = _decode_header(msg.get("Subject"))
                sender     = _decode_header(msg.get("From"))
                message_id = msg.get("Message-ID", f"no-id-{uid.decode()}")
                date_str   = msg.get("Date", "")

                # Check if any part is a PDF
                has_pdf = any(
                    part.get_content_type() == "application/pdf"
                    or (part.get_filename() or "").lower().endswith(".pdf")
                    for part in msg.walk()
                )

                if not has_pdf:
                    continue

                log.info(f"  >> From: {sender} | Subject: {subject}")
                email_id = _save_email_record(conn, message_id, sender, subject, date_str)

                for part in msg.walk():
                    filename_raw = part.get_filename()
                    if not filename_raw:
                        continue

                    filename = _safe_filename(_decode_header(filename_raw))
                    content_type = part.get_content_type()

                    is_pdf = (
                        content_type == "application/pdf"
                        or filename.lower().endswith(".pdf")
                    )
                    if not is_pdf:
                        continue

                    payload = part.get_payload(decode=True)
                    if not payload:
                        continue

                    digest = _sha256_of(payload)

                    # Skip if we already processed this exact file
                    if _attachment_already_processed(conn, digest):
                        log.info(f"    -- Skipping duplicate: {filename}")
                        results["skipped"] += 1
                        results["details"].append({
                            "filename": filename,
                            "status": "skipped",
                            "reason": "duplicate (SHA-256 match)"
                        })
                        continue

                    # === INTEGRATION POINT ===
                    # Save to uploads/ temporarily, process, then move to resumes_pdf_db/
                    temp_path = _unique_path(UPLOAD_DIR, filename)
                    temp_path.write_bytes(payload)

                    try:
                        # 1. Run LayoutLMv3 AI pipeline
                        parsed_json = process_resume(str(temp_path))

                        # 2. Define permanent path
                        permanent_path = _unique_path(RESUMES_DIR, filename)

                        # 3. Index in ChromaDB with permanent path
                        db.insert_resume(parsed_json, source_file=str(permanent_path))

                        # 4. Move to permanent storage
                        shutil.move(str(temp_path), str(permanent_path))

                        # 5. Track in email pipeline DB
                        _save_attachment_record(
                            conn, email_id, filename, digest,
                            str(permanent_path), len(payload), "processed"
                        )

                        name = parsed_json.get("NAME", ["Unknown"])[0] if parsed_json.get("NAME") else "Unknown"
                        log.info(f"    ✅ Processed: {filename} → {name}")
                        results["processed"] += 1
                        results["details"].append({
                            "filename": filename,
                            "name": name,
                            "status": "processed"
                        })

                    except Exception as e:
                        log.error(f"    ❌ Failed to process {filename}: {e}")
                        # Clean up temp file on failure
                        if temp_path.exists():
                            temp_path.unlink()
                        _save_attachment_record(
                            conn, email_id, filename, digest,
                            "", len(payload), f"error: {str(e)[:200]}"
                        )
                        results["errors"] += 1
                        results["details"].append({
                            "filename": filename,
                            "status": "error",
                            "reason": str(e)
                        })

                if MARK_SEEN:
                    imap.store(uid, "+FLAGS", "\\Seen")

        total = results["processed"] + results["skipped"] + results["errors"]
        results["message"] = f"Processed {results['processed']}/{total} PDF(s) from email."

    except imaplib.IMAP4.error as e:
        results["status"] = "error"
        results["message"] = f"IMAP connection error: {str(e)}"
        log.error(f"IMAP error: {e}")
    except Exception as e:
        results["status"] = "error"
        results["message"] = f"Pipeline error: {str(e)}"
        log.error(f"Pipeline error: {e}")
    finally:
        conn.close()

    return results
