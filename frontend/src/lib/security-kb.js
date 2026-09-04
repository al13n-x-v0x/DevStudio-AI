// DevStudio AI — Local Security Knowledge Base
// 50+ topics with detailed answers, code examples, and personality
// Used when backend Nemotron/Tavily is unavailable

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
  "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?'",
  "There are 10 types of people: those who understand binary and those who don't.",
  "Why did the developer go broke? Because he used up all his cache. 💸",
  "I told my computer I needed a break. Now it won't stop sending me vacation ads.",
  "What's a programmer's favorite hangout place? Foo Bar. 🍺",
  "Why do Java developers wear glasses? Because they can't C#. 👓",
  "How many programmers does it take to change a light bulb? None — that's a hardware problem.",
  "A XSS and an SQL injection walk into a bar. The bartender says 'We don't serve your kind here.' They say 'We're already inside.' 😈",
  "Debugging is like being a detective in a crime movie where you're also the murderer.",
  "I don't have a life... I have a codebase.",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
  "What's the object-oriented way to become wealthy? Inheritance.",
]

const QUIPS = {
  greeting: [
    "Hey! I know 50+ ways your code can betray you. Let's find them. 🔍",
    "Welcome back. My dot-particle body has been eager to scan some code.",
    "Yo! Paste some code or ask me anything security-related. I'm basically free consulting.",
    "Hello, human. I've been rehearsing my vulnerability detection dance. 💃",
    "Hey there! Fun fact: I'm made of ~200 animated dots. Look at my avatar closely.",
  ],
  thinking: [
    "Hmm, let me consult my neural... I mean, my lookup tables.",
    "Processing... my dots are vibrating with anticipation.",
    "One moment, running this through my impressive local database of knowledge.",
  ],
  confused: [
    "Hmm, I'm not sure about that one. Try asking about: SQL injection, XSS, CSRF, authentication, encryption, Docker security, or any OWASP topic!",
    "That's outside my wheelhouse. I'm strongest on web security, crypto, auth, and DevOps. Try one of those!",
    "My local brain doesn't cover that. But hey — I can scan code, decode JWTs, generate hashes, and talk about 50+ security topics!",
  ],
}

