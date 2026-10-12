"""
TopSEOTool Python Technical Audit Crawler
Extracts HTML signals, evaluates robots.txt for AI bots, parses metadata & Schema.org JSON-LD.
"""

import re
import urllib.parse
from typing import Dict, List, Any, Optional
import httpx
from bs4 import BeautifulSoup

AI_BOTS = [
    {"id": "OAI-SearchBot", "name": "OAI-SearchBot", "owner": "OpenAI", "purpose": "ChatGPT search results & citations"},
    {"id": "ChatGPT-User", "name": "ChatGPT-User", "owner": "OpenAI", "purpose": "Live page visits from ChatGPT"},
    {"id": "GPTBot", "name": "GPTBot", "owner": "OpenAI", "purpose": "Model training data"},
    {"id": "PerplexityBot", "name": "PerplexityBot", "owner": "Perplexity", "purpose": "Perplexity answer index"},
    {"id": "ClaudeBot", "name": "ClaudeBot", "owner": "Anthropic", "purpose": "Claude training & retrieval"},
    {"id": "Claude-SearchBot", "name": "Claude-SearchBot", "owner": "Anthropic", "purpose": "Claude web search results"},
    {"id": "Googlebot", "name": "Googlebot", "owner": "Google", "purpose": "Google Search & AI Overviews"},
    {"id": "Google-Extended", "name": "Google-Extended", "owner": "Google", "purpose": "Gemini grounding & training"},
    {"id": "Bingbot", "name": "Bingbot", "owner": "Microsoft", "purpose": "Bing index that powers Copilot"},
    {"id": "Applebot-Extended", "name": "Applebot-Extended", "owner": "Apple", "purpose": "Apple Intelligence"},
    {"id": "Meta-ExternalAgent", "name": "Meta-ExternalAgent", "owner": "Meta", "purpose": "Meta AI"},
    {"id": "CCBot", "name": "CCBot", "owner": "Common Crawl", "purpose": "Open dataset many LLMs train on"},
]

def normalize_target_url(raw_url: str) -> str:
    url = raw_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    parsed = urllib.parse.urlparse(url)
    if not parsed.netloc:
        raise ValueError(f"Invalid URL: {raw_url}")
    return urllib.parse.urlunparse(parsed._replace(fragment=""))

def evaluate_robots_txt(robots_content: Optional[str]) -> List[Dict[str, Any]]:
    if not robots_content:
        return [{**bot, "status": "allowed"} for bot in AI_BOTS]

    lines = robots_content.splitlines()
    groups: List[Dict[str, Any]] = []
    current_group: Optional[Dict[str, Any]] = None
    last_was_agent = False

    for raw_line in lines:
        line = re.sub(r"#.*$", "", raw_line).strip()
        if not line or ":" not in line:
            continue
        key, val = [p.strip() for p in line.split(":", 1)]
        key_lower = key.lower()

        if key_lower == "user-agent":
            if not current_group or not last_was_agent:
                current_group = {"agents": [], "rules": []}
                groups.append(current_group)
            current_group["agents"].append(val.lower())
            last_was_agent = True
        elif key_lower in ("allow", "disallow"):
            if current_group:
                current_group["rules"].append({"type": key_lower, "path": val})
            last_was_agent = False
        else:
            last_was_agent = False

    results = []
    wildcard_group = next((g for g in groups if "*" in g["agents"]), None)

    for bot in AI_BOTS:
        token = bot["id"].lower()
        specific = next((g for g in groups if any(a != "*" and token.startswith(a) for a in g["agents"])), None)
        active_group = specific or wildcard_group

        status = "allowed"
        if active_group:
            disallows = [r for r in active_group["rules"] if r["type"] == "disallow" and r["path"]]
            allows_root = any(r["type"] == "allow" and r["path"] in ("/", "/*") for r in active_group["rules"])
            blocks_root = any(r["type"] == "disallow" and r["path"] in ("/", "/*") for r in disallows)

            if blocks_root and not allows_root:
                status = "blocked"
            elif blocks_root and allows_root:
                status = "partial"
            elif len(disallows) > 8:
                status = "partial"

        results.append({**bot, "status": status})

    return results

async def crawl_site_python(raw_url: str) -> Dict[str, Any]:
    target_url = normalize_target_url(raw_url)
    parsed = urllib.parse.urlparse(target_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    domain = parsed.netloc.replace("www.", "").lower()

    headers = {"User-Agent": "Mozilla/5.0 (compatible; TopSEOToolPythonBot/1.0; +https://topseotool.net)"}

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=headers) as client:
        # Fetch homepage
        try:
            home_resp = await client.get(target_url)
            html = home_resp.text
            status_code = home_resp.status_code
        except Exception as e:
            return {
                "url": target_url,
                "domain": domain,
                "reachable": False,
                "error": str(e),
                "bots": [{**b, "status": "unknown"} for b in AI_BOTS],
            }

        # Fetch robots.txt & llms.txt concurrently
        robots_txt = None
        llms_txt = None
        try:
            r_resp = await client.get(f"{origin}/robots.txt")
            if r_resp.status_code == 200 and not r_resp.text.strip().startswith("<"):
                robots_txt = r_resp.text
        except Exception:
            pass

        try:
            l_resp = await client.get(f"{origin}/llms.txt")
            if l_resp.status_code == 200 and len(l_resp.text.strip()) > 20:
                llms_txt = l_resp.text
        except Exception:
            pass

    # Parse HTML using BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else None
    meta_desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    description = meta_desc.get("content", "").strip() if meta_desc else None

    h1_tags = [h.get_text(strip=True) for h in soup.find_all("h1")][:5]
    h2_tags = [h.get_text(strip=True) for h in soup.find_all("h2")][:10]

    # JSON-LD Schema types
    schema_types = []
    for script in soup.find_all("script", attrs={"type": re.compile(r"application/ld\+json", re.I)}):
        content = script.string or ""
        matches = re.findall(r'"@type"\s*:\s*"([^"]+)"', content)
        schema_types.extend(matches)

    bots = evaluate_robots_txt(robots_txt)
    word_count = len(re.findall(r"\b[a-zA-Z]{2,}\b", soup.get_text()))

    return {
        "url": target_url,
        "domain": domain,
        "reachable": status_code < 400,
        "statusCode": status_code,
        "title": title,
        "description": description,
        "h1": h1_tags,
        "h2": h2_tags,
        "schemaTypes": list(set(schema_types))[:10],
        "wordCount": word_count,
        "llmsTxtFound": bool(llms_txt),
        "robotsTxtFound": bool(robots_txt),
        "bots": bots,
    }
