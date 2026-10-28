# Contributing

This repository holds the public documentation, examples, registry manifest,
and brand assets for the Swervie MCP server. The server itself runs as a
hosted endpoint; its source lives in Swervie's main monorepo.

Welcome here:

- Fixes and additions to the client configuration guide
  ([docs/clients.md](docs/clients.md)), especially for clients we have not
  covered.
- New example clients in other languages (keep them under 80 lines and
  dependency-light).
- Bug reports about the server's behavior: open an issue with the tool name,
  the arguments you sent, and what came back. For data problems (a wrong
  spec, a stale price, a bad category match) the `submit_feedback` tool
  reaches the same review queue faster.

`docs/tools.md` is generated. Do not edit it by hand; run
`node scripts/gen-tools-doc.mjs` against the live server instead.
