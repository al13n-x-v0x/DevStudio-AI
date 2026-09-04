"""
DevBuddy Core — Persistent Memory Engine
Stores all research, security findings, and doc indexes into a queryable memory file.
Natural language query against your entire development history.
"""
import os, json, time, hashlib, re
from datetime import datetime
from typing import List, Dict, Optional, Tuple


class MemoryEngine:
    """
    Persistent memory store. Every interaction — document indexed, vulnerability found,
    code scanned, question answered — is stored here and queryable via natural language.
    """

    def __init__(self, db_path: str = "data/memory.json", max_entries: int = 10000):
        self.db_path = db_path
        self.max_entries = max_entries
        self.entries = []
        self.indexes = {
            "tags": {},       # tag -> [entry_ids]
            "types": {},      # type -> [entry_ids]
            "projects": {},   # project -> [entry_ids]
            "severity": {},   # severity -> [entry_ids]
            "full_text": {},  # word -> [entry_ids] (simple inverted index)
        }
        self._load()

    def _load(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.entries = data.get("entries", [])
                self.indexes = data.get("indexes", self.indexes)
        else:
            os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump({
                "entries": self.entries,
                "indexes": self.indexes,
                "meta": {
                    "count": len(self.entries),
                    "last_updated": datetime.now().isoformat(),
                    "version": "1.0.0"
                }
            }, f, indent=2, ensure_ascii=False)

    def _update_indexes(self, entry: Dict):
        entry_id = entry["id"]

        # Tag index
        for tag in entry.get("tags", []):
            self.indexes["tags"].setdefault(tag, [])
            if entry_id not in self.indexes["tags"][tag]:
                self.indexes["tags"][tag].append(entry_id)

        # Type index
        etype = entry.get("type", "unknown")
        self.indexes["types"].setdefault(etype, [])
        if entry_id not in self.indexes["types"][etype]:
            self.indexes["types"][etype].append(entry_id)

        # Project index
        project = entry.get("project", "default")
        self.indexes["projects"].setdefault(project, [])
        if entry_id not in self.indexes["projects"][project]:
            self.indexes["projects"][project].append(entry_id)

        # Severity index
        sev = entry.get("severity", "")
        if sev:
            self.indexes["severity"].setdefault(sev, [])
            if entry_id not in self.indexes["severity"][sev]:
                self.indexes["severity"][sev].append(entry_id)

        # Full-text inverted index (simple word matching)
        text = (entry.get("content", "") + " " + entry.get("summary", "") + " " + entry.get("title", "")).lower()
        words = set(re.findall(r'\b[a-z]{3,}\b', text))
        for word in words:
            self.indexes["full_text"].setdefault(word, [])
            if entry_id not in self.indexes["full_text"][word]:
                self.indexes["full_text"][word].append(entry_id)

    def add(self, entry_type: str, title: str, content: str, summary: str = "",
            tags: List[str] = None, project: str = "default", severity: str = "",
            metadata: Dict = None) -> Dict:
        """Add a new memory entry."""
        entry = {
            "id": hashlib.md5(f"{time.time()}{title}".encode()).hexdigest()[:12],
            "type": entry_type,
            "title": title,
            "content": content,
            "summary": summary or title,
            "tags": tags or [],
            "project": project,
            "severity": severity,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
        }

        self.entries.append(entry)
        self._update_indexes(entry)

        # Auto-summarize if too many entries
        if len(self.entries) > self.max_entries:
            self._compress()

        self._save()
        return entry

    def add_doc_index(self, filename: str, content: str, chunks: List[Dict],
                      project: str = "default", metadata: Dict = None) -> Dict:
        """Store a DocMind document index."""
        return self.add(
            entry_type="document",
            title=f"📄 {filename}",
            content=content[:2000],
            summary=f"Document indexed: {filename} ({len(chunks)} chunks)",
            tags=["document", "indexed", filename.split(".")[-1] if "." in filename else "text"],
            project=project,
            metadata={
                "filename": filename,
                "chunk_count": len(chunks),
                "chunks": chunks[:50],  # Store first 50 chunks
                **(metadata or {})
            }
        )

    def add_security_finding(self, vuln_type: str, severity: str, file: str,
                             line: int, code: str, fix: str,
                             owasp: str = "", cwe: str = "",
                             project: str = "default") -> Dict:
        """Store a SecureAgent security finding."""
        return self.add(
            entry_type="security_finding",
            title=f"🔒 {vuln_type} in {file}",
            content=f"Line {line}: {code}\nFix: {fix}",
            summary=f"{severity} vulnerability: {vuln_type} at {file}:{line}",
            tags=["security", "vulnerability", vuln_type.lower().replace(" ", "_"), severity.lower()],
            project=project,
            severity=severity,
            metadata={
                "file": file, "line": line, "code": code, "fix": fix,
                "owasp": owasp, "cwe": cwe
            }
        )

    def add_scan_result(self, filename: str, findings: List[Dict], score: int,
                        project: str = "default") -> Dict:
        """Store a full scan result."""
        return self.add(
            entry_type="scan_result",
            title=f"🛡️ Scan: {filename}",
            content=json.dumps(findings, indent=2)[:3000],
            summary=f"Scanned {filename}: {len(findings)} findings, score {score}/100",
            tags=["scan", filename.split(".")[-1] if "." in filename else "code"],
            project=project,
            severity="HIGH" if any(f.get("severity") == "CRITICAL" for f in findings) else "MEDIUM",
            metadata={
                "filename": filename,
                "finding_count": len(findings),
                "score": score,
                "findings": findings
            }
        )

    def add_conversation(self, question: str, answer: str, context: str = "",
                         project: str = "default") -> Dict:
        """Store a Q&A interaction."""
        return self.add(
            entry_type="conversation",
            title=f"💬 {question[:80]}",
            content=f"Q: {question}\nA: {answer}",
            summary=f"Q: {question[:60]}",
            tags=["conversation", "qa"],
            project=project,
            metadata={"question": question, "answer": answer, "context": context}
        )

    def add_skill(self, name: str, description: str, code: str,
                  project: str = "default") -> Dict:
        """Store a reusable skill."""
        return self.add(
            entry_type="skill",
            title=f"⚡ Skill: {name}",
            content=code,
            summary=f"Reusable skill: {name} — {description}",
            tags=["skill", "reusable", name.lower().replace(" ", "_")],
            project=project,
            metadata={"name": name, "description": description, "code": code}
        )

    def query(self, query_text: str, entry_type: str = None,
              project: str = None, severity: str = None,
              limit: int = 20) -> List[Dict]:
        """
        Natural language query against memory.
        Uses keyword matching + relevance scoring.
        """
        query_lower = query_text.lower()
        query_words = set(re.findall(r'\b[a-z]{3,}\b', query_lower))

        # Collect candidate IDs from inverted index
        candidate_scores = {}
        for word in query_words:
            for entry_id in self.indexes["full_text"].get(word, []):
                candidate_scores[entry_id] = candidate_scores.get(entry_id, 0) + 1

        # Boost matches in titles
        for entry in self.entries:
            eid = entry["id"]
            if eid in candidate_scores:
                title_lower = entry.get("title", "").lower()
                for word in query_words:
                    if word in title_lower:
                        candidate_scores[eid] += 3

        # If no index matches, fall back to scanning all entries
        if not candidate_scores:
            for entry in self.entries:
                eid = entry["id"]
                text = (entry.get("content", "") + " " + entry.get("title", "") + " " + entry.get("summary", "")).lower()
                for word in query_words:
                    if word in text:
                        candidate_scores[eid] = candidate_scores.get(eid, 0) + 1

        # Sort by score descending
        sorted_ids = sorted(candidate_scores.keys(), key=lambda x: candidate_scores[x], reverse=True)

        # Apply filters and return
        results = []
        entry_map = {e["id"]: e for e in self.entries}
        for eid in sorted_ids[:limit * 2]:  # Get extra for filtering
            entry = entry_map.get(eid)
            if not entry:
                continue
            if entry_type and entry.get("type") != entry_type:
                continue
            if project and entry.get("project") != project:
                continue
            if severity and entry.get("severity") != severity:
                continue
            results.append(entry)
            if len(results) >= limit:
                break

        return results

    def get_recent(self, entry_type: str = None, limit: int = 20) -> List[Dict]:
        """Get most recent entries."""
        entries = self.entries
        if entry_type:
            entries = [e for e in entries if e.get("type") == entry_type]
        return entries[-limit:][::-1]

    def get_stats(self) -> Dict:
        """Get memory statistics."""
        stats = {
            "total_entries": len(self.entries),
            "by_type": {},
            "by_severity": {},
            "by_project": {},
            "indexed_words": len(self.indexes.get("full_text", {})),
        }
        for e in self.entries:
            t = e.get("type", "unknown")
            stats["by_type"][t] = stats["by_type"].get(t, 0) + 1
            s = e.get("severity", "none")
            if s:
                stats["by_severity"][s] = stats["by_severity"].get(s, 0) + 1
            p = e.get("project", "default")
            stats["by_project"][p] = stats["by_project"].get(p, 0) + 1
        return stats

    def get_timeline(self, days: int = 7) -> List[Dict]:
        """Get entries from the last N days."""
        from datetime import timedelta
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        return [e for e in self.entries if e.get("created_at", "") >= cutoff]

    def export_memory(self, format: str = "json") -> str:
        """Export entire memory as JSON or Markdown."""
        if format == "json":
            return json.dumps({"entries": self.entries, "stats": self.get_stats()}, indent=2)

        # Markdown export
        lines = ["# DevStudio AI — Memory Export\n"]
        lines.append(f"**Total entries:** {len(self.entries)}\n")
        lines.append(f"**Exported:** {datetime.now().isoformat()}\n\n---\n")

        for entry in reversed(self.entries):
            lines.append(f"## {entry.get('title', 'Untitled')}\n")
            lines.append(f"- **Type:** {entry.get('type')}")
            lines.append(f"- **Project:** {entry.get('project')}")
            if entry.get("severity"):
                lines.append(f"- **Severity:** {entry['severity']}")
            lines.append(f"- **Date:** {entry.get('created_at', 'unknown')}")
            lines.append(f"\n{entry.get('summary', '')}\n")
            if entry.get("content"):
                lines.append(f"```\n{entry['content'][:500]}\n```\n")
            lines.append("---\n")

        return "\n".join(lines)

    def _compress(self):
        """Summarize old entries to stay under max_entries."""
        # Keep newest 70%, summarize oldest 30%
        keep = int(self.max_entries * 0.7)
        summarize = self.entries[:len(self.entries) - keep]

        # Create a summary entry
        if summarize:
            summary = {
                "id": hashlib.md5(f"compressed_{time.time()}".encode()).hexdigest()[:12],
                "type": "compressed_summary",
                "title": f"📦 Compressed {len(summarize)} older entries",
                "content": f"Summarized {len(summarize)} entries from {summarize[0].get('created_at', '?')} to {summarize[-1].get('created_at', '?')}",
                "summary": f"Compressed batch of {len(summarize)} entries",
                "tags": ["compressed", "summary"],
                "project": "system",
                "severity": "",
                "metadata": {"original_count": len(summarize)},
                "created_at": datetime.now().isoformat(),
            }
            self.entries = [summary] + self.entries[-keep:]
