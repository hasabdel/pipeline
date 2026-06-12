# Academic Report Generation Prompt for AI-Powered ATS System

## System Overview
This project is an **AI-Powered Applicant Tracking System (ATS)** that automates resume processing and candidate matching using state-of-the-art machine learning techniques.

## Key Components to Cover in Report

### 1. Architecture & System Design
- **Backend**: FastAPI (Python) web framework running on port 8000
- **Frontend**: Next.js 16.2.7 with React 19.2.4 and TypeScript 5
- **Communication**: REST API with CORS enabled for cross-origin requests
- **Deployment**: Modular full-stack architecture with clean separation of concerns

### 2. Core Machine Learning Pipeline

#### 2.1 Document Understanding Layer (LayoutLMv3)
- **Model**: LayoutLMv3 (pre-trained multimodal transformer)
- **Task**: Named Entity Recognition (NER) with token classification
- **Input**: PDF resumes (visual layout + text)
- **Extraction Categories**: 
  - NAME (B-NAME, I-NAME)
  - EMAIL (B-EMAIL, I-EMAIL)
  - PHONE (B-PHONE, I-PHONE)
  - SKILLS (B-SKILL, I-SKILL)
  - EXPERIENCE (B-EXP, I-EXP)
  - EDUCATION (B-EDU, I-EDU)
  - EXPERIENCE-DATES (B-EXP-DATE, I-EXP-DATE)
  - EDUCATION-DATES (B-EDU-DATE, I-EDU-DATE)

#### 2.2 Document Processing Pipeline
1. **PDF Extraction** (PyMuPDF/fitz):
   - Renders each page to 2x upsampled image (high resolution)
   - Extracts digital text and bounding boxes (normalized to 0-1000 scale)
   - Intelligent OCR triggering: If <10 digital words detected, assumes scanned image

2. **OCR Integration** (Tesseract):
   - Fallback mechanism for scanned/low-quality PDFs
   - Converts pixel coordinates from image space to normalized bounding boxes
   - Multi-language support for resume text

3. **LayoutLMv3 Inference**:
   - Processes image + text + spatial coordinates together
   - Outputs token-level predictions (BIO tagging scheme)
   - Truncation/padding strategy (max_length=512, stride=128)

4. **Post-processing & Entity Assembly**:
   - BIO tag decoding: Assembles B- and I- tags into complete entities
   - Date parsing with multilingual support (English/French)
   - Experience calculation: Merges overlapping date intervals, calculates exact years

#### 2.3 Intelligent Date Parsing (Multi-language)
- Handles multiple date formats: "2024-2025", "Feb 2024", "july - August 2024"
- Language variants: "Janvier" (FR), "Enero" (ES), etc.
- Inheritance mechanism: Borrows year from end date if start date missing
- Current date handling: Recognizes "present", "current", "aujourd'hui", "maintenant"
- Exact calculation: Returns years as float with 0.1 precision

#### 2.4 Vector Semantic Search Engine
- **Embedding Model**: Sentence Transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **Vector Database**: ChromaDB (persistent storage with SQLite-based index)
- **Search Mechanism**:
  - Natural language query input from recruiters
  - Automatic experience requirement extraction (regex: "X+ years")
  - Semantic similarity matching
  - Metadata filtering (experience_years >= threshold)
  - Distance-based ranking (threshold: 0.8 max_distance)

### 3. Search & Discovery Features

#### 3.1 Natural Language Search Interface
- Recruiters input conversational queries: "Find Python developers with 5+ years experience"
- System extracts constraints (experience requirement, skills) automatically
- Returns ranked candidate matches with similarity scores

#### 3.2 Search History Management
- **Storage**: SQLite database with timestamps
- **Functionality**:
  - Automatic history tracking (query + results count)
  - Re-run previous searches with single click
  - Delete individual searches or clear entire history
  - JSON serialization of results for history preservation

#### 3.3 Dashboard Analytics
- Total candidate count in talent pool
- Average/max/min experience statistics
- Recent searches overview
- Quick navigation between Dashboard and Talent Pool views

### 4. Frontend Architecture

#### 4.1 Component Structure
- **Dashboard**: Analytics and overview page
- **Sidebar**: Navigation panel with upload, history, settings
- **ChatInput**: Natural language query interface
- **SearchResults**: Candidate card grid display
- **CandidateCard**: Individual candidate profile cards
- **SearchHistory**: Expandable history panel
- **TopNav**: Application header and branding

