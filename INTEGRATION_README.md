# RFLCTN Website Integration

## Quick Start

### 1. Start the Backend API

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will run on `http://localhost:8000`

### 2. Start the Frontend

```bash
npm install
npm run dev
```

The website will run on `http://localhost:5173`

### 3. Generate Articles

In the `nodal-curie` directory:

```bash
# Generate one article
python main.py --mode once

# Or run the scheduler (generates every hour)
python main.py
```

## How It Works

1. **Article Generation** (`nodal-curie/`):
   - Python script fetches fashion news from RSS feeds
   - Gemini API writes articles in RFLCTN voice
   - Articles saved as markdown in `nodal-curie/articles/`

2. **Backend API** (`backend/main.py`):
   - FastAPI server reads markdown files
   - Parses frontmatter and content
   - Serves articles as JSON at `/api/articles`

3. **Frontend** (`App.tsx`):
   - React app fetches articles from API
   - Displays them in the existing RFLCTN design
   - Updates automatically when new articles are generated

## API Endpoints

- `GET /` - Health check
- `GET /api/articles` - List all articles
- `GET /api/articles/{id}` - Get specific article

## Integration Steps Completed

✅ Created FastAPI backend to serve articles  
✅ Added ArticlesService for frontend  
✅ Backend reads from `nodal-curie/articles/`  
✅ Articles formatted to match React app structure  

## Next Steps

1. Update `App.tsx` to fetch from API instead of using MOCK_ARTICLES
2. Add auto-refresh to show new articles without page reload
3. Style the article content (currently plain markdown)
