"""
SecureAgent Layer — Automated Security Auditor
Scans code for vulnerabilities, checks coding styles, generates reports.
Uses pattern matching + Nemotron AI for deep analysis.
"""
import os, re, json
from typing import List, Dict, Optional


# ─── 50+ Vulnerability Patterns ──────────────────────────────────────
VULN_PATTERNS = {
    "SQL Injection": {
        "patterns": [r"execute\s*\(.*\+\s*", r"query\s*\(.*%s", r"cursor\.execute\s*\(.+format", r"\.raw\s*\(.*\+", r"\.execute\s*\(f['\"]"],
        "severity": "CRITICAL", "owasp": "A03:2021", "cwe": "CWE-89",
        "fix": 'cursor.execute("SELECT * FROM users WHERE name = ?", (username,))',
        "desc": "Unparameterized SQL allows attackers to inject malicious queries.",
        "category": "injection"
    },
    "XSS (Cross-Site Scripting)": {
        "patterns": [r"innerHTML\s*=", r"document\.write\s*\(", r"dangerouslySetInnerHTML", r"\.html\s*\(.*req\."],
        "severity": "HIGH", "owasp": "A03:2021", "cwe": "CWE-79",
        "fix": "element.textContent = userInput; // or DOMPurify.sanitize()",
        "desc": "Unescaped user input rendered in HTML enables script injection.",
        "category": "injection"
    },
    "Hardcoded Credentials": {
        "patterns": [r'password\s*=\s*["\'][^"\']+["\']', r'api_key\s*=\s*["\'][^"\']+["\']', r'secret\s*=\s*["\'][^"\']+["\']', r'token\s*=\s*["\']sk-'],
        "severity": "CRITICAL", "owasp": "A07:2021", "cwe": "CWE-798",
        "fix": 'os.environ.get("DB_PASSWORD")  # or use a vault',
        "desc": "Secrets in source code are exposed via version control.",
        "category": "auth"
    },
    "Weak Cryptography": {
        "patterns": [r"md5\(", r"sha1\(", r"DES\.", r"RC4", r"MD5\(", r"blowfish"],
        "severity": "HIGH", "owasp": "A02:2021", "cwe": "CWE-327",
        "fix": "bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))",
        "desc": "Deprecated algorithms are easily broken with modern hardware.",
        "category": "crypto"
    },
    "Command Injection": {
        "patterns": [r"os\.system\s*\(", r"subprocess\.call\s*\(.*shell\s*=\s*True", r"subprocess\.Popen\s*\(.*shell", r"eval\s*\(.*input"],
        "severity": "CRITICAL", "owasp": "A03:2021", "cwe": "CWE-78",
        "fix": 'subprocess.run(["cat", filename], capture_output=True)',
        "desc": "OS commands built from user input allow arbitrary execution.",
        "category": "injection"
    },
    "Path Traversal": {
        "patterns": [r"open\s*\(.*\.\.\/", r"os\.path\.join\s*\(.*\.\.", r"Path\s*\(.*\.\.", r"readFile\s*\(.*\.\."],
        "severity": "HIGH", "owasp": "A01:2021", "cwe": "CWE-22",
        "fix": "os.path.realpath(path).startswith(expected_base)",
        "desc": "../ sequences escape the intended directory.",
        "category": "access"
    },
    "Buffer Overflow Risk": {
        "patterns": [r"strcpy\s*\(", r"gets\s*\(", r"sprintf\s*\(", r"scanf\s*\(", r"strcat\s*\("],
        "severity": "CRITICAL", "owasp": "A06:2021", "cwe": "CWE-120",
        "fix": "strncpy(buffer, input, sizeof(buffer) - 1);",
        "desc": "Unbounded writes corrupt adjacent memory.",
        "category": "memory"
    },
    "Insecure Deserialization": {
        "patterns": [r"pickle\.loads?\s*\(", r"yaml\.load\s*\((?!.*Loader)", r"marshal\.loads?\s*\(", r"jsonpickle", r"shelve\.open"],
        "severity": "HIGH", "owasp": "A08:2021", "cwe": "CWE-502",
        "fix": "yaml.safe_load(data)  # or json.loads()",
        "desc": "Untrusted deserialization executes arbitrary code.",
        "category": "integrity"
    },
    "Race Condition": {
        "patterns": [r"global\s+\w+.*\n.*\w+\s*=\s*\w+\s*\+", r"thread\.start.*shared", r"nonlocal\s+\w+"],
        "severity": "MEDIUM", "owasp": "A04:2021", "cwe": "CWE-362",
        "fix": "with lock: balance -= amount  # use threading.Lock()",
        "desc": "Concurrent access to shared state without synchronization.",
        "category": "design"
    },
    "SSRF": {
        "patterns": [r"requests\.get\s*\(.*request\.", r"urllib\.request\.urlopen\s*\(.*input", r"fetch\s*\(.*req\."],
        "severity": "HIGH", "owasp": "A10:2021", "cwe": "CWE-918",
        "fix": "validate_url(url)  # check against allowlist",
        "desc": "Server-side requests to attacker-controlled URLs.",
        "category": "ssrf"
    },
    "XXE Injection": {
        "patterns": [r"xml\.etree\.ElementTree\.parse", r"lxml\.etree\.parse", r"xml\.sax\.parse", r"xml\.dom\.minidom"],
        "severity": "HIGH", "owasp": "A05:2021", "cwe": "CWE-611",
        "fix": "defusedxml.ElementTree.parse()",
        "desc": "XML parsers may expose internal files or SSRF.",
        "category": "injection"
    },
    "Open Redirect": {
        "patterns": [r"redirect\s*\(.*request\.", r"Location:\s*.*request\.", r"window\.location\s*=.*req\."],
        "severity": "MEDIUM", "owasp": "A01:2021", "cwe": "CWE-601",
        "fix": "if url in ALLOWED_REDIRECTS: redirect(url)",
        "desc": "User redirected to malicious external site.",
        "category": "access"
    },
    "Debug Mode Enabled": {
        "patterns": [r"DEBUG\s*=\s*True", r"debug\s*=\s*True", r"app\.run\(.*debug"],
        "severity": "MEDIUM", "owasp": "A05:2021", "cwe": "CWE-489",
        "fix": "DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'",
        "desc": "Debug mode exposes stack traces and internals.",
        "category": "config"
    },
    "Eval/Exec Usage": {
        "patterns": [r"\beval\s*\(", r"\bexec\s*\(", r"compile\s*\(.*exec", r"__import__\s*\("],
        "severity": "CRITICAL", "owasp": "A03:2021", "cwe": "CWE-95",
        "fix": "Use ast.literal_eval() for safe evaluation",
        "desc": "eval/exec execute arbitrary code strings.",
        "category": "injection"
    },
    "CORS Misconfiguration": {
        "patterns": [r"Access-Control-Allow-Origin.*\*", r"cors\(.*origins.*\*", r"allow_origins\s*=\s*\[.*\*"],
        "severity": "MEDIUM", "owasp": "A05:2021", "cwe": "CWE-942",
        "fix": "allow_origins=['https://yourdomain.com']",
        "desc": "Wildcard CORS allows any origin to access resources.",
        "category": "config"
    },
    "Insufficient Logging": {
        "patterns": [r"except.*pass", r"except.*:\s*$", r"catch\s*\(\s*\w*\s*\)\s*\{\s*\}"],
        "severity": "LOW", "owasp": "A09:2021", "cwe": "CWE-778",
        "fix": "logger.error(f'Auth failed: {e}', exc_info=True)",
        "desc": "Silent failures prevent security incident detection.",
        "category": "logging"
    },
    "Timing Attack": {
        "patterns": [r"==\s*hash", r"if\s+\w+\s*==\s*token", r"==\s*password"],
        "severity": "MEDIUM", "owasp": "A02:2021", "cwe": "CWE-208",
        "fix": "hmac.compare_digest(a, b)  # constant-time comparison",
        "desc": "Non-constant-time comparisons leak timing information.",
        "category": "crypto"
    },
    "Missing HTTPS": {
        "patterns": [r"http://(?!localhost|127\.0\.0\.1)", r"verify\s*=\s*False", r"ssl\._create_unverified"],
        "severity": "HIGH", "owasp": "A02:2021", "cwe": "CWE-319",
        "fix": "Use https:// and enable certificate verification",
        "desc": "Unencrypted connections expose data in transit.",
        "category": "crypto"
    },
    "Insecure Random": {
        "patterns": [r"random\.randint\(", r"random\.choice\(", r"random\.random\(\)"],
        "severity": "MEDIUM", "owasp": "A02:2021", "cwe": "CWE-330",
        "fix": "secrets.randbelow(n)  # cryptographic randomness",
        "desc": "PRNG output is predictable for security-critical operations.",
        "category": "crypto"
    },
    "Weak Password Hash": {
        "patterns": [r"hashlib\.md5\s*\(", r"hashlib\.sha1\s*\(", r"base64\.b64encode\s*\(.*password"],
        "severity": "CRITICAL", "owasp": "A02:2021", "cwe": "CWE-916",
        "fix": "bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))",
        "desc": "Fast hash algorithms allow brute-force password cracking.",
        "category": "crypto"
    },
    "Prototype Pollution (JS)": {
        "patterns": [r"__proto__", r"constructor\[", r"Object\.assign\s*\(.*req\."],
        "severity": "HIGH", "owasp": "A03:2021", "cwe": "CWE-1321",
        "fix": "Use Object.create(null) or validate keys",
        "desc": "Prototype pollution allows property injection in JavaScript.",
        "category": "injection"
    },
    "NoSQL Injection": {
        "patterns": [r"\$where", r"\$gt", r"\$ne", r"\$regex", r"\$exists"],
        "severity": "HIGH", "owasp": "A03:2021", "cwe": "CWE-943",
        "fix": "Sanitize input and use parameterized queries",
        "desc": "NoSQL operators in user input alter query logic.",
        "category": "injection"
    },
    "JWT None Algorithm": {
        "patterns": [r"algorithm.*none", r"'none'\s*\]", r"verify.*false.*jwt"],
        "severity": "CRITICAL", "owasp": "A02:2021", "cwe": "CWE-327",
        "fix": "Always specify allowed algorithms: algorithms=['HS256']",
        "desc": "JWT with none algorithm bypasses signature verification.",
        "category": "auth"
    },
    "Unsafe YAML Loading": {
        "patterns": [r"yaml\.load\s*\((?!.*Loader)", r"yaml\.unsafe_load"],
        "severity": "HIGH", "owasp": "A08:2021", "cwe": "CWE-502",
        "fix": "yaml.safe_load(data)",
        "desc": "Unsafe YAML deserialization executes embedded Python code.",
        "category": "integrity"
    },
    "Memory Leak (C/C++)": {
        "patterns": [r"malloc\s*\(", r"new\s+\w+\[", r"realloc\s*\("],
        "severity": "MEDIUM", "owasp": "A06:2021", "cwe": "CWE-401",
        "fix": "Ensure every malloc has a corresponding free()",
        "desc": "Unreleased heap memory grows over time.",
        "category": "memory"
    },
    "Use After Free": {
        "patterns": [r"free\s*\(.*\);\s*\n.*\w", r"delete\s+.*;\s*\n.*ptr"],
        "severity": "CRITICAL", "owasp": "A06:2021", "cwe": "CWE-416",
        "fix": "Set pointer to NULL after free",
        "desc": "Accessing freed memory leads to crashes or exploitation.",
        "category": "memory"
    },
}

