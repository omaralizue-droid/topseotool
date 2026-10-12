"""
TopSEOTool FastAPI Backend Microservice
Provides Python-based deep technical SEO crawler and multi-competitor audit APIs.
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from crawler import crawl_site_python, AI_BOTS

app = FastAPI(
    title="TopSEOTool AI Brand Visibility API",
    version="2.0.0",
    description="Python microservice for deep technical crawling, AI bot verification, and competitor benchmarking."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    url: str = Field(..., description="Website URL or domain name (e.g. stripe.com)")
    brand_name: Optional[str] = Field(None, description="Brand name if known")

class CompetitorCompareRequest(BaseModel):
    target_url: str
    target_brand: str
    competitor_urls: List[str] = Field(default_factory=list)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "TopSEOTool Python Microservice",
        "version": "2.0.0",
        "tracked_ai_bots": len(AI_BOTS),
    }

@app.post("/api/audit")
async def audit_website(req: AuditRequest):
    try:
        snapshot = await crawl_site_python(req.url)
        return {
            "ok": True,
            "brand": req.brand_name or snapshot.get("domain", "").split(".")[0].title(),
            "snapshot": snapshot,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")

@app.post("/api/compare")
async def compare_competitors(req: CompetitorCompareRequest):
    try:
        target_snapshot = await crawl_site_python(req.target_url)
        competitor_snapshots = []
        for c_url in req.competitor_urls[:4]:
            if c_url.strip():
                try:
                    c_snap = await crawl_site_python(c_url)
                    competitor_snapshots.append(c_snap)
                except Exception:
                    pass

        return {
            "ok": True,
            "target": {
                "brand": req.target_brand,
                "snapshot": target_snapshot,
            },
            "competitors": competitor_snapshots,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
