import torch
from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import fitz

from extractor import extract_page_data
from experience_calcul import calculate_total_experience
from constructor import assemble_entities
from config import MODEL_PATH


print("Loading Model...")
print(f"Model Path: {MODEL_PATH}")

processor = LayoutLMv3Processor.from_pretrained(str(MODEL_PATH))
model = LayoutLMv3ForTokenClassification.from_pretrained(str(MODEL_PATH))

# Move model to GPU if available, otherwise CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

# Get the label map from the model configuration
id2label = model.config.id2label



def process_resume(pdf_path):
    print(f"\nProcessing: {pdf_path}")
    doc = fitz.open(pdf_path)
    
    all_words = []
    all_predictions = []
    
    # A. Loop through pages and run the AI
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        words, boxes, img = extract_page_data(page)
        
        if not words: continue # Skip empty pages
            
        # Prepare inputs for LayoutLMv3
        encoding = processor(
            img, 
            words, 
            boxes=boxes, 
            truncation=True, 
            stride=128, 
            padding="max_length", 
            max_length=512, 
            return_tensors="pt", 
            return_offsets_mapping=True
        )
        
        offset_mapping = encoding.pop('offset_mapping')
        
        # Move to device
        for k, v in encoding.items():
            encoding[k] = v.to(device)
            
        # Run AI
        with torch.no_grad():
            outputs = model(**encoding)
            
        # Decode predictions
        predictions = outputs.logits.argmax(-1).squeeze().tolist()
        
        # PERFECT ALIGNMENT USING word_ids()
        word_ids = encoding.word_ids(batch_index=0)
        previous_word_idx = None
        
        for idx, word_idx in enumerate(word_ids):
            # Skip special tokens (like [CLS] and [SEP])
            if word_idx is None:
                continue
                
            # If this is the FIRST subword of a new word, grab its prediction
            if word_idx != previous_word_idx:
                label = id2label[predictions[idx]]
                all_words.append(words[word_idx])
                all_predictions.append(label)
                previous_word_idx = word_idx
                
    doc.close()
    

    # B. Assemble the entities
    ai_extracted_data = assemble_entities(all_words, all_predictions)
    
    # C. Calculate mathematical years
    
    # Try all possible date keys your model might have used
    raw_exp_dates = ai_extracted_data.get("EXP-DATE", []) 
    if not raw_exp_dates: 
        raw_exp_dates = ai_extracted_data.get("EXP_DATE", []) 
    if not raw_exp_dates:
        raw_exp_dates = ai_extracted_data.get("EXPERIENCE_DATE", [])
    

    # ==========================================
    # 🛡️ THE REGEX SAFETY NET
    # ==========================================
    if not raw_exp_dates:
        import re
        full_text = " ".join(all_words)
        
        # This powerful pattern hunts for any date ranges: "2024 - 2025", "July - August 2024", "05/2020 to Present"
        pattern = r"((?:[a-zA-Z]+)?\s*(?:0?[1-9]|1[0-2])?[\/\-\.]?\s*(?:19|20)?\d{0,4})\s*(?:-|–|—|to|à)\s*((?:[a-zA-Z]+)?\s*(?:0?[1-9]|1[0-2])?[\/\-\.]?\s*(?:19|20)\d{2}|present|current|aujourd'hui|now)"
        
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        for start, end in matches:
            # Filter out garbage matches by ensuring at least one number or keyword exists
            if re.search(r'\d|present|current', start + end, re.IGNORECASE):
                raw_exp_dates.append(f"{start.strip()} - {end.strip()}")
    # -----------------------
        
    ai_extracted_data["EXPERIENCE_YEARS"] = calculate_total_experience(raw_exp_dates)
    
    return ai_extracted_data