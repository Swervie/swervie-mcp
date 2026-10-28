<p align="center">
  <img src="assets/icon-512.png" width="96" alt="Swervie" />
</p>

<h1 align="center">Swervie MCP server</h1>

<p align="center">
  One scored answer per product, across every retailer, for AI agents.<br/>
  Remote MCP server · Streamable HTTP · no auth · no API key · free
</p>

<p align="center">
  <a href="https://swervie.xyz/developers">Developer docs</a> ·
  <a href="docs/tools.md">Tool reference</a> ·
  <a href="docs/clients.md">Connect a client</a> ·
  <a href="docs/responses.md">Response shapes</a> ·
  <a href="docs/data-handling.md">Data handling</a>
</p>

---

```
https://us-central1-swervie-prod.cloudfunctions.net/mcp
```

Swervie is a cross-retailer product catalog built for assistants. Ask a normal
shopping question and get **one consolidated, scored answer per product**: live
prices, comparable specifications, review-derived ratings with verbatim evidence
quotes, and a buy link for every seller. Instead of eight duplicate listings and
a stale listicle.

- **Consolidated.** Listings of the same product across retailers collapse into
  one row. White-label clones sold under different brands are grouped too.
- **Structured.** Every category has its own spec schema; specs are extracted
  from manufacturer pages, retailer listings and spec tables, with provenance.
- **Scored.** Each product carries a quality score and a value score, plus
  review-derived sub-ratings backed by quotes from real reviews.
- **Deterministic and compact.** No LLM in the serving path. Answers are
  precomputed pipeline output: ~4k tokens, sub-second for a full shelf.
- **Interactive in hosts that support MCP Apps.** Results render as a shelf
  with sort controls, seller-by-seller offers and the review evidence
  (`io.modelcontextprotocol/ui` extension); plain JSON everywhere else.

Coverage today: 300+ categories, from robot vacuums and televisions to
espresso machines, mattresses and hiking boots, across hundreds of sellers.
The live list is at [swervie.xyz/llms.txt](https://swervie.xyz/llms.txt).

## Quick start

**Claude Code**

```bash
claude mcp add --transport http swervie https://us-central1-swervie-prod.cloudfunctions.net/mcp
```

**Cursor, Windsurf, VS Code, Claude Desktop, ChatGPT, Gemini CLI and others**:
see [docs/clients.md](docs/clients.md). Every config is the same one line, the
URL above, with no headers and no secrets.

**curl**

```bash
MCP=https://us-central1-swervie-prod.cloudfunctions.net/mcp
H=(-H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream')

# Handshake: server info, capabilities, agent instructions
curl -s -X POST $MCP "${H[@]}" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'

# A whole shopping answer in one call
curl -s -X POST $MCP "${H[@]}" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_products","arguments":{"query":"65 inch OLED TV under $1500","limit":3}}}'
```

More in [examples/](examples/): a Node client using the official SDK, a Python
client, and the curl script above.

## Tools

| Tool | Kind | What it does |
|---|---|---|
| `search_products` | read | The one-call path. Resolves a free-text query to a named product, an "A vs B" comparison, or a category shelf with constraints as filters and wishes as ranking preferences. Returns an `interpretation` receipt. |
| `lookup_product` | read | One product by name, ASIN, UPC/EAN/GTIN, or brand + model. Full detail, every seller offer, and its rank on its shelf. |
| `find_category` | read | The matching category and its filter contract: every filterable spec with type, units, allowed values and importance, plus price bands. |
| `browse_category` | read | A category's ranked shelf with explicit filters (hard) and preferences (soft), sorted by value, quality or price. |
| `get_products` | read | Full detail for up to 25 ids: all specs with provenance, review sub-ratings with evidence quotes, every offer. |

Every tool is read-only and annotated (`title`, `readOnlyHint: true`,
`openWorldHint: true`), so hosts can run them without a confirmation prompt.
The server provides data only: it writes nothing on the user's behalf, and
neither its instructions nor its results direct the model. Full input schemas
and descriptions, generated from the live server, are in
[docs/tools.md](docs/tools.md).

### A typical conversation

1. "Find me a 65-inch OLED TV under $1,500" → `search_products` → ranked shelf
   with prices, buy links and the commission disclosure.
2. "Which of those is better for gaming?" → `get_products` → refresh rate, VRR,
   HDMI 2.1, and what reviewers say about input lag.
3. "Is the Sony A95L any cheaper anywhere?" → `lookup_product` → every seller
   offer, plus its rank on the shelf and higher-scoring alternatives.

The server ships `instructions` on `initialize` that describe each tool and
the fields its results carry, so a client needs no prompt engineering.

## User signature (optional, no PII)

Every tool accepts an optional `user_signature`: an opaque, stable, pseudonymous
id that gives each shopper their own rate-limit quota (instead of sharing one
per session or egress IP) and attributes their buy-link clicks. The
recommended recipe:

```
user_signature = "sv1-" + sha256hex("swervie/v1|" + id).slice(0, 24)
```

where `id` is the user's most stable identifier, normalized (lowercase,
trimmed; email preferred, with `+tags` stripped). Never send the raw
identifier. If none is available, use `"sv1r-"` + a UUID kept for that user,
or omit the field. A value that changes every session counts as a new shopper
each session. The server hashes any raw email or phone number that arrives by
mistake before anything is stored.

## Limits, affiliate links, and privacy

- **Rate limits.** Anonymous tier: 60 requests/min and 2,000/day per client
  (signature, session, or IP), with a higher per-IP ceiling sized for shared
  agent-platform egress. Partner keys with their own quota are available for
  platforms: contact `info@plum-app.com`.
- **Buy links are affiliate links.** Every response that carries `buy_url`
  also carries a `disclosure` string worded for the shopper. Commissions never
  affect rankings, scores, or which products are shown.
- **No account, no checkout, no payments.** Purchasing hands off to the
  retailer's own page.
- **What is stored.** Tool name, query, category and product ids per call, the
  signature when present, and rate-limit counters. Nothing the user owns, and
  nothing written on the user's behalf.

Details in [docs/data-handling.md](docs/data-handling.md). Policies:
[privacy](https://swervie.xyz/privacy) · [terms](https://swervie.xyz/terms) ·
[disclosure](https://swervie.xyz/disclosure).

## What is in this repository

This repository is the public home of the Swervie MCP server: documentation,
the registry manifest (`server.json`), client configuration, examples, and
brand assets for directories. The serving code runs as a Google Cloud Function
inside Swervie's main monorepo and is not published here. The hosted endpoint
is the supported way to use it. Issues and feature requests are welcome.

Server version is reported by `initialize` (`serverInfo.version`). Protocol
version `2025-06-18`. Transport: Streamable HTTP, stateless.

Changes: v1.6.0 (2026-10) removed the two non-destructive write tools
(`record_selection`, `submit_feedback`) and rewrote the server instructions
and result notes as descriptions of the data; the server is now read-only
end to end.

## License

Documentation, examples and assets in this repository are MIT licensed
(© Plum Applications, Inc.). Use of the hosted service is governed by the
[terms](https://swervie.xyz/terms).
