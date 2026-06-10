import chromadb
from chromadb.utils import embedding_functions
import uuid
import re # We need Regex for the Natural Language search
from config import CHROMADB_PATH

class ResumeDatabase:
    def __init__(self, db_path=None):
        if db_path is None:
            db_path = str(CHROMADB_PATH)
        self.client = chromadb.PersistentClient(path=db_path)
        
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="paraphrase-multilingual-MiniLM-L12-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name="candidates_multilingual",
            embedding_function=self.embedding_fn
        )

    def insert_resume(self, parsed_json, source_file="unknown.pdf"):
        # (This function stays exactly the same as before!)
        name = parsed_json.get("NAME", ["Unknown"])[0] if parsed_json.get("NAME") else "Unknown"
        email = parsed_json.get("EMAIL", ["Unknown"])[0] if parsed_json.get("EMAIL") else "Unknown"
        exp_years = parsed_json.get("EXPERIENCE_YEARS", 0.0)
        
        metadata = {
            "name": name,
            "email": email,
            "experience_years": float(exp_years),
            "source_file": source_file
        }

        skills_text = ", ".join(parsed_json.get("SKILL", []))
        exp_text = " | ".join(parsed_json.get("EXPERIENCE", []))
        edu_text = " | ".join(parsed_json.get("EDUCATION", []))
        
        text_payload = f"Skills: {skills_text}. Professional Experience: {exp_text}. Education: {edu_text}."
        doc_id = str(uuid.uuid4())

        self.collection.add(
            documents=[text_payload], metadatas=[metadata], ids=[doc_id]
        )
        print(f"✅ Successfully added {name} to the Vector DB.")


    # ==========================================
    # NEW: Natural Language Search Logic
    # ==========================================
    def _extract_experience_from_prompt(self, prompt):
        """Hidden helper function that reads a sentence and finds 'X years'."""
        # Looks for patterns like "1 year", "3+ years", "at least 2.5 years"
        match = re.search(r'(\d+(?:\.\d+)?)\+?\s*year', prompt, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return 0.0 # If they don't mention years, default to 0

    def search_candidates(self, prompt, max_distance=0.8):
        """Searches the database and filters by raw Distance."""
        min_experience = self._extract_experience_from_prompt(prompt)
        
        print(f"\n🔍 Reading Prompt: '{prompt}'")
        
        # 1. Ask ChromaDB for the closest matches
        raw_results = self.collection.query(
            query_texts=[prompt], 
            n_results=5, 
            where={"experience_years": {"$gte": min_experience}} 
        )
        
        final_candidates = []
        
        # 2. Safety check
        if not raw_results['ids'][0]:
            return final_candidates
            
        # 3. Loop through the results and check the Distance
        for i in range(len(raw_results['ids'][0])):
            doc_id = raw_results['ids'][0][i]
            metadata = raw_results['metadatas'][0][i]
            distance = raw_results['distances'][0][i]
            
            # THE THRESHOLD: Only keep them if the distance is LOW enough!
            if distance <= max_distance:
                candidate = {
                    "name": metadata['name'],
                    "email": metadata['email'],
                    "experience_years": metadata['experience_years'],
                    "distance_score": round(distance, 3), # Keep it precise
                    "source_file": metadata['source_file']
                }
                final_candidates.append(candidate)
                
        # Sort them so the LOWEST distance (best match) is at the top!
        final_candidates = sorted(final_candidates, key=lambda x: x['distance_score'])
        
        return final_candidates

    def get_statistics(self):
        """Get statistics about candidates in the database"""
        try:
            # Get all candidates in the collection
            all_results = self.collection.get()
            
            total_candidates = len(all_results['ids']) if all_results['ids'] else 0
            
            metadatas = all_results['metadatas'] if all_results['metadatas'] else []
            
            # Calculate statistics
            avg_experience = 0.0
            max_experience = 0.0
            min_experience = float('inf')
            all_skills = set()
            
            if metadatas:
                experience_years = [m.get('experience_years', 0.0) for m in metadatas]
                if experience_years:
                    avg_experience = round(sum(experience_years) / len(experience_years), 1)
                    max_experience = round(max(experience_years), 1)
                    min_experience = round(min(experience_years), 1) if min(experience_years) != float('inf') else 0.0
            
            return {
                "total_candidates": total_candidates,
                "average_experience": avg_experience,
                "max_experience": max_experience,
                "min_experience": min_experience if min_experience != float('inf') else 0.0
            }
        except Exception as e:
            print(f"Error getting statistics: {str(e)}")
            return {
                "total_candidates": 0,
                "average_experience": 0.0,
                "max_experience": 0.0,
                "min_experience": 0.0
            }