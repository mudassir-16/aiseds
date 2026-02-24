Review this app and harden its security. Add:
Rate limiting on all public endpoints (IP + user-based, sensible defaults, graceful 429s).
Strict input validation & sanitization on all user inputs (schema-based, type checks, length limits, reject unexpected fields).
Secure API key handling (remove hard-coded keys, move to environment variables, rotate keys, ensure no keys are exposed client-side).
Follow OWASP best practices, include clear comments, and do not break existing functionality.