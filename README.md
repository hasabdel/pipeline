# AI-Powered ATS (Applicant Tracking System)

A modern, intelligent Applicant Tracking System powered by AI that automates resume parsing and candidate matching using cutting-edge machine learning.

## 🌟 Overview

This project combines a **Python-based AI backend** with a **Next.js frontend** to create an intelligent ATS platform that:
- Automatically extracts structured data from resumes using LayoutLMv3 deep learning model
- Stores candidate information in a vector database for semantic search
- Allows recruiters to find candidates using natural language queries
- Supports multi-language candidate profiles

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js Frontend                    │
│              (Port 3000 - React + TypeScript)            │
└─────────────────────────────────────────────────────────┘
                            │
                    (REST API Communication)
                            │
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│              (Port 8000 - Python Framework)              │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐        ┌──────▼──────┐
         │ LayoutLMv3  │        │   ChromaDB  │
         │  AI Model   │        │ Vector DB   │
         │ (NER Token  │        │ (Semantic   │
         │ Classification)      │  Search)    │
         └─────────────┘        └─────────────┘
```

## 🚀 Key Features

### Backend (AI Pipeline)
- **Resume Processing**: Uploads PDF resumes and automatically extracts:
  - Name
  - Email
  - Skills
  - Professional Experience
  - Education
  - Total Years of Experience
  
- **LayoutLMv3 Model**: Deep learning model trained specifically for document understanding and token classification
  - Processes visual layout of resumes (not just text)
  - Maintains spatial awareness for better extraction
  - Fine-tuned on resume documents

- **Vector Database (ChromaDB)**:
  - Stores processed candidate profiles
  - Semantic search capabilities using embeddings
  - Multi-language support (paraphrase-multilingual-MiniLM-L12-v2)
  - Resume files permanently stored in `backend/resumes_pdf_db/` with absolute paths tracked in metadata

- **Natural Language Search**: Recruiters can search for candidates using conversational queries
  - Extracts experience requirements from queries
  - Matches candidates based on skills and experience
  - Returns ranked results by **confidence score** (cosine similarity derived from vector distance)
  - Confidence formula: `cosine_similarity = 1 - (distance / 2)` for normalized embeddings
  - Distance 0.0 = 100% confidence, distance 0.8 = 60% confidence

- **Search History Management**: Keep track of all past searches
  - Automatically saves every search query and results with timestamps
  - View search history in expandable sidebar panel
  - Dedicated full-page search history browser (via Dashboard "View All" button)
  - Re-run previous searches with one click
  - Delete individual searches or clear entire history
  - SQLite persistent storage for permanent history tracking

- **Resume Management** (NEW - 2026-06-14): Manage candidates in the database
  - Accessible via the "Settings" button in the sidebar
  - Search bar to filter candidates by name, email, or filename
  - Delete individual resumes from both ChromaDB and the physical `resumes_pdf_db` folder
  - Confirmation dialog to prevent accidental deletions

- **Dashboard Page** (REDESIGNED - 2026-06-13): Bento-card style overview and analytics
  - 3-column stat cards: Total Candidates, Average Experience, Max Experience
  - Each card with progress bars, mini bar charts, and contextual info
  - Recent searches table with query, matches, status columns (click to re-run search)
  - "View All" button opens dedicated search history page
  - Skill Distribution panel with progress bar visualizations
  - Footer with disclaimer and policy links
  - Built-in header with "Last 30 Days" filter and notification bell

### Frontend (Next.js UI)
- Premium, modern bento-card interface built with React 19
- **Pages**: Dashboard, Search, Settings (Manage Database), Search History
- **Key Components**:
  - **Dashboard**: Bento-card overview with stat cards, recent searches table, skill distribution
  - **Sidebar**: RecruitAI branded sidebar with blue active-state nav, Dashboard/Search/Settings buttons, Search History panel, Upload Resumes
  - **TopNav**: Application header with branding and connection status (search page only)
  - **ChatInput**: Natural language search interface
  - **SearchResults**: Display matching candidates with confidence % badges
  - **SearchHistory**: Expandable search history panel (integrated in Sidebar)
  - **AllSearchHistory**: Full-page search history browser with delete and clear-all actions (NEW)
  - **Settings**: Manage Database page — search and delete resumes from DB and filesystem (NEW)
  - **CandidateCard**: Individual candidate profile display with confidence score
  - **HeroSection**: Welcome and main action area for search page
  - **Toast**: Notification system

- **Styling**: Tailwind CSS v4 + custom CSS for bento-card design system
- **State Management**: React Hooks (useState, useCallback)
- **Linting**: ESLint configured for code quality

## 📁 Project Structure

```
pipeline/
├── .gitignore                      # Git ignore file for clean commits
├── backend/
│   ├── api.py                      # FastAPI main application
│   ├── config.py                   # Centralized path configuration (NEW)
│   ├── model.py                    # LayoutLMv3 model initialization
│   ├── database.py                 # ChromaDB integration & resume processing
│   ├── search_history_db.py        # Search history management
│   ├── extractor.py                # PDF page extraction
│   ├── constructor.py              # Entity assembly
│   ├── experience_calcul.py         # Experience calculation logic
│   ├── logs.py                     # Logging utilities
│   ├── script.py                   # Helper scripts
│   ├── search_history.db           # Search history SQLite database
│   ├── content/
│   │   └── final-v3-weights/       # LayoutLMv3 pretrained weights
│   │       ├── config.json
│   │       ├── model.safetensors
│   │       ├── processor_config.json
│   │       ├── tokenizer_config.json
│   │       └── tokenizer.json
│   ├── resumes_pdf_db/             # Permanent resume PDF storage
│   ├── resume_vectordb/            # ChromaDB persistent storage
│   └── uploads/                    # Temporary resume storage
│
└── frontend/
    ├── app/
    │   ├── page.tsx                # Main page component (routes: dashboard, search, settings, history)
    │   ├── layout.tsx              # Root layout
    │   ├── globals.css             # Global styles
    │   ├── components/             # React components
    │   │   ├── AllSearchHistory.tsx     # Full-page search history browser (NEW)
    │   │   ├── CandidateCard.tsx
    │   │   ├── ChatInput.tsx
    │   │   ├── Dashboard.tsx            # Dashboard overview page
    │   │   ├── HeroSection.tsx
    │   │   ├── SearchHistory.tsx        # Search history panel (sidebar)
    │   │   ├── SearchResults.tsx
    │   │   ├── Settings.tsx             # Manage Database page (NEW)
    │   │   ├── Sidebar.tsx
    │   │   ├── Toast.tsx
    │   │   └── TopNav.tsx
    │   └── lib/
    │       └── api.ts              # API client functions
    ├── public/                     # Static assets
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── eslint.config.mjs
    └── tailwind.config.mjs
