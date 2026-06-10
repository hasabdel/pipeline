import fitz
from PIL import Image
import io
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# ==========================================
# 2. PYMUPDF EXTRACTION HELPER (WITH OCR)
# ==========================================

def extract_page_data(page):
    """Extracts words, bounding boxes, and an image. Triggers OCR if needed."""
    words = []
    boxes = []
    
    # 1. Render page to image (LayoutLMv3 requires an image)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) 
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    
    # 2. Try to get digital word coordinates
    page_w = page.rect.width
    page_h = page.rect.height
    raw_words = page.get_text("words")
    
    # ---------------------------------------------------------
    # THE OCR TRIGGER: If less than 10 words, it's a scanned image!
    # ---------------------------------------------------------
    if len(raw_words) < 10:
        print("  -> ⚠️ Scanned image detected. Triggering Tesseract OCR...")
        
        # Run Tesseract OCR on the image we just generated
        ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        img_w, img_h = img.size
        
        for i in range(len(ocr_data['text'])):
            word = ocr_data['text'][i].strip()
            if not word:
                continue
                
            # Grab Tesseract's pixel coordinates
            x0 = ocr_data['left'][i]
            y0 = ocr_data['top'][i]
            x1 = x0 + ocr_data['width'][i]
            y1 = y0 + ocr_data['height'][i]
            
            # Normalize to 0-1000 based on IMAGE dimensions
            norm_box = [
                int(max(0, min(1000, (x0 / img_w) * 1000))),
                int(max(0, min(1000, (y0 / img_h) * 1000))),
                int(max(0, min(1000, (x1 / img_w) * 1000))),
                int(max(0, min(1000, (y1 / img_h) * 1000)))
            ]
            words.append(word)
            boxes.append(norm_box)
            
        return words, boxes, img
    # ---------------------------------------------------------
    
    # 3. IF NOT SCANNED: Standard Fast Digital Extraction
    for entry in raw_words:
        x0, y0, x1, y1 = entry[0], entry[1], entry[2], entry[3]
        word = entry[4].strip()
        if not word:
            continue
            
        # Normalize coordinates to 0-1000 based on PDF PAGE dimensions
        norm_box = [
            int(max(0, min(1000, (x0 / page_w) * 1000))),
            int(max(0, min(1000, (y0 / page_h) * 1000))),
            int(max(0, min(1000, (x1 / page_w) * 1000))),
            int(max(0, min(1000, (y1 / page_h) * 1000)))
        ]
        
        words.append(word)
        boxes.append(norm_box)

        
    return words, boxes, img