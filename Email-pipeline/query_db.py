"""
query_db.py  –  Inspect what the pipeline collected
Usage:
    python query_db.py           # list all saved PDFs
    python query_db.py --stats   # summary stats
    python query_db.py --search "john"
"""

import sqlite3
import argparse
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()
DB_PATH = Path(os.getenv("DB_PATH", "./pipeline.db"))


def list_all(conn):
    rows = conn.execute("""
        SELECT e.sender, e.subject, e.received_at,
               a.filename, a.size_bytes, a.saved_at
        FROM attachments a
        JOIN emails e ON e.id = a.email_id
        ORDER BY a.saved_at DESC
    """).fetchall()

    if not rows:
        print("No records yet.")
        return

    print(f"\n{'SENDER':<35} {'FILENAME':<35} {'SIZE':>8}  SAVED AT")
    print("─" * 100)
    for sender, subject, received, filename, size, saved_at in rows:
        print(f"{sender[:34]:<35} {filename[:34]:<35} {size:>7,}B  {saved_at}")
    print(f"\nTotal: {len(rows)} file(s)\n")


def stats(conn):
    total_emails = conn.execute("SELECT COUNT(*) FROM emails").fetchone()[0]
    total_files  = conn.execute("SELECT COUNT(*) FROM attachments").fetchone()[0]
    total_bytes  = conn.execute("SELECT SUM(size_bytes) FROM attachments").fetchone()[0] or 0
    print(f"\n📬 Emails processed : {total_emails}")
    print(f"📄 PDFs saved       : {total_files}")
    print(f"💾 Total size       : {total_bytes / 1024:.1f} KB\n")


def search(conn, query):
    q = f"%{query}%"
    rows = conn.execute("""
        SELECT e.sender, e.subject, a.filename, a.saved_path
        FROM attachments a JOIN emails e ON e.id = a.email_id
        WHERE e.sender LIKE ? OR e.subject LIKE ? OR a.filename LIKE ?
    """, (q, q, q)).fetchall()

    if not rows:
        print(f"No results for '{query}'.")
        return
    for sender, subject, filename, path in rows:
        print(f"  {sender} | {subject} | {filename}")
        print(f"    → {path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats",  action="store_true")
    parser.add_argument("--search", type=str)
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    if args.stats:
        stats(conn)
    elif args.search:
        search(conn, args.search)
    else:
        list_all(conn)
    conn.close()