# ─── Style Rules ──────────────────────────────────────────────────────
STYLE_RULES = {
    "max_line_length": {"severity": "LOW", "desc": "Line exceeds recommended length"},
    "trailing_whitespace": {"severity": "LOW", "desc": "Trailing whitespace detected"},
    "missing_docstring": {"severity": "LOW", "desc": "Public function missing docstring"},
    "bare_except": {"severity": "MEDIUM", "desc": "Bare except clause catches all exceptions"},
    "magic_number": {"severity": "LOW", "desc": "Magic number should be a named constant"},
    "too_many_args": {"severity": "LOW", "desc": "Function has too many parameters"},
    "unused_import": {"severity": "LOW", "desc": "Imported module appears unused"},
    "global_variable": {"severity": "MEDIUM", "desc": "Global variable usage detected"},
}


class SecureAgent:
    """
    Automated security auditor. Combines pattern-based scanning
    with AI-powered deep analysis.
    """

    def __init__(self, memory_engine=None, ai_engine=None):
        self.memory = memory_engine
        self.ai = ai_engine

    def scan_code(self, code: str, filename: str = "input", language: str = "auto",
                  include_style: bool = True) -> Dict:
        """
        Full security scan pipeline:
        1. Pattern-based vulnerability detection
        2. Style checking
        3. AI deep analysis (if available)
        4. Store results in memory
        """
        # 1. Pattern scan
        vuln_findings = self._pattern_scan(code, filename)

        # 2. Style check
        style_findings = self._style_check(code, filename) if include_style else []

        # 3. AI analysis (if configured)
        ai_analysis = {}
        if self.ai and self.ai.client:
            try:
                ai_analysis = self.ai.deep_security_analysis(code, language, vuln_findings)
                # Merge AI findings with pattern findings
                if ai_analysis.get("findings"):
                    for af in ai_analysis["findings"]:
                        # Avoid duplicates
                        is_dup = any(
                            f["type"] == af.get("type", "") and f["line"] == af.get("line", 0)
                            for f in vuln_findings
                        )
                        if not is_dup:
                            af["source"] = "ai"
                            vuln_findings.append(af)
            except Exception:
                pass

        # Calculate score
        score = self._calculate_score(vuln_findings, style_findings)

        # Merge all findings
        all_findings = vuln_findings + style_findings
        all_findings.sort(key=lambda f: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(f.get("severity", ""), 4))

        # 4. Store in memory
        if self.memory:
            self.memory.add_scan_result(
                filename=filename,
                findings=all_findings,
                score=score
            )

        return {
            "filename": filename,
            "language": language,
            "score": score,
            "vulnerability_count": len(vuln_findings),
            "style_issues": len(style_findings),
            "total_findings": len(all_findings),
            "findings": all_findings,
            "ai_analysis": ai_analysis,
            "summary": self._generate_summary(all_findings, score),
        }

    def _pattern_scan(self, code: str, filename: str) -> List[Dict]:
        """Scan code against known vulnerability patterns."""
        findings = []
        seen = set()

        for vuln_name, vuln_data in VULN_PATTERNS.items():
            for pattern in vuln_data["patterns"]:
                for m in re.finditer(pattern, code, re.MULTILINE | re.IGNORECASE):
                    line_num = code[: m.start()].count("\n") + 1
                    key = (vuln_name, line_num)
                    if key not in seen:
                        seen.add(key)
                        findings.append({
                            "type": vuln_name,
                            "severity": vuln_data["severity"],
                            "owasp": vuln_data.get("owasp", ""),
                            "cwe": vuln_data.get("cwe", ""),
                            "line": line_num,
                            "match": m.group()[:120],
                            "explanation": vuln_data["desc"],
                            "fix": vuln_data["fix"],
                            "category": vuln_data.get("category", "other"),
                            "source": "pattern",
                        })

        findings.sort(key=lambda f: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(f["severity"], 4))
        return findings

    def _style_check(self, code: str, filename: str) -> List[Dict]:
        """Check code style and best practices."""
        findings = []
        lines = code.split("\n")
        in_function = False
        func_name = ""

        for i, line in enumerate(lines):
            line_num = i + 1
            stripped = line.strip()

            # Max line length
            if len(line) > 120:
                findings.append({
                    "type": "Style: Long Line",
                    "severity": "LOW",
                    "line": line_num,
                    "match": f"Line length: {len(line)} chars",
                    "explanation": STYLE_RULES["max_line_length"]["desc"],
                    "fix": f"Break line into multiple lines (max 120 chars)",
                    "category": "style",
                    "source": "style",
                })

            # Trailing whitespace
            if line != line.rstrip() and line.strip():
                findings.append({
                    "type": "Style: Trailing Whitespace",
                    "severity": "LOW",
                    "line": line_num,
                    "match": line[-20:] + "...",
                    "explanation": STYLE_RULES["trailing_whitespace"]["desc"],
                    "fix": "Remove trailing whitespace",
                    "category": "style",
                    "source": "style",
                })

            # Bare except
            if re.match(r"except\s*:", stripped):
                findings.append({
                    "type": "Style: Bare Except",
                    "severity": "MEDIUM",
                    "line": line_num,
                    "match": stripped,
                    "explanation": STYLE_RULES["bare_except"]["desc"],
                    "fix": "Use 'except Exception as e:' or catch specific exceptions",
                    "category": "style",
                    "source": "style",
                })

            # Python: track functions for docstring check
            if re.match(r"(def|class)\s+\w+", stripped):
                in_function = True
                func_name = stripped

        return findings

    def _calculate_score(self, vuln_findings: List[Dict], style_findings: List[Dict]) -> int:
        """Calculate a security score (0-100)."""
        score = 100
        weights = {"CRITICAL": 15, "HIGH": 10, "MEDIUM": 5, "LOW": 2}

        for f in vuln_findings:
            score -= weights.get(f.get("severity", ""), 2)

        for f in style_findings:
            score -= 1

        return max(0, min(100, score))

    def _generate_summary(self, findings: List[Dict], score: int) -> str:
        """Generate a human-readable summary."""
        if not findings:
            return "✅ No vulnerabilities or style issues detected. Your code looks secure!"

        crit = sum(1 for f in findings if f.get("severity") == "CRITICAL")
        high = sum(1 for f in findings if f.get("severity") == "HIGH")
        med = sum(1 for f in findings if f.get("severity") == "MEDIUM")
        low = sum(1 for f in findings if f.get("severity") == "LOW")

        parts = []
        if crit: parts.append(f"{crit} critical")
        if high: parts.append(f"{high} high")
        if med: parts.append(f"{med} medium")
        if low: parts.append(f"{low} low")

        severity_text = ", ".join(parts)
        risk = "critical risk" if crit else "high risk" if high else "moderate risk" if med else "low risk"

        return f"Found {len(findings)} issues ({severity_text}). Security score: {score}/100 — {risk}."

    def get_vulnerability_info(self, vuln_type: str) -> Optional[Dict]:
        """Get detailed info about a vulnerability type."""
        return VULN_PATTERNS.get(vuln_type)

    def get_all_patterns(self) -> List[str]:
        """List all supported vulnerability patterns."""
        return list(VULN_PATTERNS.keys())