// Each entry: [regex_pattern, response]
const KB = [
  // ─── OWASP Top 10 ──────────────────────────────────────────────────
  [
    /sql\s*inject/i,
    `**SQL Injection (OWASP A03:2021)** — User input is concatenated directly into SQL queries, letting attackers manipulate the database.

**The Problem:**
\`\`\`python
# DANGEROUS — never do this
query = f"SELECT * FROM users WHERE name='{user_input}'"
cursor.execute(query)
\`\`\`
Attack input: \`' OR '1'='1' --\` → dumps entire table.

**The Fix — Parameterized Queries:**
\`\`\`python
# SAFE — database treats params as data, not code
cursor.execute("SELECT * FROM users WHERE name=?", (user_input,))
\`\`\`

**Other defenses:**
- Use ORM (SQLAlchemy, Sequelize, Prisma)
- Least-privilege DB users (app user ≠ admin)
- Input validation + allowlists
- WAF rules for common SQLi patterns
- **CWE-89** | **OWASP A03:2021**
`
  ],

  [
    /xss|cross[\s-]site\s*script/i,
    `**Cross-Site Scripting (OWASP A03:2021)** — Attacker injects malicious JavaScript that runs in victims' browsers.

**Three types:**
1. **Reflected** — URL parameter echoed in page: \`<script>steal(document.cookie)</script>\`
2. **Stored** — Malicious comment saved in DB, shown to all users
3. **DOM-based** — Client-side JS reads attacker-controlled data into innerHTML

**The Fix:**
\`\`\`javascript
// DANGEROUS
element.innerHTML = userInput

// SAFE — textContent escapes HTML
element.textContent = userInput

// If you MUST render HTML:
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
\`\`\`

**Defense in depth:**
- Content-Security-Policy header: \`default-src 'self'; script-src 'self'\`
- X-Content-Type-Options: nosniff
- HttpOnly cookies (no JS access)
- **CWE-79** | **OWASP A03:2021**
`
  ],

  [
    /csrf|cross[\s-]site\s*request/i,
    `**CSRF (OWASP A01:2021)** — Attacker tricks logged-in user into making unintended requests.

**Attack scenario:**
\`\`\`html
<!-- Attacker's site -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
<!-- Browser sends cookies automatically! -->
\`\`\`

**The Fix:**
\`\`\`python
# Flask — CSRF token
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)
\`\`\`
\`\`\`javascript
// React — include token in headers
fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': getCsrfToken() },
  body: JSON.stringify({ to, amount })
})
\`\`\`

**Also:**
- SameSite cookie attribute (Lax or Strict)
- Check Origin/Referer headers
- Require re-auth for sensitive actions
- **CWE-352** | **OWASP A01:2021**
`
  ],

  // ─── Authentication & Authorization ─────────────────────────────────
  [
    /jwt|json\s*web\s*token/i,
    `**JWT Security** — JSON Web Tokens are stateless auth tokens. Secure usage requires careful configuration.

**Common mistakes:**
\`\`\`javascript
// DANGEROUS — alg: none accepted
// DANGEROUS — stored in localStorage (XSS steals it)
// DANGEROUS — no expiry
\`\`\`

**Secure JWT setup:**
\`\`\`javascript
// Generate
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,    // 256-bit minimum
  { expiresIn: '15m',        // Short-lived!
    algorithm: 'HS256' }     // Explicit algorithm
)

// Verify
jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
\`\`\`

**Best practices:**
- Store in httpOnly, Secure, SameSite cookies (NOT localStorage)
- Short expiry (5-15 min) + refresh tokens
- Never accept \`alg: none\`
- Use asymmetric keys (RS256) for microservices
- Include \`iat\`, \`nbf\`, \`aud\` claims
- **CWE-347** | **OWASP A02:2021**
`
  ],

  [
    /auth(?:entication|orization)?|login|session|cookie/i,
    `**Authentication & Session Security** — Who are you, and what can you do?

**Secure password hashing (Node.js):**
\`\`\`javascript
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 12

// Hash
const hash = await bcrypt.hash(password, SALT_ROUNDS)

// Verify
const match = await bcrypt.compare(password, storedHash)
\`\`\`

**Secure session config:**
\`\`\`javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,     // No JS access
    secure: true,       // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000     // 1 hour
  }
}))
\`\`\`

**Checklist:**
- Never store passwords in plain text
- Enforce strong password policy
- Rate limit login attempts (5/15min)
- Implement account lockout
- Multi-factor authentication (TOTP)
- **CWE-798** | **OWASP A07:2021**
`
  ],

  [
    /oauth|sso|saml/i,
    `**OAuth / SSO Security** — Federated authentication done right.

**OAuth 2.0 best practices:**
- Always use Authorization Code flow (not Implicit)
- Validate state parameter (CSRF protection)
- Use PKCE for mobile/SPA apps
- Validate id_token audience and issuer

\`\`\`javascript
// PKCE flow
const codeVerifier = generateRandom(128)
const codeChallenge = await sha256(codeVerifier)

// Authorization request
/auth?response_type=code&code_challenge=\${codeChallenge}&code_challenge_method=S256

// Token exchange
/token?grant_type=authorization_code&code_verifier=\${codeVerifier}
\`\`\`

**Common attacks:**
- Open redirect → token theft
- Token confusion (RS256 vs HS256)
- Session fixation after SSO
- **CWE-601** | **OWASP A07:2021**
`
  ],

  [
    /password|passwd|pwd|bcrypt|argon|hash/i,
    `**Password Security** — How to store and handle passwords properly.

**Never use:**
- MD5, SHA1, SHA256 alone (too fast — brute force in seconds)
- Custom hashing algorithms
- Same salt for all users
- Plaintext storage (obviously)

**Always use:**
\`\`\`python
# Python — bcrypt
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
verified = bcrypt.checkpw(password.encode(), hashed)
\`\`\`
\`\`\`python
# Python — argon2 (even better)
from argon2 import PasswordHasher
ph = PasswordHasher(
    time_cost=3, memory_cost=65536, parallelism=4
)
hashed = ph.hash(password)
\`\`\`
\`\`\`javascript
// Node.js — bcrypt
const bcrypt = require('bcrypt')
const hash = await bcrypt.hash(password, 12)
\`\`\`

**Rules:**
- Minimum 12 characters (allow passphrases)
- Enforce via HaveIBeenPwned API check
- Rate limit login (5 attempts / 15 min)
- Don't reveal whether email exists
- **CWE-916** | **OWASP A07:2021**
`
  ],

  [
    /mfa|2fa|totp|otp|multi.?factor/i,
    `**Multi-Factor Authentication** — Adding layers beyond passwords.

**TOTP Implementation (RFC 6238):**
\`\`\`python
import pyotp

# Generate secret
secret = pyotp.random_base32()
totp = pyotp.TOTP(secret)

# Generate QR code for authenticator apps
uri = totp.provisioning_uri("user@example.com", issuer_name="DevStudio")

# Verify
is_valid = totp.verify(user_code, valid_window=1)  # 30s window
\`\`\`

**Types ranked by security:**
1. Hardware keys (YubiKey) — phishing resistant ✅
2. Passkeys / WebAuthn — passwordless ✅
3. TOTP apps (Google Authenticator, Authy) ✅
4. Push notifications (with number matching) ⚠️
5. SMS codes — SIM swap vulnerable ❌

- **CWE-308** | **OWASP A07:2021**
`
  ],

  // ─── Cryptography ───────────────────────────────────────────────────
  [
    /encrypt|decrypt|cipher|aes|rsa|crypto/i,
    `**Encryption** — Protecting data at rest and in transit.

**AES-256-GCM (symmetric — for data):**
\`\`\`python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
nonce = os.urandom(12)

# Encrypt
aesgcm = AESGCM(key)
ct = aesgcm.encrypt(nonce, plaintext, associated_data)

# Decrypt
pt = aesgcm.decrypt(nonce, ct, associated_data)
\`\`\`

**RSA (asymmetric — for key exchange):**
\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Generate key pair
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

# Encrypt with public key
ct = private_key.public_key().encrypt(
    plaintext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
\`\`\`

**Rules:**
- AES-256-GCM over AES-CBC (authenticated encryption)
- RSA-2048+ (prefer Ed25519 for signing)
- Never roll your own crypto
- **CWE-327** | **OWASP A02:2021**
`
  ],

  [
    /https|ssl|tls|certificate|cert/i,
    `**TLS/SSL** — Encrypting data in transit.

**Modern TLS config (Nginx):**
\`\`\`nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
ssl_stapling on;
ssl_session_timeout 1d;
\`\`\`

**Common misconfigs:**
- TLS 1.0/1.1 still enabled (deprecated!)
- Weak ciphers (RC4, DES, 3DES)
- Self-signed certs in production
- Missing HSTS header

**Must-have headers:**
\`\`\`
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
\`\`\`

**Check your site:** SSL Labs (ssllabs.com) — aim for A+ rating.
- **CWE-295** | **OWASP A02:2021**
`
  ],

  [
    /hash|integrity|sha|md5|hmac/i,
    `**Hashing & Integrity** — Ensuring data hasn't been tampered with.

**Use cases:**
- **Passwords** → bcrypt/argon2 (slow, salted)
- **Data integrity** → SHA-256/SHA-3 (fast, no salt)
- **API signatures** → HMAC-SHA256

\`\`\`javascript
// SHA-256 (data integrity)
const { createHash } = require('crypto')
const hash = createHash('sha256').update(data).digest('hex')

// HMAC-SHA256 (API signing)
const hmac = createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex')

// Verify
const expected = createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex')
const valid = crypto.timingSafeEqual(
  Buffer.from(hmac), Buffer.from(expected)
)
\`\`\`

**Never use MD5 or SHA1 for:**
- Password storage (too fast)
- Digital signatures (collision attacks proven)
- **CWE-328** | **CWE-916**
`
  ],

  // ─── Web Security ───────────────────────────────────────────────────
  [
    /cors|cross[\s-]origin/i,
    `**CORS (Cross-Origin Resource Sharing)** — Controlling who can access your API.

**Secure config:**
\`\`\`javascript
// Express.js
const cors = require('cors')

app.use(cors({
  origin: ['https://devstudio.app', 'https://www.devstudio.app'],
  credentials: true,           // Allow cookies
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400                // Cache preflight for 24h
}))
\`\`\`

**Common mistakes:**
- \`Access-Control-Allow-Origin: *\` with credentials ← blocked by browsers
- Reflecting Origin header blindly (bypasses CORS entirely!)
- Not handling OPTIONS preflight
- Allowing all methods and headers

**Remember:** CORS is enforced by browsers. Server-to-server requests ignore it. Always validate on the server too!
- **CWE-942** | **OWASP A05:2021**
`
  ],

  [
    /header|csp|content.security|security.header/i,
    `**Security Headers** — Your first line of defense.

**Essential headers:**
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-XSS-Protection: 0 (CSP replaces this)
\`\`\`

**Node.js setup:**
\`\`\`javascript
const helmet = require('helmet')
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-abc123'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}))
\`\`\`

**Test:** securityheaders.com — aim for A+ grade.
- **OWASP A05:2021**
`
  ],

  [
    /rate.?limit|throttl|dos|denial|ddos/i,
    `**Rate Limiting & DDoS Protection** — Preventing abuse.

**Express.js with express-rate-limit:**
\`\`\`javascript
const rateLimit = require('express-rate-limit')

// General API
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' }
}))

// Auth endpoints (stricter)
app.use('/api/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                      // 5 attempts per 15 min
  skipSuccessfulRequests: true
}))
\`\`\`

**Algorithms:**
- Token bucket — smooth burst handling
- Sliding window — accurate counting
- Fixed window — simplest, some burst issues

**Beyond rate limiting:**
- CAPTCHA after N failures
- IP reputation checking
- Cloudflare/AWS WAF for DDoS
- **CWE-770** | **OWASP A04:2021**
`
  ],

  [
    /redirect|open.?redirect|url.?redirect/i,
    `**Open Redirect** — Often overlooked, highly exploitable.

**The vulnerability:**
\`\`\`python
# DANGEROUS
@app.route('/redirect')
def redirect_user():
    url = request.args.get('url')
    return redirect(url)  # Attacker: ?url=https://evil.com
\`\`\`

**Attack scenario:**
\`https://yourapp.com/redirect?url=https://evil.com/phishing\`
Victim trusts yourapp.com domain but lands on attacker's page.

**Fix — strict allowlist:**
\`\`\`python
ALLOWED_REDIRECTS = {'/dashboard', '/settings', '/profile'}

@app.route('/redirect')
def redirect_user():
    url = request.args.get('url', '/')
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.netloc or parsed.path not in ALLOWED_REDIRECTS:
        return redirect('/dashboard')  # Safe default
    return redirect(url)
\`\`\`

**Rule:** Never redirect to user-controlled URLs. If you must, validate against an allowlist.
- **CWE-601** | **OWASP A01:2021**
`
  ],

  // ─── Secrets & Configuration ────────────────────────────────────────
  [
    /secret|env|api.?key|token|credential|\.env/i,
    `**Secret Management** — Keeping sensitive data out of code.

**NEVER commit secrets to git:**
\`\`\`bash
# .gitignore
.env
.env.local
.env.production
*.key
*.pem
\`\`\`

**Use environment variables:**
\`\`\`python
import os
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise RuntimeError("Set API_KEY environment variable!")
\`\`\`

**For production:**
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Doppler

**If a secret is already in git:**
1. Rotate the key IMMEDIATELY
2. Scrub from history: \`git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env'\`
3. Enable GitHub secret scanning
4. Add pre-commit hooks: \`pip install pre-commit && pre-commit install\`

**Tools:**
- \`trufflehog\` — scans repos for secrets
- \`gitleaks\` — pre-commit secret detector
- \`git-secrets\` — AWS tool for git hooks
- **CWE-798** | **OWASP A02:2021**
`
  ],

  [
    /hardcod|embed|magic.?number/i,
    `**Hardcoded Values** — Magic numbers and embedded credentials are code smells.

**The problem:**
\`\`\`javascript
// BAD
const MAX_LOGIN_ATTEMPTS = 5
const DB_PASSWORD = "hunter2"
if (response.status === 403) { ... }
\`\`\`

**The fix:**
\`\`\`javascript
// GOOD — named constants, env-based secrets
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
const DB_PASSWORD = process.env.DB_PASSWORD
const HTTP_STATUS_FORBIDDEN = 403
if (response.status === HTTP_STATUS_FORBIDDEN) { ... }
\`\`\`

**Pre-commit hook to catch hardcoded secrets:**
\`\`\`bash
#!/bin/bash
# .git/hooks/pre-commit
if git diff --cached --name-only | xargs grep -l -E '(password|api_key|secret)\s*=\s*["\x27]' 2>/dev/null; then
  echo "⚠️  Possible hardcoded secret detected! Use env vars."
  exit 1
fi
\`\`\`

- **CWE-798** | **CWE-797**
`
  ],

  // ─── Input Validation ───────────────────────────────────────────────
  [
    /validat|sanitiz|input|filter/i,
    `**Input Validation & Sanitization** — Trust nothing from the client.

**Defense in depth approach:**
\`\`\`python
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    age = fields.Int(required=True, validate=validate.Range(min=0, max=150))
    role = fields.Str(validate=validate.OneOf(['user', 'admin']))

# Validate incoming data
schema = UserSchema()
result = schema.load(request.json)  # Raises ValidationError if invalid
\`\`\`

**Types of validation:**
1. **Type checking** — Is it a string/number/boolean?
2. **Length limits** — Min/max character count
3. **Format validation** — Email regex, UUID format
4. **Range checks** — Numeric bounds
5. **Allowlist** — Only known-good values
6. **Business rules** — Domain-specific logic

**Never trust:**
- Client-side validation alone
- HTTP headers (User-Agent, Referer)
- File uploads (check MIME + content)
- **CWE-20** | **OWASP A03:2021**
`
  ],

  // ─── DevOps & Infrastructure ────────────────────────────────────────
  [
    /docker|container|image|dockerfile/i,
    `**Docker Security** — Containers are not VMs.

**Secure Dockerfile:**
\`\`\`dockerfile
# Use specific version, not :latest
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Multi-stage: don't include dev deps or source in final image
FROM node:20-alpine
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
USER appuser
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**Rules:**
- Never run as root
- Use specific image tags (not :latest)
- Scan images: \`trivy image myapp:latest\`
- Multi-stage builds (smaller attack surface)
- Read-only filesystem: \`--read-only\`
- No new privileges: \`--security-opt=no-new-privileges\`
- **CWE-250** | **OWASP A05:2021**
`
  ],

  [
    /kubernetes|k8s|kube/i,
    `**Kubernetes Security** — Securing your cluster.

**Essential hardening:**
\`\`\`yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 2000
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
    resources:
      limits:
        memory: "256Mi"
        cpu: "500m"
\`\`\`

**Checklist:**
- RBAC: least privilege for service accounts
- Network policies: pod-to-pod restrictions
- Pod Security Standards (Restricted)
- Image scanning with Trivy/Falco
- Secrets in encrypted etcd
- Audit logging enabled
- **CWE-250** | **CWE-284**
`
  ],

  [
    /ci.?cd|pipeline|github.?action|jenkins|deploy/i,
    `**CI/CD Security** — Securing your pipeline is as important as securing your app.

**GitHub Actions security:**
\`\`\`yaml
# GOOD — pinned to specific commit
- uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608  # v4.1.0

# BAD — unpinned (supply chain attack risk)
- uses: actions/checkout@v4
\`\`\`

**Pipeline security checklist:**
- Never log secrets (mask with \`::add-mask::\`)
- Use OIDC for cloud auth (no long-lived keys)
- Scan dependencies in CI (Snyk, Dependabot)
- SAST in pipeline (Semgrep, CodeQL)
- Signed commits and artifacts (Sigstore)
- Separate build and deploy permissions
- Store artifacts in trusted registry only

**Secrets in CI:**
- GitHub Encrypted Secrets (not in YAML)
- Never \`echo \$SECRET\` in scripts
- Rotate secrets regularly
- **CWE-502** | **OWASP A08:2021**
`
  ],

  // ─── Networking ─────────────────────────────────────────────────────
  [
    /ssrf|server.side|request.forgery/i,
    `**SSRF (Server-Side Request Forgery)** — Making your server fetch attacker-controlled URLs.

**The vulnerability:**
\`\`\`python
# DANGEROUS — attacker makes server fetch internal resources
import requests
url = request.args.get('url')
response = requests.get(url)  # Attacker: ?url=http://169.254.169.254/latest/meta-data/
\`\`\`

**AWS metadata endpoint:**
\`http://169.254.169.254/latest/meta-data/iam/security-credentials/\` → leaks AWS keys!

**Fix:**
\`\`\`python
import ipaddress
from urllib.parse import urlparse

def safe_fetch(url):
    parsed = urlparse(url)
    
    # Block internal IPs
    ip = ipaddress.ip_address(socket.gethostbyname(parsed.hostname))
    if ip.is_private or ip.is_loopback or ip.is_link_local:
        raise ValueError("Cannot fetch internal URLs")
    
    # Block dangerous schemes
    if parsed.scheme not in ('http', 'https'):
        raise ValueError("Only HTTP/HTTPS allowed")
    
    return requests.get(url, timeout=5)
\`\`\`

- **CWE-918** | **OWASP A10:2021**
`
  ],

  [
    /dns|domain|subdomain|dns.?rebinding/i,
    `**DNS Security** — DNS is the phonebook of the internet, and it's attackable.

**DNS Rebinding Attack:**
1. Attacker controls evil.com with low TTL
2. First response: points to attacker's server
3. Victim's browser makes request → hits attacker
4. Second response: DNS rebinding to internal IP (192.168.1.1)
5. Subsequent requests go to internal network

**Defenses:**
- DNS pinning in browsers
- Validate Host header on server
- Use DNS-over-HTTPS (DoH)
- Firewall rules for outbound DNS
- Network segmentation

**Useful commands:**
\`\`\`bash
# Check DNS records
dig example.com ANY
dig +short example.com MX

# DNSSEC validation
dig +dnssec example.com

# Find subdomains (recon)
subfinder -d example.com
amass enum -passive -d example.com
\`\`\`

- **CWE-346** | **CWE-918**
`
  ],

  // ─── Mobile & API ───────────────────────────────────────────────────
  [
    /mobile|android|ios|app.?security|apk|ipa/i,
    `**Mobile App Security** — Your app is running on an enemy device.

**Core principles:**
- The device is compromised. Your server is the trust boundary.
- Never store secrets on device.
- Validate everything server-side.

**Secure storage:**
\`\`\`javascript
// React Native — Keychain
import * as Keychain from 'react-native-keychain'
await Keychain.setGenericPassword('auth', token)

// Android — EncryptedSharedPreferences
// iOS — Keychain Services
\`\`\`

**Common mobile vulns:**
1. Insecure data storage (logs, shared prefs)
2. Insecure communication (no cert pinning)
3. Hardcoded secrets in binary
4. Insecure authentication
5. Insufficient transport encryption

**Certificate pinning:**
\`\`\`javascript
// React Native — axios
import axios from 'axios'
import { SSLPinning } from 'react-native-ssl-pinning'
\`\`\`

- **CWE-312** | **OWASP M1-M10**
`
  ],

  [
    /api|rest|graphql|endpoint|route/i,
    `**API Security** — Your API is an attack surface.

**REST API security checklist:**

1. **Authentication** — Every request must be authenticated
2. **Authorization** — Check permissions per resource
3. **Rate limiting** — Prevent brute force / DDoS
4. **Input validation** — Schema validation on all endpoints
5. **Output filtering** — Don't leak internal data

\`\`\`python
# FastAPI — secure endpoint
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer

app = FastAPI()
security = HTTPBearer()

@app.get("/api/users/{user_id}")
async def get_user(
    user_id: str,
    token = Security(security)
):
    current_user = verify_token(token.credentials)
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return await get_user_from_db(user_id)
\`\`\`

**GraphQL extras:**
- Query depth limiting
- Query complexity analysis
- Rate limit by query cost
- Never expose introspection in production

- **OWASP API Security Top 10**
`
  ],

  // ─── Secure Coding Practices ────────────────────────────────────────
  [
    /dependency|package|npm|pip|supply.?chain|vuln.*dep/i,
    `**Dependency Security** — Your app is only as secure as its weakest dependency.

**Audit dependencies:**
\`\`\`bash
# npm
npm audit
npm audit fix
npm audit fix --force  # May have breaking changes

# Python
pip-audit
safety check

# Or use Snyk
snyk test
\`\`\`

**Prevent issues:**
- Pin exact versions in lock files
- Use \`npm ci\` in CI (not \`npm install\`)
- Enable Dependabot / Renovate for auto-updates
- Review new dependencies before merging
- Check for typosquatting (popular package name + typo)

**Known malicious packages to watch:**
- Check names carefully: \`event-stream\`, \`ua-parser-js\` (both had supply chain attacks)
- Prefer well-maintained packages (high stars, active maintainers)
- Check npm download counts and history

**Lock file security:**
\`\`\`bash
# Verify package integrity
npm verify
# Check package provenance
npm audit --registry https://registry.npmjs.org
\`\`\`

- **OWASP A06:2021** | **CWE-1104**
`
  ],

  [
    /git|version.?control|commit|branch|hook/i,
    `**Git Security** — Version control has security implications.

**Prevent secret leaks:**
\`\`\`bash
# Install pre-commit hooks
pip install pre-commit gitleaks
gitleaks install

# Scan existing repo
gitleaks detect --source=. --verbose

# Scrub secrets from history
git filter-branch --force --index-filter \\
  'git rm --cached --ignore-unmatch .env' HEAD
\`\`\`

**Protected branches:**
- Require PR reviews (minimum 2 reviewers)
- Require status checks (CI passes)
- Require signed commits
- No force pushes to main
- Code owners file for critical paths

**Git hooks for security:**
\`\`\`bash
# .githooks/pre-commit
#!/bin/bash
# Block commits with secrets
if git diff --cached --name-only | xargs grep -l -iE '(api[_-]?key|secret|password|token)\s*[=:]\s*["\x27]' 2>/dev/null; then
  echo "❌ Secret detected in staged files. Use env vars!"
  exit 1
fi
\`\`\`

- **OWASP A02:2021** | **CWE-798**
`
  ],

  // ─── Web Application Specifics ──────────────────────────────────────
  [
    /file.?upload|upload|multipart|file.?inclusion/i,
    `**File Upload Security** — Users upload anything. You need to check everything.

**Secure upload handler:**
\`\`\`python
import magic
import os
from werkzeug.utils import secure_filename

ALLOWED_TYPES = {'image/png', 'image/jpeg', 'application/pdf'}
MAX_SIZE = 10 * 1024 * 1024  # 10MB

def secure_upload(file):
    # 1. Check file size
    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_SIZE:
        raise ValueError("File too large")
    file.seek(0)
    
    # 2. Check MIME type (not just extension!)
    content = file.read()
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_TYPES:
        raise ValueError(f"Invalid file type: {mime}")
    
    # 3. Safe filename
    filename = secure_filename(file.filename)
    
    # 4. Randomize to prevent path traversal
    safe_name = f"{uuid4().hex}_{filename}"
    
    # 5. Save outside webroot
    save_path = os.path.join('/uploads', safe_name)
    with open(save_path, 'wb') as f:
        f.write(content)
    
    return safe_name
\`\`\`

**Never:**
- Trust Content-Type header
- Use original filename
- Save in web-accessible directory
- Store in database without size limit

- **CWE-434** | **CWE-98** | **OWASP A04:2021**
`
  ],

  [
    /deserialization|pickle|yaml\.load|marshal|eval/i,
    `**Insecure Deserialization** — Untrusted data → code execution.

**The vulnerability:**
\`\`\`python
# CRITICAL — Remote Code Execution!
import pickle
data = pickle.loads(user_input)  # Attacker crafts malicious pickle

import yaml
yaml.load(user_input)  # Can execute arbitrary code

# Also dangerous:
eval(user_input)
exec(user_input)
\`\`\`

**Attack (Python pickle RCE):**
\`\`\`python
import pickle, os

class Exploit:
    def __reduce__(self):
        return (os.system, ('id',))

payload = pickle.dumps(Exploit())
# Anyone who unpickles this runs: os.system('id')
\`\`\`

**Fixes:**
\`\`\`python
# Use safe alternatives
import json
data = json.loads(user_input)  # Safe ✅

import yaml
data = yaml.safe_load(user_input)  # Safe ✅

# Never use: eval(), exec(), pickle.loads(), yaml.load()
\`\`\`

- **CWE-502** | **OWASP A08:2021**
`
  ],

  [
    /error|exception|debug|stack.?trace|information.?disclosure/i,
    `**Information Disclosure** — Your error messages leak your architecture.

**The problem:**
\`\`\`
# DANGEROUS — shows internal details
InternalError: psycopg2.OperationalError: connection to server at "db.internal.com" (10.0.1.5) failed
\`\`\`

**The fix:**
\`\`\`python
# Generic error handler
@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(f"Unhandled: {e}", exc_info=True)  # Log internally
    
    if app.debug:
        return jsonify(error=str(e)), 500  # Only in dev!
    
    return jsonify(error="Internal server error"), 500
\`\`\`

**What NOT to expose:**
- Stack traces
- Database connection strings
- Internal IP addresses
- Software versions
- SQL query structure
- File paths
- Debug flags

**Security headers to prevent sniffing:**
\`\`\`
X-Content-Type-Options: nosniff
\`\`\`

- **CWE-209** | **CWE-532** | **OWASP A01:2021**
`
  ],

  [
    /race.?condition|toctou|concurrency|deadlock/i,
    `**Race Conditions** — Timing bugs that become security bugs.

**Classic example — double-spend:**
\`\`\`python
# DANGEROUS — both checks pass simultaneously
balance = get_balance(user_id)    # Thread A: $100
#                                    Thread B: $100
if balance >= amount:              # Thread A: True
    #                                    Thread B: True
    deduct(user_id, amount)       # Thread A: -$50
    #                                    Thread B: -$50 → balance = -$50!
\`\`\`

**Fix — atomic operations:**
\`\`\`python
# Database-level lock
cursor.execute(
    "UPDATE accounts SET balance = balance - %s WHERE id = %s AND balance >= %s",
    (amount, user_id, amount)
)
if cursor.rowcount == 0:
    raise InsufficientFunds()

# Or use SELECT FOR UPDATE
cursor.execute("SELECT balance FROM accounts WHERE id = %s FOR UPDATE", (user_id,))
\`\`\`

**For web apps:**
- CSRF tokens also prevent race attacks
- Idempotency keys for duplicate submissions
- Database transactions with proper isolation levels

- **CWE-362** | **CWE-367** | **OWASP A04:2021**
`
  ],

  // ─── Network & Infrastructure ───────────────────────────────────────
  [
    /ssh|remote|server|vps|hardening/i,
    `**SSH & Server Hardening** — Locking down your server.

**SSH hardening (/etc/ssh/sshd_config):**
\`\`\`
PermitRootLogin no
PasswordAuthentication no        # Key-only auth
MaxAuthTries 3
Protocol 2
AllowUsers deploy admin
ClientAliveInterval 300
ClientAliveCountMax 2
\`\`\`

**Server hardening checklist:**
\`\`\`bash
# 1. Update everything
apt update && apt upgrade -y

# 2. Firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 3. Fail2ban
apt install fail2ban
systemctl enable fail2ban

# 4. Remove unnecessary services
systemctl disable telnet
systemctl disable ftp

# 5. Audit running processes
netstat -tlnp
ss -tlnp
\`\`\`

**Never:**
- Run services as root
- Use default ports for production
- Store SSH keys in shared locations
- **CWE-250** | **CWE-284**
`
  ],

  [
    /firewall|iptables|network.?security|subnet|vpc/i,
    `**Network Security** — Defense in depth at the network level.

**UFW (Uncomplicated Firewall):**
\`\`\`bash
# Default deny
ufw default deny incoming
ufw default allow outgoing

# Allow specific services
ufw allow from 10.0.0.0/8 to any port 22    # SSH from internal only
ufw allow from any to any port 443 proto tcp  # HTTPS from anywhere
ufw allow from 10.0.0.0/8 to any port 5432   # PostgreSQL internal only

# Rate limit SSH
ufw limit ssh

# Enable
ufw enable
ufw status verbose
\`\`\`

**Network segmentation:**
- DMZ for public-facing services
- Internal network for databases
- Management network for admin access
- Never expose databases to internet

**Zero Trust principles:**
1. Never trust, always verify
2. Least privilege access
3. Micro-segmentation
4. Continuous verification
5. Encrypt everything (mTLS)

- **CWE-284** | **OWASP A05:2021**
`
  ],

  // ─── Forensics & Incident Response ──────────────────────────────────
  [
    /incident|breach|respond|forensic|compromis/i,
    `**Incident Response** — What to do when (not if) you get breached.

**6-Step IR Process:**

1. **Preparation** — Have a plan BEFORE the incident
   - IR team contacts
   - Communication templates
   - Backup verification

2. **Detection & Analysis**
   - Monitor logs (ELK, Splunk, CloudWatch)
   - Anomaly detection
   - Validate the alert

3. **Containment**
   - Short-term: isolate affected systems
   - Long-term: patch the vulnerability
   - Preserve evidence (don't just fix and forget!)

4. **Eradication**
   - Remove malware/backdoors
   - Reset all potentially compromised credentials
   - Patch vulnerabilities

5. **Recovery**
   - Restore from clean backups
   - Monitor closely for re-infection
   - Gradually bring systems back online

6. **Post-Incident**
   - Write timeline
   - Root cause analysis
   - Update IR plan
   - Share learnings (anonymized)

**Key commands:**
\`\`\`bash
# Quick evidence preservation
netstat -tlnp > /evidence/network-connections.txt
ps auxf > /evidence/processes.txt
last -50 > /evidence/logins.txt
w > /evidence/who-logged-in.txt
\`\`\`

- **OWASP A09:2021**
`
  ],

  [
    /log|audit|monitor|siem|splunk|elk/i,
    `**Logging & Monitoring** — You can't protect what you can't see.

**Secure logging (Node.js):**
\`\`\`javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
})

// SECURITY: Never log these!
// ❌ Passwords
// ❌ API keys / tokens
// ❌ Credit card numbers
// ❌ Full PII (email OK, SSN no)
// ❌ Stack traces (in production)

// DO log these:
// ✅ Auth events (login, logout, failures)
// ✅ Authorization changes
// ✅ Data access (who accessed what, when)
// ✅ Input validation failures
// ✅ System errors (without sensitive data)
\`\`\`

**Structured log format:**
\`\`\`json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "warn",
  "event": "login_failed",
  "user": "admin@example.com",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "attempts": 3
}
\`\`\`

- **CWE-532** | **OWASP A09:2021**
`
  ],

  // ─── Misc / Advanced ────────────────────────────────────────────────
  [
    /csp|content.security.policy/i,
    `**Content Security Policy (CSP)** — The most powerful web security header.

**Strict CSP:**
\`\`\`
Content-Security-Policy:
  default-src 'none';
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.devstudio.app;
  media-src 'none';
  object-src 'none';
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
\`\`\`

**Nonce-based CSP (best for dynamic content):**
\`\`\`javascript
const crypto = require('crypto')
const nonce = crypto.randomBytes(16).toString('base64')

res.setHeader('Content-Security-Policy', 
  \`script-src 'nonce-\${nonce}';\`
)

// In HTML: <script nonce="\${nonce}">...</script>
\`\`\`

**Report violations:**
\`\`\`
Content-Security-Policy-Report-To: csp-endpoint
Report-To: {"group":"csp-endpoint","max_age":1044000,"endpoints":[{"url":"https://yourapp.com/csp-report"}]}
\`\`\`

- **OWASP A05:2021**
`
  ],

  [
    /owasp|top.?10|vulnerability|cve|weakness/i,
    `**OWASP Top 10 (2021)** — The definitive web security risk list:

| # | Risk | What it means |
|---|------|---------------|
| A01 | Broken Access Control | Users doing things they shouldn't |
| A02 | Cryptographic Failures | Weak/missing encryption |
| A03 | Injection | SQL, XSS, command injection |
| A04 | Insecure Design | Missing security architecture |
| A05 | Security Misconfiguration | Default creds, debug mode on |
| A06 | Vulnerable Components | Outdated dependencies with CVEs |
| A07 | Auth Failures | Weak passwords, no MFA |
| A08 | Data Integrity Failures | Insecure deserialization, CI/CD |
| A09 | Logging Failures | Can't detect/respond to attacks |
| A10 | SSRF | Server-side request forgery |

**Quick wins against Top 10:**
1. Parameterized queries (kills A03)
2. bcrypt + MFA (kills A07)
3. HTTPS + strong crypto (kills A02)
4. RBAC + auth checks (kills A01)
5. \`npm audit\` + Dependabot (kills A06)
6. helmet.js / security headers (kills A05)

**Resources:**
- owasp.org/www-project-top-ten
- cheatsheetseries.owasp.org
- CWE MITRE database
`
  ],

  [
    /pwned|breach|have.?i.?been|hacked|compromised/i,
    `**Data Breach Response & Prevention**

**Check if you're compromised:**
- haveibeenpwned.com — Check email/phone
- haveibeenpwned.com/Passwords — Check password hash

**Prevent credential stuffing:**
\`\`\`python
# Check HIBP password API (k-Anonymity model)
import hashlib, requests

def check_pwned(password):
    sha1 = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    resp = requests.get(f'https://api.pwnedpasswords.com/range/{prefix}')
    for line in resp.text.splitlines():
        hash_suffix, count = line.split(':')
        if hash_suffix == suffix:
            return int(count)  # How many times it appeared in breaches
    return 0
\`\`\`

**Prevention:**
- Block known-breached passwords (HIBP API)
- Enforce strong password policy
- MFA on all accounts
- Encrypt data at rest
- Regular security audits
- Monitor for credential leaks (GitHub Secret Scanning)

**If breached:**
1. Contain immediately
2. Notify affected users (72 hours for GDPR)
3. Reset all potentially compromised credentials
4. Forensics investigation
5. Document and improve

- **CWE-798** | **OWASP A07:2021**
`
  ],

  [
    /xss.*dom|dom.?xss|dom.?based/i,
    `**DOM-based XSS** — The client-side injection variant.

**Vulnerable code:**
\`\`\`javascript
// DANGEROUS — reads from URL fragment
const name = location.hash.slice(1)
document.getElementById('output').innerHTML = 'Hello ' + name
// Attacker: page.html#<img src=x onerror=alert(document.cookie)>
\`\`\`

**Another common pattern:**
\`\`\`javascript
// DANGEROUS — reads from URL parameter
const params = new URLSearchParams(location.search)
document.querySelector('.content').innerHTML = params.get('content')
\`\`\`

**Fixes:**
\`\`\`javascript
// 1. Use textContent
element.textContent = userInput

// 2. URL-encode before inserting
element.textContent = encodeURIComponent(userInput)

// 3. Sanitize if HTML needed
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
})

// 4. Use CSP with strict default-src 'none'
\`\`\`

**Source/Sink pairs to audit:**
- location.hash → innerHTML (HIGH)
- document.referrer → eval()
- postMessage → document.write()
- window.name → document.createElement()
- **CWE-79** | **OWASP A03:2021**
`
  ],

  // ─── Fun / Meta ──────────────────────────────────────────────────────
  [
    /joke|funny|humor|laugh|lol/i,
    () => JOKES[Math.floor(Math.random() * JOKES.length)],
  ],

  [
    /who|what are you|your name|about you/i,
    "I'm DevStudio AI — a dot-particle humanoid assistant made of ~200 animated dots. I scan code for 50+ vulnerability patterns, know the OWASP Top 10 by heart, can decode JWTs, generate hashes, and explain security concepts with code examples. All running locally in your browser. I'm basically a free security consultant who never sleeps. 🤖",
  ],

  [
    /help|what can|features|capabilities/i,
    `I can do A LOT. Here's the menu:

🔍 **Code Scanner** — 50+ vulnerability patterns (SQLi, XSS, CSRF, secrets, weak crypto, SSRF, and more)

🛠️ **50+ Dev Tools** — Hash, JWT decoder, Base64, AES, regex tester, UUID, timestamp, QR code, color converter, and 40+ more

💬 **AI Chat** — Ask about any security topic and get detailed explanations with code examples

📊 **Security Score** — Visual dashboard with risk assessment

📝 **DocMind** — Index and search documentation

🎤 **Voice I/O** — I can speak and listen via TTS/STT

🤖 **I'm the humanoid** — 200+ dot-particle avatar with 7 animated states

Type a question about security and I'll give you a detailed answer with code!`,
  ],

  [
    /thank|thanks|thx|appreciate|nice|great|awesome|cool/i,
    () => {
      const thanks = [
        "You're welcome! That's what free security consultants are for. 😎",
        "Happy to help! Remember: patch early, patch often.",
        "Anytime! Your code's security is my purpose for existing.",
        "No problem! I'm made of dots, but my knowledge is solid. ✨",
        "Glad I could help! Now go secure that codebase.",
      ]
      return thanks[Math.floor(Math.random() * thanks.length)]
    },
  ],

  [
    /how.*work|architecture|tech.?stack|built|made/i,
    `**DevStudio AI Architecture:**

🖥️ **Frontend:** React 19 + Vite + Zustand + Framer Motion
- Bento grid layout with cinematic dark theme
- Custom cursor with trailing particles
- Ambient gradient background with floating orbs
- 50+ client-side dev tools (Web Crypto API)
- TTS/STT via Web Speech API
- Canvas-based humanoid avatar (200+ animated dots)

🐍 **Backend:** FastAPI + Python
- NVIDIA Nemotron 3 Ultra via Nebius Token Factory
- Tavily web search integration
- SecureAgent: 50+ vulnerability pattern matching
- DocMind: document chunking and indexing
- DevBuddy: persistent memory with inverted indexes

🔌 **AI Stack:**
- Tier 1: Nemotron (deep reasoning)
- Tier 2: Tavily (web search + synthesis)
- Tier 3: Local knowledge base (always works offline)
`,
  ],

  [
    /size|how big|memory|performance|fast|slow|optim/i,
    `**DevStudio AI Performance:**

📊 **Bundle size:**
- Frontend JS: ~395KB (118KB gzipped) — very lean
- CSS: ~6KB (2KB gzipped)
- No heavy dependencies

⚡ **Performance:**
- Humanoid avatar: 60fps on Canvas (no DOM overhead)
- Tool results: instant (client-side computation)
- Scan: ~50ms (pattern matching, not ML inference)
- Cold start: <2 seconds

🔒 **Offline:**
- All 50+ tools work 100% offline
- Security scanning works offline
- Chat works offline (local knowledge base)
- TTS/STT works offline (browser Web Speech API)
- AI enhancement requires backend (Nemotron) or internet (Tavily)

The entire app is designed to be as useful as possible without any backend. The AI just makes it smarter.`,
  ],
]

export function getLocalReply(input) {
  const l = input.toLowerCase().trim()
  
  // Try each knowledge base entry
  for (const [pattern, response] of KB) {
    if (pattern.test(l)) {
      return typeof response === 'function' ? response() : response
    }
  }
  
  // Fallback — try to be helpful
  return `Hmm, I don't have a specific answer for "${input}". But here are some topics I know well:

🔐 **OWASP Top 10** — Ask about any of the 10 risks
💉 **Injection** — SQL, XSS, CSRF, SSRF, command injection
🔑 **Auth** — JWT, OAuth, sessions, passwords, MFA
🔒 **Crypto** — AES, RSA, hashing, TLS/SSL
🐳 **DevOps** — Docker, Kubernetes, CI/CD, SSH
📋 **Input** — Validation, sanitization, file uploads
🕵️ **Secrets** — Key management, .env files, pre-commit hooks
📊 **Logging** — Secure logging, monitoring, incident response

Try something like "tell me about SQL injection" or "how to secure JWTs"!`
}

export { JOKES, QUIPS }
