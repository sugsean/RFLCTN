from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import os
import google.generativeai as genai

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure GenAI
API_KEY = os.environ.get("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Define request/response models
class MissionConfig(BaseModel):
    topic: str
    tone: str
    keywords: List[str]
    targetAudience: str
    targetProfile: Optional[Dict] = None
    styleGuide: Optional[str] = None

class MissionResponse(BaseModel):
    id: str
    title: str
    subtitle: str
    author: str
    date: str
    coverImage: str
    content: str
    items: List[Dict]
    themeColor: str
    category: str
    style: str
    sourceUrl: str

@app.get("/api")
def read_root():
    return {"message": "RFLCTN AI Backend (Vercel)", "status": "online", "version": "3.0.0-VERCEL-FLASH-2.5"}

@app.post("/api/dispatch-mission")
async def dispatch_mission(config: MissionConfig):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Server misconfiguration: GEMINI_API_KEY not set in Vercel Environment Variables.")

    try:
        # Step 1: Researcher Agent
        researcher_prompt = f"""
You are a fashion research specialist. Your task is to gather information about: {config.topic}

Focus on:
- Keywords: {', '.join(config.keywords) if config.keywords else 'N/A'}
- Target Audience: {config.targetAudience}

Provide a comprehensive research summary covering key trends, brands, and insights.
"""

        # Use gemini-2.5-flash
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        researcher_response = model.generate_content(researcher_prompt)
        research_findings = researcher_response.text
        
        # Step 2: Writer Agent
        writer_prompt = f"""
You are an elite fashion writer for RFLCTN.

RESEARCH FINDINGS:
{research_findings}

ASSIGNMENT:
Write a compelling fashion article about: {config.topic}

STYLE REQUIREMENTS:
- Tone: {config.tone}
- Target Audience: {config.targetAudience}
- Keywords: {', '.join(config.keywords) if config.keywords else 'N/A'}

FORMAT:
- Title: Bold headline (max 10 words)
- Subtitle: Hook (1 sentence)
- Body: 400-600 words, HTML paragraphs <p>
- Cite sources if available (or use known facts)
"""

        writer_response = model.generate_content(writer_prompt)
        article_text = writer_response.text
        
        # Parse output
        lines = article_text.strip().split('\n')
        title = lines[0].replace('Title:', '').replace('#', '').strip() if lines else config.topic
        subtitle = lines[1].replace('Subtitle:', '').strip() if len(lines) > 1 else "RFLCTN Editorial"
        
        body_start = 2
        for i, line in enumerate(lines):
            if line.strip() and not line.startswith('Title:') and not line.startswith('Subtitle:'):
                body_start = i
                break
        
        content = '\n'.join(lines[body_start:]).strip()
        
        return MissionResponse(
            id=f"article-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            title=title,
            subtitle=subtitle,
            author="RFLCTN AI Editorial",
            date=datetime.now().isoformat(),
            coverImage="",
            content=content,
            items=[],
            themeColor="#000000",
            category="Editorial",
            style=config.tone,
            sourceUrl=""
        )

    except Exception as e:
        print(f"Error in dispatch_mission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mission failed: {str(e)}")
