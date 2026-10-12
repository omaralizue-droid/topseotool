# TopSEOTool Python Microservice

A dedicated Python FastAPI microservice providing deep technical SEO crawling, AI crawler accessibility inspection, and multi-competitor comparison.

## Quickstart

```bash
cd python_service
pip install -r requirements.txt
python main.py
```

The service will run on `http://localhost:8000`.

## Endpoints

- `GET /health` — Service health check and status.
- `POST /api/audit` — Perform Python-based crawl of a target domain (`{"url": "example.com", "brand_name": "Example"}`).
- `POST /api/compare` — Compare target domain against competitor domains.
