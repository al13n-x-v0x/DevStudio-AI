"""
DevStudio AI — Nemotron AI Engine
Connects to Nebius Token Factory and uses NVIDIA Nemotron models.
Handles all AI operations: reasoning, code analysis, document understanding.
"""
import os, json
from typing import List, Dict, Optional

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class AIEngine:
    """
    AI backbone powered by NVIDIA Nemotron models via Nebius Token Factory.
    Uses three model tiers:
    - Nemotron 3 Ultra: Deep reasoning, analysis, complex tasks
    - Nemotron Super: Balanced performance for code tasks
    - Nemotron Nano: Fast responses for simple operations
    """

    def __init__(self, api_key: str = None, api_base: str = None):
        self.api_key = api_key or os.environ.get("NEBIUS_API_KEY", "")
        self.api_base = api_base or os.environ.get("NEBIUS_API_BASE", "https://staging.api.nebius.ai/v1")

        self.models = {
            "reasoning": os.environ.get("NEBIUS_REASONING_MODEL", "nvidia/nemotron-3-ultra"),
            "fast": os.environ.get("NEBIUS_FAST_MODEL", "nvidia/nemotron-nano-12b-2-v1"),
            "code": os.environ.get("NEBIUS_CODE_MODEL", "nvidia/nemotron-super-49b-v1"),
        }

        self.client = None
        if OpenAI and self.api_key:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.api_base,
            )

    def _call(self, model_key: str, messages: List[Dict], temperature: float = 0.3,
              max_tokens: int = 4096, json_mode: bool = False) -> str:
        """Call a Nemotron model via Nebius Token Factory."""
        model_name = self.models.get(model_key, self.models["fast"])

        if not self.client:
            return self._fallback_response(model_key, messages)

        try:
            kwargs = {
                "model": model_name,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            return f"[AI Engine Error: {str(e)}]"

    def _fallback_response(self, model_key: str, messages: List[Dict]) -> str:
        """Fallback when API is not configured — provides useful local responses."""
        last_msg = messages[-1].get("content", "") if messages else ""

        if model_key == "reasoning":
            return f"[Nebius API not configured] To enable AI reasoning, set NEBIUS_API_KEY. The local engine can still scan code and index documents without the API."
        elif model_key == "code":
            return f"[Nebius API not configured] Set NEBIUS_API_KEY for AI-powered code analysis. Local pattern-based scanning is available."
        else:
            return f"[Nebius API not configured] Set NEBIUS_API_KEY for full AI capabilities."

    # ─── Document Understanding (DocMind) ────────────────────────────

    def analyze_document(self, filename: str, content: str, doc_type: str = "auto") -> Dict:
        """Analyze and summarize a document using Nemotron."""
        messages = [
            {"role": "system", "content": """You are a document analysis expert. Analyze the provided document and return a JSON object with:
{
  "title": "descriptive title",
  "summary": "2-3 sentence summary",
  "key_topics": ["topic1", "topic2"],
  "code_languages": ["python", "javascript"],
  "technical_level": "beginner|intermediate|advanced",
  "key_concepts": [{"concept": "...", "explanation": "..."}],
  "actionable_items": ["item1", "item2"],
  "related_security_topics": ["topic1"]
}"""},
            {"role": "user", "content": f"Analyze this document ({filename}):\n\n{content[:6000]}"}
        ]

        try:
            raw = self._call("reasoning", messages, temperature=0.3, json_mode=True)
            return json.loads(raw)
        except (json.JSONDecodeError, Exception):
            # Fallback: basic analysis
            lines = content.split("\n")
            return {
                "title": filename,
                "summary": f"Document with {len(lines)} lines covering technical content.",
                "key_topics": [],
                "code_languages": [],
                "technical_level": "intermediate",
                "key_concepts": [],
                "actionable_items": [],
                "related_security_topics": []
            }

    def generate_tags(self, content: str) -> List[str]:
        """Generate relevant tags for content using AI."""
        messages = [
            {"role": "system", "content": "Generate 3-8 relevant tags for the following content. Return as JSON: {\"tags\": [\"tag1\", \"tag2\"]}. Tags should be lowercase, relevant, and specific."},
            {"role": "user", "content": content[:2000]}
        ]

        try:
            raw = self._call("fast", messages, temperature=0.5, max_tokens=200, json_mode=True)
            data = json.loads(raw)
            return data.get("tags", [])
        except Exception:
            return []

    # ─── Security Analysis (SecureAgent) ─────────────────────────────

    def deep_security_analysis(self, code: str, language: str = "auto",
                                findings: List[Dict] = None) -> Dict:
        """Deep AI-powered security analysis of code."""
        findings_text = ""
        if findings:
            findings_text = "\n\nKnown vulnerabilities from pattern scanning:\n"
            for f in findings:
                findings_text += f"- [{f.get('severity')}] {f.get('type')}: Line {f.get('line')}: {f.get('match')}\n"

        messages = [
            {"role": "system", "content": """You are an elite security auditor. Analyze the code and provide a comprehensive security report as JSON:
{
  "security_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "executive_summary": "2-3 sentence overview",
  "findings": [
    {
      "type": "vulnerability type",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "line": line_number,
      "description": "what's wrong",
      "impact": "what an attacker could do",
      "fix": "exact code fix",
      "cwe": "CWE-XXX",
      "owasp": "A0X:2021"
    }
  ],
  "architecture_issues": ["issue1"],
  "best_practices_violations": ["violation1"],
  "overall_recommendations": ["rec1", "rec2"]
}

Focus on real vulnerabilities, not style issues. Be specific with line numbers and fixes."""},
            {"role": "user", "content": f"Language: {language}\n\n{findings_text}\n\nCode to analyze:\n```\n{code[:8000]}\n```"}
        ]

        try:
            raw = self._call("reasoning", messages, temperature=0.2, json_mode=True)
            return json.loads(raw)
        except Exception:
            return {
                "security_score": 50,
                "risk_level": "unknown",
                "executive_summary": "AI analysis requires Nebius API key configuration.",
                "findings": findings or [],
                "architecture_issues": [],
                "best_practices_violations": [],
                "overall_recommendations": ["Set NEBIUS_API_KEY for deep AI analysis"]
            }

    def generate_fix(self, code: str, vulnerability: str, context: str = "") -> str:
        """Generate a fix for a specific vulnerability."""
        messages = [
            {"role": "system", "content": "Generate a secure code fix. Return ONLY the fixed code, no explanation. Match the original language and style."},
            {"role": "user", "content": f"Vulnerability: {vulnerability}\nContext: {context}\n\nOriginal code:\n{code}"}
        ]

        return self._call("code", messages, temperature=0.2, max_tokens=1000)

    def explain_vulnerability(self, vuln_type: str, code: str, language: str = "python") -> str:
        """Explain a vulnerability in simple terms."""
        messages = [
            {"role": "system", "content": "Explain this security vulnerability in clear, educational terms. Include: what it is, why it's dangerous, how attackers exploit it, and how to prevent it. Keep it concise but thorough."},
            {"role": "user", "content": f"Vulnerability: {vuln_type}\nLanguage: {language}\n\nCode:\n{code[:2000]}"}
        ]

        return self._call("fast", messages, temperature=0.5, max_tokens=1500)

    # ─── Conversational AI (DevBuddy) ────────────────────────────────

    def chat(self, question: str, context: str = "", memory_context: str = "") -> str:
        """Conversational AI with memory context."""
        system_prompt = """You are DevStudio AI — a developer's personal security and research assistant.
You help with:
- Security vulnerability analysis and fixes
- Code review and best practices
- Document understanding and summarization
- Answering technical questions
- Managing research and security findings

Be concise, technical, and helpful. When referencing memory entries, mention them specifically."""

        if memory_context:
            system_prompt += f"\n\nRelevant entries from your memory:\n{memory_context}"

        if context:
            system_prompt += f"\n\nAdditional context:\n{context}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]

        return self._call("reasoning", messages, temperature=0.5, max_tokens=2048)

    def generate_skill(self, description: str) -> Dict:
        """Generate a reusable skill from description."""
        messages = [
            {"role": "system", "content": """Generate a reusable skill as JSON:
{
  "name": "skill name",
  "description": "what it does",
  "code": "the actual code",
  "language": "python|javascript|bash",
  "usage_example": "example of using it",
  "tags": ["tag1", "tag2"]
}"""},
            {"role": "user", "content": f"Create a skill: {description}"}
        ]

        try:
            raw = self._call("code", messages, temperature=0.3, json_mode=True)
            return json.loads(raw)
        except Exception:
            return {
                "name": "custom_skill",
                "description": description,
                "code": f"# {description}\nprint('Implement this skill')",
                "language": "python",
                "usage_example": "Run this script",
                "tags": ["custom"]
            }

    def summarize_findings(self, findings: List[Dict]) -> str:
        """Generate a natural language summary of security findings."""
        if not findings:
            return "No vulnerabilities found. Your code looks secure! ✅"

        findings_text = json.dumps(findings[:20], indent=2)
        messages = [
            {"role": "system", "content": "Summarize these security findings in 2-3 sentences. Be specific about the most critical issues and give actionable advice."},
            {"role": "user", "content": findings_text}
        ]

        return self._call("fast", messages, temperature=0.5, max_tokens=500)

    # ─── Tavily Web Search ─────────────────────────────────────────────

    def web_search(self, query: str, max_results: int = 5, search_depth: str = "basic") -> Dict:
        """Search the web using Tavily API for real-time information."""
        tavily_key = os.environ.get("TAVILY_API_KEY", "")

        if not tavily_key:
            return {
                "results": [],
                "answer": "Tavily API not configured. Set TAVILY_API_KEY for web search.",
                "success": False,
            }

        try:
            import requests
            response = requests.post(
                "https://api.tavily.com/search",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {tavily_key}",
                },
                json={
                    "query": query,
                    "max_results": max_results,
                    "search_depth": search_depth,
                    "include_answer": True,
                    "include_raw_content": False,
                },
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()

            return {
                "results": [
                    {
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "content": r.get("content", ""),
                        "score": r.get("score", 0),
                    }
                    for r in data.get("results", [])
                ],
                "answer": data.get("answer", ""),
                "query": query,
                "success": True,
            }
        except Exception as e:
            return {
                "results": [],
                "answer": f"Search error: {str(e)}",
                "success": False,
            }

    def search_and_answer(self, question: str) -> str:
        """Search the web and generate an AI answer using Nemotron + Tavily."""
        # Step 1: Search
        search_data = self.web_search(question, max_results=3)

        if not search_data["success"]:
            return search_data["answer"]

        # Step 2: Synthesize with Nemotron
        context = "\n".join([
            f"Source: {r['title']}\n{r['content']}"
            for r in search_data["results"][:3]
        ])

        messages = [
            {"role": "system", "content": "You are a helpful assistant. Answer the question using the provided web search results. Be concise and cite your sources. If the search results don't contain enough info, say so."},
            {"role": "user", "content": f"Question: {question}\n\nSearch results:\n{context}\n\nAnswer:"}
        ]

        answer = self._call("reasoning", messages, temperature=0.3, max_tokens=1000)

        # Add source links
        sources = "\n".join([f"• {r['title']}: {r['url']}" for r in search_data["results"][:3]])
        if sources:
            answer += f"\n\nSources:\n{sources}"

        return answer
