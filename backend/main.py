"""
Simple API to serve generated RFLCTN articles to the frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
from datetime import datetime
import re
from typing import List, Dict

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to generated articles
ARTICLES_DIR = Path(__file__).parent.parent.parent.parent / "nodal-curie" / "articles"

def parse_markdown_article(filepath: Path) -> Dict:
    """Parse a markdown article file into structured data"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract frontmatter
    frontmatter = {}
    body = content
    
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if match:
        frontmatter_str = match.group(1)
        body = match.group(2)
        
        for line in frontmatter_str.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip().strip('"')
    
    # Generate article ID from filename
    article_id = filepath.stem
    
    # Create article object matching the React app's Article interface
    article = {
        "id": article_id,
        "title": frontmatter.get('title', 'Untitled'),
        "subtitle": frontmatter.get('source', 'RFLCTN'),
        "author": "RFLCTN Editorial",
        "date": frontmatter.get('date', datetime.now().isoformat()),
        "coverImage": "",  # No cover image for now
        "content": body,
        "items": [],  # No clothing items for now
        "themeColor": "#E5E5E5",
        "category": "Editorial",
        "style": frontmatter.get('style', 'standard'),
        "sourceUrl": frontmatter.get('source_url', '')
    }
    
    return article

@app.get("/")
def read_root():
    return {"message": "RFLCTN Articles API", "status": "online"}

@app.get("/api/articles")
def get_articles() -> List[Dict]:
    """Get all generated articles"""
    if not ARTICLES_DIR.exists():
        return []
    
    articles = []
    
    # Get all markdown files
    md_files = sorted(ARTICLES_DIR.glob("*.md"), reverse=True)  # Most recent first
    
    for md_file in md_files:
        try:
            article = parse_markdown_article(md_file)
            articles.append(article)
        except Exception as e:
            print(f"Error parsing {md_file}: {e}")
            continue
    
    return articles

@app.get("/api/articles/{article_id}")
def get_article(article_id: str) -> Dict:
    """Get a specific article by ID"""
    filepath = ARTICLES_DIR / f"{article_id}.md"
    
    if not filepath.exists():
        return {"error": "Article not found"}
    
    return parse_markdown_article(filepath)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
