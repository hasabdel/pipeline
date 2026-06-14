from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from pathlib import Path

# Import your incredibly powerful AI pipeline!
from model import process_resume
from database import ResumeDatabase
from search_history_db import SearchHistory
from config import UPLOAD_DIR, RESUMES_DIR, ensure_directories

app = FastAPI(title="AI ATS Engine API")

# ==========================================
# CORS CONFIGURATION (Crucial for Next.js)
# ==========================================
# This allows your Next.js frontend (running on port 3000) 
# to talk to this Python backend (running on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all necessary directories on startup
ensure_directories()

# Initialize the database connection ONCE when the server boots up
db = ResumeDatabase()
search_history = SearchHistory()

# ==========================================
# DATA MODELS
# ==========================================
class SearchQuery(BaseModel):
    prompt: str
    save_to_history: bool = True  # Optional parameter to control history saving

# ==========================================
# API ENDPOINTS
# ==========================================


@app.get("/")
async def health_check():
    """
    Health check endpoint. 
    Next.js calls this to turn the connection badge green.
    """
    return {
        "status": "healthy", 
        "message": "AI ATS Engine API is up and running!"
    }

@app.post("/api/upload")
async def upload_and_process_resume(file: UploadFile = File(...)):
    """Receives a PDF from Next.js, runs the AI, and saves to ChromaDB."""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_path = UPLOAD_DIR / file.filename
    file_path_str = str(file_path)  # Convert Path to string

    # 1. Save the uploaded file to disk temporarily 
    with open(file_path_str, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Run your LayoutLMv3 Pipeline!
        print(f"Server processing new upload: {file.filename}")
        parsed_json = process_resume(file_path_str)

        # Define permanent storage path
        filename = Path(file_path_str).name
        new_path = RESUMES_DIR / filename

        # 3. Insert into the Vector Database with the permanent path
        db.insert_resume(parsed_json, source_file=str(new_path))

        # 4. Return a success message to the Next.js frontend
        name = parsed_json.get("NAME", ["Unknown"])[0] if parsed_json.get("NAME") else "Unknown"
        
        # 5. Move to permanent storage
        shutil.move(file_path_str, str(new_path))
        
        return {
            "status": "success",
            "message": f"Successfully parsed and indexed {name}'s resume.",
            "data": parsed_json
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline Error: {str(e)}")
    
    

@app.post("/api/search")
async def search_database(query: SearchQuery):
    """Receives a natural language prompt from Next.js and returns matching candidates."""
    try:
        # Pass the prompt to your dynamic intent extractor and vector search
        results = db.search_candidates(prompt=query.prompt)
        
        # Save search to history (unless it's a re-run of a previous search)
        if query.save_to_history:
            search_history.save_search(query.prompt, results)
        
        return {
            "status": "success",
            "matches": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-history")
async def get_search_history():
    """Retrieve all search history, most recent first."""
    try:
        history = search_history.get_history(limit=50)
        return {
            "status": "success",
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-history/{search_id}")
async def get_search_by_id(search_id: str):
    """Retrieve a specific search by its ID."""
    try:
        search = search_history.get_search_by_id(search_id)
        if not search:
            raise HTTPException(status_code=404, detail="Search not found")
        
        return {
            "status": "success",
            "search": search
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/search-history/{search_id}")
async def delete_search(search_id: str):
    """Delete a specific search from history."""
    try:
        deleted = search_history.delete_search(search_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Search not found")
        
        return {
            "status": "success",
            "message": "Search deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/search-history")
async def clear_search_history():
    """Clear all search history."""
    try:
        deleted_count = search_history.clear_history()
        return {
            "status": "success",
            "message": f"Cleared {deleted_count} searches from history",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics")
async def get_statistics():
    """Get dashboard statistics about candidates in the database."""
    try:
        stats = db.get_statistics()
        recent_searches = search_history.get_history(limit=5)
        
        return {
            "status": "success",
            "statistics": stats,
            "recent_searches": recent_searches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/candidates")
async def get_all_candidates(q: str = None):
    """Retrieve all candidates, optionally filtered by a search string."""
    try:
        candidates = db.get_all_candidates(search_query=q)
        return {
            "status": "success",
            "candidates": candidates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/candidates/{doc_id}")
async def delete_candidate(doc_id: str):
    """Delete a candidate from the vector database and filesystem."""
    try:
        success, message = db.delete_candidate(doc_id)
        if not success:
            if message == "Candidate not found":
                raise HTTPException(status_code=404, detail=message)
            raise HTTPException(status_code=500, detail=message)
            
        return {
            "status": "success",
            "message": message
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# SERVER LAUNCH
# ==========================================
if __name__ == "__main__":
    import uvicorn
    # Runs the server on localhost port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)