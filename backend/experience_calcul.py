import re
from datetime import datetime
import calendar

def parse_date(date_str, is_end_date=False, inherited_year=None):
    """Parses a date string, handling text months and missing years."""
    date_str = date_str.lower().strip()
    
    # 1. Handle Present
    if any(word in date_str for word in ['present', 'current', 'aujourd', 'now', 'cours']):
        return datetime.now()
    
    # 2. Extract Year
    year_match = re.search(r'\d{4}', date_str)
    if year_match:
        year = int(year_match.group())
    elif inherited_year:
        year = inherited_year  # Borrows the year (e.g., "July" takes 2024 from "August 2024")
    else:
        return None

    # 3. Extract Month
    month = 1 if not is_end_date else 12 # Default
    
    # Try digit format (05/2020)
    month_match = re.search(r'\b(0?[1-9]|1[0-2])[/\-\.]\d{4}\b', date_str)
    if month_match:
        month = int(month_match.group(1))
    else:
        # Try text format (Jan, Fév, July)
        months_en = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        months_fr = ['janv', 'fev', 'mars', 'avr', 'mai', 'juin', 'juil', 'aout', 'sept', 'oct', 'nov', 'dec']
        for i, (m_en, m_fr) in enumerate(zip(months_en, months_fr)):
            if m_en in date_str or m_fr in date_str.replace('é', 'e').replace('û', 'u'):
                month = i + 1
                break

    # 4. Return correct day of the month
    if is_end_date:
        last_day = calendar.monthrange(year, month)[1] # Gets exactly 28, 30, or 31
        return datetime(year, month, last_day)
    else:
        return datetime(year, month, 1)


def calculate_total_experience(exp_date_strings):
    intervals = []
    
    for date_range in exp_date_strings:
        parts = re.split(r'-|–|—| to | à ', date_range, maxsplit=1, flags=re.IGNORECASE)
        
        if len(parts) == 2:
            # Parse END date first so we can steal its year if the start date is missing one
            end_date = parse_date(parts[1], is_end_date=True)
            borrowed_yr = end_date.year if end_date else None
            start_date = parse_date(parts[0], is_end_date=False, inherited_year=borrowed_yr)
            
            if start_date and end_date and end_date >= start_date:
                intervals.append([start_date, end_date])
                
        elif len(parts) == 1: # Single dates like "February 2025"
            start_date = parse_date(parts[0], is_end_date=False)
            end_date = parse_date(parts[0], is_end_date=True)
            if start_date and end_date:
                intervals.append([start_date, end_date])

    if not intervals:
        return 0.0

    # Merge overlapping intervals
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current_start, current_end in intervals[1:]:
        last_start, last_end = merged[-1]
        if current_start <= last_end:
            merged[-1] = [last_start, max(last_end, current_end)]
        else:
            merged.append([current_start, current_end])
            
    # Calculate exactly
    total_days = sum((end - start).days + 1 for start, end in merged) # +1 includes the final day
    return round(total_days / 365.25, 1)




# if __name__ == "__main__":
#     # Imagine your LayoutLMv4 model outputted this JSON array for EXP-DATE:
#     ai_extracted_dates = [
#         "2024 - 2025",
#         "February 2025",
#         "July - August 2024",
#         "fév 2026"
#     ]
    
#     years = calculate_total_experience(ai_extracted_dates)
    
#     print(f"Extracted Dates: {ai_extracted_dates}")
#     print(f"Total True Experience: {years} Years")