#### 4.2 Styling & UX
- **Framework**: Tailwind CSS v4 (utility-first CSS)
- **Responsiveness**: Mobile-first design approach
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **API Integration**: TypeScript-typed fetch API client

### 5. API Endpoints
```
GET  /                          - Health check
POST /api/upload                - Resume processing
POST /api/search                - Semantic candidate search
GET  /api/statistics            - Dashboard analytics
GET  /api/search-history        - Retrieve history
GET  /api/search-history/{id}   - Get specific search
DELETE /api/search-history/{id} - Delete search entry
DELETE /api/search-history      - Clear all history
```

### 6. Technical Innovations & Challenges Addressed

#### 6.1 Innovation Points
1. **Multimodal ML**: Combines visual layout + text for document understanding
2. **Production-grade OCR**: Automatic fallback for scanned documents
3. **Intelligent Date Parsing**: Multilingual, flexible format handling with interval merging
4. **Vector Semantic Search**: Natural language recruitment queries
5. **Full-stack AI Application**: End-to-end ML pipeline with professional UI

#### 6.2 Challenges & Solutions
1. **File Locking Issues (Windows)**: Resolved with HF_HUB_DISABLE_SYMLINKS_WARNING
2. **Database Corruption**: Automatic ChromaDB recovery with fallback to in-memory database
3. **PDF Variation Handling**: Smart OCR detection and processing
4. **Experience Calculation Complexity**: Interval merging for overlapping work periods
5. **Scalability**: Vector database for fast semantic search at scale

### 7. Business Applications
- **Recruitment Efficiency**: Automate resume parsing, reduce manual data entry
- **Candidate Discovery**: Natural language search enables intuitive candidate filtering
- **Data Organization**: Structured candidate database for talent pipeline management
- **Multi-language Support**: Global recruitment capabilities

### 8. Future Enhancements
- Batch resume import optimization
- Advanced filtering/faceted search
- Candidate scoring and ranking algorithms
- Integration with job description parsing
- Resume recommendations based on job postings
- Real-time collaborative hiring workflows

---

## Suggested Academic Report Structure

### I. Introduction
- Recruitment technology landscape
- Problem statement: Manual resume processing bottleneck
- Proposed solution: AI-powered ATS system

### II. Literature Review
- Document Understanding with Transformers (LayoutLMv3)
- Named Entity Recognition in specialized domains
- Vector Semantic Search and Embeddings
- Applicant Tracking System design patterns

### III. System Architecture
- High-level system design diagram
- Component interactions
- Technology stack justification

### IV. Core Methods
- **Resume Processing Pipeline**: PDF extraction, OCR, LayoutLMv3 inference
- **Entity Extraction**: BIO tagging, post-processing assembly
- **Experience Calculation**: Date parsing algorithm, interval merging
- **Semantic Search**: Embedding model, distance-based ranking

### V. Implementation Details
- Backend framework (FastAPI)
- Frontend framework (Next.js + React)
- Database design (ChromaDB + SQLite)
- API design and integration

### VI. Results & Case Studies
- Processing speed metrics
- Extraction accuracy evaluation
- Search relevance metrics
- User experience feedback

### VII. Challenges & Solutions
- Windows file locking issues
- Database reliability
- Multi-language support complexities
- Scalability considerations

### VIII. Evaluation & Discussion
- System performance analysis
- Comparison with existing ATS solutions
- Strengths and limitations
- Practical deployment considerations

### IX. Conclusion
- Key contributions
- Impact on recruitment technology
- Future work and improvements

### X. References
- LayoutLMv3 paper and documentation
- ChromaDB vector database
- FastAPI and Next.js documentation
- Sentence Transformers library
- Industry case studies on AI in recruitment

---

## Key Metrics to Discuss
- **Resume Processing**: Avg 2-5 seconds per page
- **Entity Extraction**: Multiple label categories (8 entity types)
- **Search Performance**: Vector similarity matching in milliseconds
- **Language Support**: Multilingual (English + French minimum)
- **Scalability**: Handles hundreds of candidate profiles
- **Accuracy**: Trained classifier weights for domain-specific NER

## Important Code References
- Backend entry point: `api.py` (FastAPI app)
- ML pipeline: `model.py` (LayoutLMv3 loading)
- PDF processing: `extractor.py` (PyMuPDF + OCR)
- Post-processing: `constructor.py`, `experience_calcul.py`
- Database: `database.py` (ChromaDB integration)
- History: `search_history_db.py` (SQLite management)
- Frontend client: `lib/api.ts` (TypeScript API integration)