```

## 🔧 Tech Stack

### Backend
- **Framework**: FastAPI (Python web framework)
- **ML Model**: LayoutLMv3 (Document understanding)
- **Vector Database**: ChromaDB (Vector search)
- **PDF Processing**: PyMuPDF (fitz)
- **Deep Learning**: PyTorch
- **Embeddings**: Sentence Transformers
- **Data Validation**: Pydantic
- **Server**: Uvicorn (ASGI server)

### Frontend
- **Framework**: Next.js 16.2.7
- **Language**: TypeScript 5
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint 9

## 📋 API Endpoints

### Backend Endpoints (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check - verify API is running |
| `POST` | `/api/upload` | Upload and process a resume PDF |
| `POST` | `/api/search` | Search candidates with natural language query |
| `GET` | `/api/statistics` | Get dashboard statistics and recent searches |
| `GET` | `/api/candidates?q={query}` | List all candidates, optionally filtered by search string (NEW) |
| `DELETE` | `/api/candidates/{doc_id}` | Delete a candidate from DB and filesystem (NEW) |
| `GET` | `/api/search-history` | Retrieve all search history (most recent first) |
| `GET` | `/api/search-history/{search_id}` | Retrieve specific search by ID with results |
| `DELETE` | `/api/search-history/{search_id}` | Delete a specific search from history |
| `DELETE` | `/api/search-history` | Clear all search history |

#### Request/Response Examples

**Upload Resume**
```bash
POST /api/upload
Content-Type: multipart/form-data

file: <PDF file>
```

Response:
```json
{
  "status": "success",
  "message": "Successfully parsed and indexed John Doe's resume.",
  "data": {
    "NAME": ["John Doe"],
    "EMAIL": ["john@example.com"],
    "SKILL": ["Python", "React", "Machine Learning"],
    "EXPERIENCE": ["Senior ML Engineer at Company A"],
    "EDUCATION": ["BS Computer Science"],
    "EXPERIENCE_YEARS": 5.5
  }
}
```

**Search Candidates**
```bash
POST /api/search
Content-Type: application/json

