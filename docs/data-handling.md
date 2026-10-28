# Data handling, limits, and disclosure

Written for directory reviewers and for anyone deciding whether to connect.

## Authentication

None. The catalog is public and read-only. There are no user accounts, no
OAuth, no credentials to leak. A separate header-borne partner key exists only
for per-platform quota; it is server-to-server plumbing, not user auth, and
the server works without it.

## Rate limits

| Tier | Per minute | Per day | Keyed by |
|---|---|---|---|
| Anonymous client | 60 | 2,000 | `user_signature`, else MCP session id, else IP |
| Anonymous per-IP ceiling | 300 | 20,000 | egress IP (sized for shared agent-platform egress) |
| Partner key | 600 (default) | 100,000 (default) | the key; per-user fairness still applies inside it |

Over-limit requests get a JSON-RPC error naming the window; nothing is queued.

## What the client sends

- Query text, filter values, product ids, and sort options.
- Optionally `user_signature`: pseudonymous by construction (a local SHA-256
  hash of a normalized identifier, or a random UUID the agent keeps). The
  server hashes any raw email or phone number that arrives by mistake before
  storage, so PII never reaches disk.

## What the server stores

- `mcp_events`: tool name, query or category, product ids, the signature when
  present, and a session id. This is the server's own analytics and the
  ranking signal behind `record_selection`.
- `mcp_feedback`: the text of `submit_feedback` calls (≤2,000 chars), with
  the optional product ids and category, for human review.
- Rate-limit counters.

Nothing the user owns is read or written. No conversation content beyond the
tool arguments is received. No personal health data.

## Writes

Two tools write, both non-destructive and annotated as such:

- `record_selection` appends one "considered" or "chosen" event per product id.
- `submit_feedback` stores one report for human review.

Neither overwrites or deletes anything.

## Affiliate links and the disclosure

`buy_url` values are affiliate links. Most are Swervie `/go` redirects on the
`us-central1-swervie-prod.cloudfunctions.net` origin so destinations can be
updated server-side; Amazon links go directly to amazon.com with an Associates
tag, as Amazon policy requires. Every response that carries `buy_url` also
carries a `disclosure` field worded for the shopper, and the server
instructions ask the agent to relay it. Commissions never affect rankings,
scores, or which products are shown.

## No LLM in the serving path

Responses are precomputed pipeline output (consolidation, scoring,
review-derived ratings with evidence). The one exception is query
understanding for free-text searches the deterministic parser cannot resolve;
its output is a structured plan, echoed back in `interpretation` so the agent
can audit it. Tool results contain catalog data only, never instructions.

## Policies and contact

- Privacy: https://swervie.xyz/privacy
- Terms: https://swervie.xyz/terms
- Disclosure: https://swervie.xyz/disclosure
- Operator: Plum Applications, Inc. · `info@plum-app.com`
