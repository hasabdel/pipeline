# Setup & Installation Guide

This document outlines the exact dependencies and steps required to run the AI ATS Pipeline locally.

---

## 1. Backend Setup (Python)

The backend is built with FastAPI, PyTorch, and ChromaDB.

### Prerequisites
- Python 3.12 (Recommended)
- Tesseract OCR engine installed on your system (e.g., `apt install tesseract-ocr` on Linux or via installer on Windows)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the exact dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

### Core Backend Dependencies (from requirements.txt)
- `fastapi==0.136.3`
- `uvicorn==0.47.0`
- `python-multipart==0.0.29`
- `pydantic==2.12.5`
- `chromadb==1.5.9`
- `sentence-transformers==5.5.1`
- `torch==2.11.0`
- `transformers==5.9.0`
- `PyMuPDF==1.27.2.3`
- `pillow==11.3.0`
- `pytesseract==0.3.13`
- `python-dotenv==1.2.1`

### Running the Backend
1. Ensure your `.env` file is configured for email IMAP fetching (if you plan to use that feature).
2. Start the FastAPI server:
   ```bash
   python api.py
   ```
   *The server will start on `http://localhost:8000`.*

---

## 2. Frontend Setup (Next.js / React)

The frontend is a modern web application built using Next.js 16 and React 19.

### Prerequisites
- Node.js 20+ (Recommended)
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Core Frontend Dependencies (from package.json)
- `next`: `16.2.7`
- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `@tailwindcss/postcss`: `^4`
- `tailwindcss`: `^4`
- `typescript`: `^5`

### Running the Frontend
Start the Next.js development server:
```bash
npm run dev
```
*The UI will be accessible at `http://localhost:3000`.*

---

## Testing the Connection

Once both the frontend and backend are running:
1. Open `http://localhost:3000` in your browser.
2. The UI will automatically ping `http://localhost:8000/` to ensure the API is reachable.
3. You can verify backend functionality directly by visiting the interactive API docs at `http://localhost:8000/docs`.