{
  "prompt": "Find candidates with 3+ years of Python and Machine Learning experience"
}
```

Response:
```json
{
  "status": "success",
  "matches": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "experience_years": 5.5,
      "distance_score": 0.125,
      "confidence": 0.844,
      "source_file": "d:\\LaFac\\PFM\\pipeline\\backend\\resumes_pdf_db\\john_doe.pdf"
    }
  ]
}
```

**Get Search History**
```bash
GET /api/search-history
```

Response:
```json
{
  "status": "success",
  "history": [
    {
      "id": 1,
      "search_id": "550e8400-e29b-41d4-a716-446655440000",
      "query": "Find candidates with 3+ years of Python experience",
      "results_count": 5,
      "timestamp": "2026-06-10T14:30:22.123456"
    },
    {
      "id": 2,
      "search_id": "550e8400-e29b-41d4-a716-446655440001",
      "query": "Machine Learning engineers with 5+ years",
      "results_count": 3,
      "timestamp": "2026-06-10T12:15:45.654321"
    }
  ]
}
```

**Get Specific Search**
```bash
GET /api/search-history/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "status": "success",
  "search": {
    "search_id": "550e8400-e29b-41d4-a716-446655440000",
    "query": "Find candidates with 3+ years of Python experience",
    "results_count": 2,
    "timestamp": "2026-06-10T14:30:22.123456",
    "results": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "experience_years": 5.5,
        "distance_score": 0.125,
        "source_file": "john_doe.pdf"
      }
    ]
  }
}
```

**Delete Search**
```bash
DELETE /api/search-history/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "status": "success",
  "message": "Search deleted successfully"
}
```

**Clear All History**
```bash
DELETE /api/search-history
```

Response:
```json
{
  "status": "success",
  "message": "Cleared 10 searches from history",
  "deleted_count": 10
}
```

**Get Dashboard Statistics**
```bash
GET /api/statistics
```

Response:
```json
{
  "status": "success",
  "statistics": {
    "total_candidates": 42,
    "average_experience": 5.2,
    "max_experience": 12.5,
    "min_experience": 1.0
  },
  "recent_searches": [
    {
      "id": 1,
      "search_id": "550e8400-e29b-41d4-a716-446655440000",
      "query": "Python developers with 5+ years",
      "results_count": 8,
      "timestamp": "2026-06-10T14:30:22.123456"
    }
  ]
}
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- CUDA-capable GPU (optional, for faster processing)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd pipeline/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install fastapi uvicorn pydantic python-multipart
pip install torch transformers
pip install chromadb sentence-transformers
pip install pymupdf
```

4. **Start the backend server**
```bash
python api.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd pipeline/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔌 CORS Configuration

The backend is configured to accept requests from the Next.js frontend:
- **Frontend Origin**: `http://localhost:3000`
- **Backend Origin**: `http://localhost:8000`

