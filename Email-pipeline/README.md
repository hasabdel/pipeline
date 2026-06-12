# 📥 Email PDF Pipeline

Fetches PDF attachments from your inbox via IMAP and saves them locally + in SQLite.

## Quick Start

```bash
# 1. Install dependencies (only one: python-dotenv)
pip install -r requirements.txt

# 2. Configure credentials
cp .env.example .env
# Edit .env with your email + App Password

# 3. Run
python pipeline.py
```

## Gmail Setup (required)

1. Enable IMAP: Gmail Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP
2. Create an App Password (you need 2FA enabled):
   - Google Account → Security → 2-Step Verification → App Passwords
   - Choose "Mail" + your device → copy the 16-char password
3. Paste that password into `EMAIL_PASS` in your `.env`

## Other Email Providers

| Provider    | IMAP_HOST              | Notes                        |
|-------------|------------------------|------------------------------|
| Gmail       | imap.gmail.com         | Use App Password             |
| Outlook     | outlook.office365.com  | Use your normal password     |
| Yahoo       | imap.mail.yahoo.com    | Use App Password             |
| ProtonMail  | 127.0.0.1              | Requires ProtonMail Bridge   |

## Automate it (run every 5 min)

**Linux/Mac – cron:**
```
*/5 * * * * cd /path/to/pipeline && python pipeline.py >> pipeline.log 2>&1
```

**Windows – Task Scheduler:**
Create a Basic Task → trigger every 5 minutes → action: `python C:\path\pipeline.py`

## Query the database

```bash
python query_db.py              # list all saved PDFs
python query_db.py --stats      # summary
python query_db.py --search "john"   # search by sender/filename/subject
```

## Database Schema

**emails** – one row per email processed  
**attachments** – one row per PDF saved (with sha256 for deduplication)

## What it does

- Connects over SSL to your IMAP inbox
- Scans all **unread** emails
- Skips emails with no PDF attachments
- Downloads each PDF, saves to `./resumes/`
- Logs metadata to `./pipeline.db` (SQLite)
- Deduplicates by SHA-256 hash (won't save the same file twice)
- Marks emails as read (configurable via `MARK_SEEN`)
