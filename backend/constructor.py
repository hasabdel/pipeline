from collections import defaultdict


# ==========================================
# 3. ENTITY RECONSTRUCTION HELPER (FIXED)
# ==========================================
def assemble_entities(words, predictions):
    """Combines consecutive B- and I- tags into clean strings."""
    # defaultdict automatically creates the key if it doesn't exist!
    entities = defaultdict(list)
    
    current_entity = []
    current_label = None
    
    for word, tag in zip(words, predictions):
        if tag == "O":
            if current_entity:
                entities[current_label].append(" ".join(current_entity))
                current_entity = []
                current_label = None
            continue
            
        # Example tag: "B-SKILL" -> prefix is "B-", label is "SKILL"
        # Example tag: "B-EXP" -> prefix is "B-", label is "EXP"
        prefix = tag[:2] 
        label = tag[2:]  
        
        if prefix == "B-":
            if current_entity:
                entities[current_label].append(" ".join(current_entity))
            current_entity = [word]
            current_label = label
            
        elif prefix == "I-" and label == current_label:
            current_entity.append(word)
            
    # Catch the last entity at the end of the document
    if current_entity:
        entities[current_label].append(" ".join(current_entity))
        
    return dict(entities) # Convert back to standard dict for printing