Modify the CORS settings in [api.py](backend/api.py#L13-L19) if you need to change ports or deploy to different domains.

## 🤖 AI Model Details

### LayoutLMv3
- **Purpose**: Visual Document Understanding using LayoutLMv3
- **Task**: Token Classification (NER - Named Entity Recognition)
- **Input**: PDF documents with layout information
- **Output**: Structured entity extraction
- **Languages Supported**: Multilingual (via embeddings)
- **Pre-trained Weights**: Located in `backend/content/final-v3-weights/`

### Processing Pipeline
1. **Extract**: PDF pages are processed to extract text and bounding boxes
2. **Tokenize**: Text is tokenized using LayoutLMv3Processor
3. **Classify**: Tokens are classified (name, email, skill, etc.)
4. **Assemble**: Classified tokens are assembled into structured entities
5. **Store**: Results are stored in vector database with embeddings

## 🔍 Search Capabilities

### Vector Database (ChromaDB)
- **Collection**: `candidates_multilingual`
- **Embedding Model**: paraphrase-multilingual-MiniLM-L12-v2
- **Storage**: Persistent SQLite database
- **Search Type**: Semantic similarity search

### Natural Language Search Features
- Extract experience requirements from queries
- Match candidates by skills, experience, and education
- Multi-language support for diverse candidate pools
- **Confidence scoring** (NEW): Squared L2 distance is converted to cosine similarity for normalized embeddings
  - Formula: `confidence = 1 - (distance / 2)` (clamped to [0, 1])
  - Based on the identity: for unit vectors, L2² = 2 × (1 - cosine_similarity)
  - Distance 0.0 = 100% confidence (perfect match)
  - Distance 0.2 = 90% confidence
  - Distance 0.4 = 80% confidence
  - Distance 0.8 = 60% confidence (threshold cutoff)

## 📊 Data Models

### SearchQuery
```python
class SearchQuery(BaseModel):
    prompt: str  # Natural language search query
```

### CandidateMatch
```typescript
interface CandidateMatch {
  name: string;
  email: string;
  experience_years: number;
  confidence: number;       // 0.0 to 1.0 (cosine similarity from normalized embeddings)
  distance_score: number;   // raw squared L2 distance (0.0 to 0.8)
  source_file: string;      // absolute path to PDF in resumes_pdf_db
}
```

### Extracted Resume Data
```python
{
  "NAME": ["Full Name"],
  "EMAIL": ["email@example.com"],
  "SKILL": ["skill1", "skill2", ...],
  "EXPERIENCE": ["job title at company", ...],
  "EDUCATION": ["degree from university", ...],
  "EXPERIENCE_YEARS": 5.5
}
```

## 🗄️ Database Structure

### ChromaDB Vector Storage
```
Collection: candidates_multilingual
├── Document ID (UUID)
├── Metadata:
│   ├── name: string
│   ├── email: string
│   ├── experience_years: float
│   └── source_file: string (absolute path to file in resumes_pdf_db)
└── Embedding vector (384-dimensional for MiniLM)
```

### Search History Database (SQLite) (NEW)
```
Table: search_history
├── id (INTEGER PRIMARY KEY)
├── search_id (TEXT UNIQUE) - UUID for the search
├── query (TEXT) - The search query string
├── results_count (INTEGER) - Number of matches found
├── timestamp (DATETIME) - When the search was performed
└── results_json (TEXT) - JSON serialized candidate results
```

**Features**:
- Persistent storage in `backend/search_history.db`
- Automatic timestamps for every search
- JSON serialized results for complete history preservation
- Efficient querying by search_id or timestamp
- Support for bulk operations (clear, delete)

### Sidebar Organization (Updated - 2026-06-14)
- **Logo**: Black rounded icon + "RecruitAI" / "Recruitment Engine" branding
- **Top Navigation** (blue active-state highlight):
  - Dashboard - Navigate to overview dashboard
  - Search - Navigate to candidate search interface
  - Settings - Navigate to Manage Database page (search & delete resumes)
- **Search History Panel**: Expandable section showing past searches
- **Resume Upload**: Full-width rounded black button
- **User Profile**: Alex Thorne (Premium Plan) with logout icon at the bottom

### Backend Development
1. Modify models and logic in `backend/` files
2. Restart the API server to apply changes
3. Test endpoints using frontend or curl

**File Organization**:
- `config.py`: **Centralized path configuration** - Change all paths here instead of modifying each file individually
- `database.py`: Handles ChromaDB operations and candidate search/statistics
- `search_history_db.py`: Manages search history with SQLite
- `api.py`: FastAPI routes and endpoints

**Configuration Guide** (config.py):
All backend paths are centralized in `config.py`. To change any path, edit this file:
```python
# Example - change upload directory
UPLOAD_DIR = BACKEND_DIR / "uploads"  # Modify here

# Example - change model path
MODEL_PATH = BACKEND_DIR / "content" / "final-v3-weights"  # Or here
```

Paths are automatically used across all backend files (model.py, database.py, api.py, etc.)

### Frontend Development
1. Edit React components in `frontend/app/components/`
2. Next.js automatically hot-reloads changes
3. Check browser console for errors

### Adding New Features
1. **New extraction fields**: Update `model.py` and `constructor.py`
2. **New search filters**: Modify `database.py` search logic
3. **New UI components**: Add to `frontend/app/components/`

## 📝 Logging

Logging utilities are available in `backend/logs.py` for debugging:
- Pipeline processing logs
- API request/response logs
- Error and exception tracking

## 🚨 Troubleshooting

### Backend Issues
- **Model loading fails**: Check that `final-v3-weights/` directory exists with all files
- **ChromaDB errors**: Verify `resume_vectordb/` directory permissions
- **PDF processing errors**: Ensure PDF is valid and not corrupted
- **GPU memory errors**: Reduce batch size or use CPU with `device = torch.device("cpu")`

### Frontend Issues
- **API connection refused**: Verify backend is running on `http://localhost:8000`
- **CORS errors**: Check CORS configuration in `api.py`
- **Upload fails**: Ensure file size is reasonable and format is PDF

### GPU Configuration
To use GPU for faster processing:
```python
# In backend/model.py - already configured, will auto-detect
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

## 📈 Performance Optimization

### Backend
- **Batch Processing**: Process multiple resumes efficiently
- **GPU Acceleration**: Automatic CUDA detection for faster inference
- **Caching**: Embeddings are cached in ChromaDB

### Frontend
- **Code Splitting**: Next.js automatically optimizes bundle size
- **Image Optimization**: Built-in image optimization
- **API Caching**: Implement request caching for repeated searches

## 🔐 Security Considerations

- **File Validation**: Only PDF uploads are accepted
- **Input Sanitization**: Pydantic validates all API inputs
- **CORS**: Restricted to known origins
- **Error Handling**: Generic error messages in production
- **Temporary Files**: Uploaded PDFs are stored temporarily in `uploads/`

## 📚 Dependencies Summary

### Backend Critical Dependencies
```
fastapi>=0.104.0
uvicorn>=0.24.0
torch>=2.0.0
transformers>=4.30.0
chromadb>=0.4.0
sentence-transformers>=2.2.0
pydantic>=2.0.0
pymupdf>=1.23.0
```

### Frontend Critical Dependencies
```
next@16.2.7
react@19.2.4
tailwindcss@4
typescript@5
```

## 📄 License

This project is part of the PFM (Professional Fitness Module) system.

## 👥 Project Team

Built as an intelligent ATS solution combining:
- Computer Vision (LayoutLMv3 for document understanding)
- NLP (Semantic search and natural language understanding)
- Modern Web Architecture (Next.js + FastAPI)

## 🎯 Future Enhancements

- [x] Search history tracking (COMPLETED - 2026-06-10)
- [x] Dashboard with statistics (COMPLETED - 2026-06-10)
- [x] Sidebar reorganization (COMPLETED - 2026-06-10)
- [x] Dashboard visual redesign - bento-card layout (COMPLETED - 2026-06-13)
- [x] Sidebar branding redesign - RecruitAI + blue active state (COMPLETED - 2026-06-13)
- [x] Resume management - search & delete from DB and filesystem (COMPLETED - 2026-06-14)
- [x] Full search history page with delete & clear-all (COMPLETED - 2026-06-14)
- [x] Confidence scoring - distance-to-confidence conversion (COMPLETED - 2026-06-14)
- [x] Resume source tracking - absolute paths in resumes_pdf_db (COMPLETED - 2026-06-14)
- [ ] Batch resume processing
- [ ] Advanced filtering and sorting
- [ ] Interview scheduling integration
- [ ] Email notifications
- [ ] Analytics dashboard with charts
- [ ] Multi-user authentication
- [ ] Resume comparison tools
- [ ] Export to ATS format
- [ ] Integration with job posting platforms

## 📞 Support & Contact

For issues, debugging, or feature requests, check:
1. Backend logs in terminal
2. Frontend console errors (F12 in browser)
3. ChromaDB vector store integrity
4. GPU/CUDA availability

## 🚀 Deployment & Git

### Git Configuration
A `.gitignore` file is included at the project root to exclude:
- Python cache and virtual environments (`__pycache__`, `venv/`, etc.)
- Node modules and build artifacts (`node_modules/`, `.next/`, etc.)
- Temporary files and uploads (`uploads/`, `*.log`, etc.)
- Sensitive files (`.env`, IDE configs, etc.)
- Database files (SQLite, ChromaDB data)

### Push to Repository
```bash
# Initialize git (if not already done)
git init

# Add all files (except those in .gitignore)
git add .

# Commit
git commit -m "Initial commit: AI ATS platform"

# Add remote and push
git remote add origin <your-repo-url>
git push -u origin main
```

---

**Last Updated**: 2026-06-14
**Project Status**: Active Development
**Latest Changes**: Resume management page, full search history browser, confidence scoring, resume source path tracking
