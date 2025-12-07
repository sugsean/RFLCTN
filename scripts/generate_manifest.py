
import os
import json
import re
from pathlib import Path
from datetime import datetime

# Define paths
BASE_DIR = Path(__file__).parent.parent
ARTICLES_DIR = BASE_DIR / "public" / "articles"
OUTPUT_FILE = BASE_DIR / "public" / "articles.json"

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to extract frontmatter
    # Matches --- at start of file, captures content, then ---
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    
    frontmatter = {}
    body = content
    
    if match:
        fm_text = match.group(1)
        body = match.group(2).strip()
        
        # Simple key-value parsing for yaml-like frontmatter
        for line in fm_text.split('\n'):
            line = line.strip()
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                frontmatter[key] = val
    
    # Construct article object
    article_id = file_path.stem
    
    return {
        "id": article_id,
        "title": frontmatter.get('title', 'Untitled'),
        "subtitle": frontmatter.get('source', 'RFLCTN'),
        "author": "RFLCTN Editorial",
        "date": frontmatter.get('date', datetime.now().isoformat()),
        "coverImage": frontmatter.get('image', ''), # Use image from frontmatter if available
        "content": body,
        "items": [], 
        "themeColor": "#E5E5E5",
        "category": "Editorial",
        "style": frontmatter.get('style', 'standard'),
        "sourceUrl": frontmatter.get('source_url', '')
    }

def main():
    if not ARTICLES_DIR.exists():
        print(f"Directory not found: {ARTICLES_DIR}")
        return

    articles = []
    print(f"Scanning articles in {ARTICLES_DIR}...")
    
    files = sorted(ARTICLES_DIR.glob("*.md"), reverse=True)
    
    for file_path in files:
        try:
            article = parse_markdown(file_path)
            articles.append(article)
            print(f"Processed: {file_path.name}")
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")

    # Write JSON manifest
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2)
    
    print(f"Successfully generated manifest with {len(articles)} articles.")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
