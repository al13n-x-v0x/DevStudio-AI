"""
DocMind Layer — Document Intelligence & Indexing
Pastes or uploads docs, stack traces, or reference guides.
AI indexes them into a lightweight project memory file.
"""
import os, re, json, hashlib
from typing import List, Dict, Optional


class DocMind:
    """
    Document intelligence layer. Accepts any text document,
    chunks it intelligently, extracts key information, and
    indexes it into the DevBuddy memory system.
    """

    def __init__(self, memory_engine=None, ai_engine=None, chunk_size: int = 512, chunk_overlap: int = 64):
        self.memory = memory_engine
        self.ai = ai_engine
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.supported_extensions = {
            "py", "js", "ts", "jsx", "tsx", "java", "c", "cpp", "h", "hpp",
            "go", "rs", "rb", "php", "cs", "swift", "kt",
            "json", "yaml", "yml", "toml", "xml", "ini", "cfg", "conf",
            "md", "txt", "rst", "log", "csv",
            "html", "css", "scss", "less",
            "sh", "bash", "zsh", "bat", "ps1",
            "sql", "graphql", "proto",
            "dockerfile", "makefile", "cmake",
        }

    def detect_type(self, filename: str, content: str) -> str:
        """Detect document type from filename and content."""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        # Stack trace detection
        if "traceback" in content.lower() or "exception" in content.lower() or "at line" in content.lower():
            return "stacktrace"
        if re.search(r"(Error|Exception|Fault).*:", content[:500]):
            return "stacktrace"

        # Log file detection
        if ext == "log" or re.match(r"^\d{4}[-/]\d{2}[-/]\d{2}", content[:100]):
            return "log"

        # Config detection
        if ext in ("json", "yaml", "yml", "toml", "ini", "cfg", "conf", "env"):
            return "config"

        # Documentation
        if ext in ("md", "txt", "rst"):
            return "documentation"

        # Code
        if ext in self.supported_extensions:
            return "code"

        return "text"

    def chunk_text(self, text: str, filename: str = "") -> List[Dict]:
        """
        Intelligently chunk text with overlap.
        Respects code boundaries (functions, classes) when possible.
        """
        chunks = []
        doc_type = self.detect_type(filename, text)

        if doc_type == "code":
            chunks = self._chunk_code(text, filename)
        elif doc_type == "stacktrace":
            chunks = self._chunk_stacktrace(text, filename)
        else:
            chunks = self._chunk_plain(text, filename)

        return chunks

    def _chunk_code(self, text: str, filename: str) -> List[Dict]:
        """Chunk code by functions/classes."""
        lines = text.split("\n")
        chunks = []
        current_chunk = []
        current_start = 1

        # Python-style patterns
        def_patterns = [
            re.compile(r"^(class|def|function|async\s+def|pub\s+fn|fn\s+|func\s+)\s"),
            re.compile(r"^(export\s+)?(default\s+)?(class|function|const\s+\w+\s*=\s*(?:async\s*)?\()"),
        ]

        for i, line in enumerate(lines):
            is_boundary = any(p.match(line.strip()) for p in def_patterns)

            if is_boundary and current_chunk:
                chunk_text = "\n".join(current_chunk)
                if len(chunk_text.strip()) > 10:
                    chunks.append({
                        "text": chunk_text,
                        "start_line": current_start,
                        "end_line": current_start + len(current_chunk) - 1,
                        "type": "function",
                        "preview": current_chunk[0][:100],
                    })
                current_chunk = []
                current_start = i + 1

            current_chunk.append(line)

            if len("\n".join(current_chunk)) > self.chunk_size:
                chunk_text = "\n".join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "start_line": current_start,
                    "end_line": current_start + len(current_chunk) - 1,
                    "type": "block",
                    "preview": current_chunk[0][:100],
                })
                # Keep overlap
                overlap_lines = current_chunk[-self.chunk_overlap // 20:] if self.chunk_overlap else []
                current_chunk = overlap_lines
                current_start = i + 1 - len(overlap_lines)

        # Final chunk
        if current_chunk:
            chunk_text = "\n".join(current_chunk)
            if len(chunk_text.strip()) > 10:
                chunks.append({
                    "text": chunk_text,
                    "start_line": current_start,
                    "end_line": current_start + len(current_chunk) - 1,
                    "type": "block",
                    "preview": current_chunk[0][:100],
                })

        return chunks

    def _chunk_stacktrace(self, text: str, filename: str) -> List[Dict]:
        """Chunk stack traces into individual error frames."""
        chunks = []
        # Split on "Traceback" or error boundaries
        parts = re.split(r"(?=Traceback \(most recent call|Error:|Exception:)", text)

        for i, part in enumerate(parts):
            if len(part.strip()) > 10:
                chunks.append({
                    "text": part.strip(),
                    "start_line": 1,
                    "end_line": part.count("\n") + 1,
                    "type": "error_frame",
                    "preview": part.strip()[:100],
                })

        return chunks or [{"text": text, "start_line": 1, "end_line": text.count("\n") + 1, "type": "error", "preview": text[:100]}]

    def _chunk_plain(self, text: str, filename: str) -> List[Dict]:
        """Chunk plain text by paragraphs/sections."""
        chunks = []
        # Split by double newlines (paragraphs/sections)
        sections = re.split(r"\n\s*\n", text)
        current_chunk = []

        for section in sections:
            current_chunk.append(section)
            chunk_text = "\n\n".join(current_chunk)

            if len(chunk_text) > self.chunk_size:
                chunks.append({
                    "text": chunk_text,
                    "start_line": 1,
                    "end_line": chunk_text.count("\n") + 1,
                    "type": "section",
                    "preview": chunk_text[:100],
                })
                current_chunk = []

        if current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            if len(chunk_text.strip()) > 10:
                chunks.append({
                    "text": chunk_text,
                    "start_line": 1,
                    "end_line": chunk_text.count("\n") + 1,
                    "type": "section",
                    "preview": chunk_text[:100],
                })

        return chunks or [{"text": text, "start_line": 1, "end_line": text.count("\n") + 1, "type": "full", "preview": text[:100]}]

    def index_document(self, filename: str, content: str, project: str = "default",
                       metadata: Dict = None) -> Dict:
        """
        Full document indexing pipeline:
        1. Detect type
        2. Chunk intelligently
        3. AI analyze (if available)
        4. Store in memory
        """
        doc_type = self.detect_type(filename, content)
        chunks = self.chunk_text(filename=filename, text=content)

        # AI analysis
        analysis = {}
        if self.ai:
            try:
                analysis = self.ai.analyze_document(filename, content, doc_type)
            except Exception:
                analysis = {}

        # Extract useful metadata
        languages = []
        if doc_type == "code":
            ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
            lang_map = {
                "py": "python", "js": "javascript", "ts": "typescript", "jsx": "react",
                "tsx": "react", "java": "java", "c": "c", "cpp": "cpp", "go": "go",
                "rs": "rust", "rb": "ruby", "php": "php", "cs": "csharp",
            }
            languages = [lang_map.get(ext, ext)]

        tags = [doc_type, filename.split(".")[-1] if "." in filename else "text"]
        if analysis.get("key_topics"):
            tags.extend(analysis["key_topics"][:5])
        if languages:
            tags.extend(languages)

        # Store in memory
        if self.memory:
            entry = self.memory.add_doc_index(
                filename=filename,
                content=content[:3000],
                chunks=chunks,
                project=project,
                metadata={
                    "doc_type": doc_type,
                    "chunk_count": len(chunks),
                    "languages": languages,
                    "analysis": analysis,
                    "char_count": len(content),
                    "line_count": content.count("\n") + 1,
                    **(metadata or {})
                }
            )

            # Also add tags
            for tag in tags:
                self.memory.add(
                    entry_type="doc_tag",
                    title=f"Tag: {tag}",
                    content=f"Document {filename} tagged as {tag}",
                    tags=[tag, "tag"],
                    project=project,
                )

            return {
                "status": "indexed",
                "filename": filename,
                "doc_type": doc_type,
                "chunks": len(chunks),
                "tags": tags,
                "analysis": analysis,
                "entry_id": entry["id"],
            }

        return {
            "status": "indexed",
            "filename": filename,
            "doc_type": doc_type,
            "chunks": len(chunks),
            "tags": tags,
            "analysis": analysis,
        }

    def search_documents(self, query: str, project: str = None) -> List[Dict]:
        """Search indexed documents."""
        if not self.memory:
            return []
        results = self.memory.query(query, entry_type="document", project=project)
        return results

    def get_document_list(self, project: str = None) -> List[Dict]:
        """List all indexed documents."""
        if not self.memory:
            return []
        entries = self.memory.get_recent(entry_type="document", limit=100)
        if project:
            entries = [e for e in entries if e.get("project") == project]
        return [{"title": e["title"], "summary": e["summary"], "created_at": e["created_at"],
                 "metadata": e.get("metadata", {})} for e in entries]
