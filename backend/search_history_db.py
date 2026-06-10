import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from config import SEARCH_HISTORY_DB_PATH


# ==========================================
# SEARCH HISTORY MANAGEMENT
# ==========================================
class SearchHistory:
    """Manages search history with SQLite database"""
    
    def __init__(self, db_path=None):
        if db_path is None:
            self.db_path = SEARCH_HISTORY_DB_PATH
        else:
            self.db_path = Path(db_path)
        self._init_db()
    
    def _init_db(self):
        """Initialize the search history database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS search_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    search_id TEXT UNIQUE NOT NULL,
                    query TEXT NOT NULL,
                    results_count INTEGER DEFAULT 0,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    results_json TEXT
                )
            ''')
            conn.commit()
    
    def save_search(self, query: str, results: list) -> str:
        """Save a search query and results to history"""
        search_id = str(uuid.uuid4())
        results_json = json.dumps(results)
        results_count = len(results)
        timestamp = datetime.now().isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO search_history 
                (search_id, query, results_count, results_json, timestamp)
                VALUES (?, ?, ?, ?, ?)
            ''', (search_id, query, results_count, results_json, timestamp))
            conn.commit()
        
        print(f"✅ Saved search to history: {search_id}")
        return search_id
    
    def get_history(self, limit: int = 50) -> list:
        """Retrieve search history, most recent first"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, search_id, query, results_count, timestamp 
                FROM search_history 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            history = []
            for row in rows:
                history.append({
                    "id": row["id"],
                    "search_id": row["search_id"],
                    "query": row["query"],
                    "results_count": row["results_count"],
                    "timestamp": row["timestamp"]
                })
            
            return history
    
    def get_search_by_id(self, search_id: str) -> dict:
        """Retrieve a specific search by its ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT search_id, query, results_count, results_json, timestamp
                FROM search_history
                WHERE search_id = ?
            ''', (search_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
            
            return {
                "search_id": row["search_id"],
                "query": row["query"],
                "results_count": row["results_count"],
                "results": json.loads(row["results_json"]),
                "timestamp": row["timestamp"]
            }
    
    def delete_search(self, search_id: str) -> bool:
        """Delete a specific search from history"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM search_history WHERE search_id = ?', (search_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def clear_history(self) -> int:
        """Clear all search history"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM search_history')
            conn.commit()
            return cursor.rowcount
