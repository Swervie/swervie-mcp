# Connect a client

Swervie is a remote MCP server over Streamable HTTP. There is no package to
install, no API key, and no OAuth. Every client needs exactly one thing, the
endpoint URL:

```
https://us-central1-swervie-prod.cloudfunctions.net/mcp
```

`https://swervie.xyz/mcp` serves the same server behind the public site, and
doubles as a human-readable docs page when opened in a browser.

## Claude

**Claude Code**

```bash
claude mcp add --transport http swervie https://us-central1-swervie-prod.cloudfunctions.net/mcp
```

**Claude.ai and Claude Desktop (custom connector)**: Settings → Connectors →
Add custom connector → paste the URL. No authentication. Results render as an
interactive shelf (MCP Apps).

**Claude Desktop `claude_desktop_config.json`** (older versions without
custom connectors use `mcp-remote` as a stdio bridge):

```json
{
  "mcpServers": {
    "swervie": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://us-central1-swervie-prod.cloudfunctions.net/mcp"]
    }
  }
}
```

## Cursor

`.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "swervie": {
      "url": "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
    }
  }
}
```

## VS Code (GitHub Copilot)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "swervie": {
      "type": "http",
      "url": "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
    }
  }
}
```

Or from the command line: `code --add-mcp '{"name":"swervie","type":"http","url":"https://us-central1-swervie-prod.cloudfunctions.net/mcp"}'`

## Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "swervie": {
      "serverUrl": "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
    }
  }
}
```

## ChatGPT

Settings → Connectors → Create (developer mode) → MCP server URL:
`https://us-central1-swervie-prod.cloudfunctions.net/mcp`, authentication
"No authentication".

## Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "swervie": {
      "httpUrl": "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
    }
  }
}
```

## Cline, Roo Code, Continue, Zed, and other `mcpServers`-style configs

Any client that accepts a remote server takes the same shape:

```json
{
  "mcpServers": {
    "swervie": {
      "type": "streamableHttp",
      "url": "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
    }
  }
}
```

If a client only speaks stdio, bridge with `npx -y mcp-remote <url>` as in
the Claude Desktop example.

## From code

**TypeScript** (`@modelcontextprotocol/sdk`): see
[`examples/node/search.mjs`](../examples/node/search.mjs).

**Python** (`mcp`): see [`examples/python/search.py`](../examples/python/search.py).

**Raw JSON-RPC**: see [`examples/curl.sh`](../examples/curl.sh). Send
`Accept: application/json, text/event-stream`; the server is stateless, so no
session header is required (one is echoed if you send it).

## Headers for partners

Platforms that route many users through shared egress can request a partner
key that replaces the shared per-IP ceiling with their own quota. Send it as
`Authorization: Bearer svk_...` or `X-Swervie-Api-Key: svk_...`. The server
works identically without one. Contact `info@plum-app.com`.
