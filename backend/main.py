"""
DevStudio AI — Python Backend (FastAPI)
AI engine, security scanning, document indexing, persistent memory.
Connects to NVIDIA Nemotron via Nebius Token Factory.
"""
import os, sys, json, time
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

# Local modules
from core.memory import MemoryEngine
from core.ai_engine import AIEngine
from modules.docmind import DocMind
from modules.secure_agent import SecureAgent

# ─── Lifespan ─────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

memory = MemoryEngine(db_path=os.path.join(DATA_DIR, "memory.json"))
ai = AIEngine()
docmind = DocMind(memory_engine=memory, ai_engine=ai)
secure_agent = SecureAgent(memory_engine=memory, ai_engine=ai)

# WebSocket connections for live progress
ws_clients = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("  🛡️  DevStudio AI Backend starting...")
    print(f"  📁 Memory: {len(memory.entries)} entries loaded")
    print(f"  🤖 AI Engine: {'Connected' if ai.client else 'Offline (set NEBIUS_API_KEY)'}")
    yield
    print("  👋 DevStudio AI Backend shutting down...")

app = FastAPI(title="DevStudio AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    code: str
    language: str = "auto"
    filename: str = "input"

class DocMindRequest(BaseModel):
    content: str
    filename: str = ""
    doc_type: str = "auto"
    project: str = "default"

class ChatRequest(BaseModel):
    question: str
    project: str = "default"

class SkillRequest(BaseModel):
    description: str

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


# ─── Routes ───────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"name": "DevStudio AI", "version": "1.0.0", "status": "running"}


# ─── SecureAgent: Scan Code ───────────────────────────────────────────

@app.post("/api/scan")
async def api_scan(req: ScanRequest):
    """Scan code for vulnerabilities. Returns findings + score."""
    filename = req.filename or f"pasted_{int(time.time())}.txt"
    result = secure_agent.scan_code(
        code=req.code,
        filename=filename,
        language=req.language,
        include_style=True,
    )
    return result


@app.post("/api/scan/deep")
async def api_scan_deep(req: ScanRequest):
    """Deep AI-powered security analysis using Nemotron."""
    # First do pattern scan
    pattern_result = secure_agent.scan_code(req.code, req.filename, req.language)

    # Then AI deep analysis
    ai_analysis = {}
    if ai.client:
        ai_analysis = ai.deep_security_analysis(
            req.code, req.language, pattern_result["findings"]
        )

    return {
        **pattern_result,
        "ai_analysis": ai_analysis,
        "deep_scan": True,
    }


@app.get("/api/vulns")
def api_vulns():
    """List all supported vulnerability patterns."""
    return {"patterns": secure_agent.get_all_patterns(), "count": len(secure_agent.get_all_patterns())}


# ─── DocMind: Document Indexing ───────────────────────────────────────

@app.post("/api/docmind")
async def api_docmind(req: DocMindRequest):
    """Index a document into project memory."""
    filename = req.filename or f"pasted_{int(time.time())}.txt"
    result = docmind.index_document(
        filename=filename,
        content=req.content,
        project=req.project,
        metadata={"doc_type": req.doc_type},
    )
    return result


@app.get("/api/docs")
def api_docs(project: Optional[str] = None):
    """List all indexed documents."""
    docs = docmind.get_document_list(project=project)
    return {"documents": docs, "count": len(docs)}


@app.post("/api/docs/search")
def api_docs_search(q: str, project: Optional[str] = None):
    """Search indexed documents."""
    results = docmind.search_documents(q, project=project)
    return {"results": results, "count": len(results)}


# ─── DevBuddy: Chat & Memory ──────────────────────────────────────────

@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    """Chat with DevBuddy. Queries memory for context, generates AI response."""
    # Search memory for relevant context
    mem_results = memory.query(req.question, limit=5)
    mem_context = ""
    if mem_results:
        mem_context = "\n".join([
            f"- [{e['type']}] {e['title']}: {e.get('summary', '')}"
            for e in mem_results
        ])

    # Get AI response
    answer = ai.chat(req.question, memory_context=mem_context)

    # Store in memory
    memory.add_conversation(req.question, answer, project=req.project)

    return {"answer": answer, "context_used": len(mem_results)}


@app.get("/api/memory")
def api_memory(project: Optional[str] = None, limit: int = 50):
    """Get memory stats and recent entries."""
    stats = memory.get_stats()
    recent = memory.get_recent(limit=limit)
    return {"stats": stats, "recent": recent}


@app.get("/api/memory/query")
def api_memory_query(q: str, entry_type: Optional[str] = None, limit: int = 20):
    """Query memory with natural language."""
    results = memory.query(q, entry_type=entry_type, limit=limit)
    return {"results": results, "count": len(results)}


@app.get("/api/memory/timeline")
def api_memory_timeline(days: int = 7):
    """Get memory timeline for last N days."""
    entries = memory.get_timeline(days=days)
    return {"entries": entries, "count": len(entries)}


@app.get("/api/export")
def api_export(fmt: str = "markdown"):
    """Export entire memory."""
    content = memory.export_memory(fmt)
    media_type = "text/markdown" if fmt == "markdown" else "application/json"
    return content, 200, {"Content-Type": media_type, "Content-Disposition": f"attachment; filename=devstudio_memory.{fmt}"}


# ─── Skills ───────────────────────────────────────────────────────────

@app.post("/api/search")
async def api_search(req: SearchRequest):
    """Search the web using Tavily API."""
    result = ai.web_search(req.query, max_results=req.max_results)
    return result


@app.post("/api/search-and-answer")
async def api_search_and_answer(req: ChatRequest):
    """Search the web and generate an AI answer."""
    answer = ai.search_and_answer(req.question)
    return {"answer": answer, "question": req.question}


@app.post("/api/skills/generate")
async def api_generate_skill(req: SkillRequest):
    """Generate a reusable skill using AI."""
    skill = ai.generate_skill(req.description)
    if skill:
        memory.add_skill(
            name=skill.get("name", "custom"),
            description=skill.get("description", req.description),
            code=skill.get("code", ""),
        )
    return skill


@app.get("/api/skills")
def api_skills():
    """List all saved skills."""
    skills = memory.query("", entry_type="skill", limit=50)
    return {"skills": skills, "count": len(skills)}


# ─── Dashboard Stats ──────────────────────────────────────────────────

@app.get("/api/stats")
def api_stats():
    """Get overall stats for dashboard."""
    stats = memory.get_stats()
    return {
        "total_entries": stats["total_entries"],
        "by_type": stats["by_type"],
        "by_severity": stats["by_severity"],
        "indexed_words": stats["indexed_words"],
        "uptime": time.time(),
        "ai_connected": ai.client is not None,
    }


# ─── WebSocket: Live Scanning ─────────────────────────────────────────

@app.websocket("/ws/scan")
async def ws_scan(websocket: WebSocket):
    """WebSocket for real-time scan progress updates."""
    await websocket.accept()
    ws_clients.add(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            code = data.get("code", "")
            language = data.get("language", "auto")

            # Send progress updates
            steps = [
                ("tokenize", "Tokenizing code...", 10),
                ("patterns", "Scanning 50+ vulnerability patterns...", 30),
                ("owasp", "Checking OWASP/CWE mappings...", 50),
                ("style", "Running style checks...", 70),
                ("memory", "Indexing to memory...", 90),
                ("done", "Scan complete!", 100),
            ]

            for step_id, message, progress in steps:
                await websocket.send_json({
                    "type": "progress",
                    "step": step_id,
                    "message": message,
                    "progress": progress,
                })
                await __import__("asyncio").sleep(0.3)

            # Run actual scan
            result = secure_agent.scan_code(code, language=language)
            await websocket.send_json({
                "type": "result",
                "data": result,
            })

    except WebSocketDisconnect:
        ws_clients.discard(websocket)
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        ws_clients.discard(websocket)


if __name__ == "__main__":
    import uvicorn
    print("\n  🛡️  DevStudio AI Backend")
    print("  → http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
