#!/usr/bin/env node
// Regenerates docs/tools.md from the live server's tools/list so the
// reference can never drift from production. Node 18+ (global fetch).
//
//   node scripts/gen-tools-doc.mjs            # writes docs/tools.md
//   MCP_URL=https://... node scripts/gen-tools-doc.mjs

import {writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const MCP_URL = process.env.MCP_URL ??
  "https://us-central1-swervie-prod.cloudfunctions.net/mcp";
const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json, text/event-stream",
};

async function rpc(method, params, id) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({jsonrpc: "2.0", id, method, params}),
  });
  const body = await res.text();
  // Streamable HTTP may answer as JSON or as an SSE stream.
  const json = body.startsWith("{") ? body :
    body.split("\n").find((l) => l.startsWith("data:"))?.slice(5).trim();
  return JSON.parse(json).result;
}

const init = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: {name: "swervie-mcp-docs", version: "1.0"},
}, 1);
const {tools} = await rpc("tools/list", {}, 2);

const kind = (a = {}) => a.readOnlyHint ? "read-only" :
  a.destructiveHint === false ? "write, non-destructive" : "write";

const prop = (name, p, required) => {
  const type = Array.isArray(p.type) ? p.type.join(" \\| ") : p.type ?? "";
  const bits = [];
  if (p.enum) bits.push(`one of ${p.enum.map((v) => `\`${v}\``).join(", ")}`);
  if (p.minimum !== undefined || p.maximum !== undefined) {
    bits.push(`${p.minimum ?? ""}–${p.maximum ?? ""}`);
  }
  if (p.minItems !== undefined || p.maxItems !== undefined) {
    bits.push(`${p.minItems ?? ""}–${p.maxItems ?? ""} items`);
  }
  if (p.maxLength) bits.push(`≤${p.maxLength} chars`);
  if (p.default !== undefined) bits.push(`default \`${p.default}\``);
  const desc = [p.description, bits.length ? `(${bits.join("; ")})` : ""]
    .filter(Boolean).join(" ").replace(/\n/g, " ");
  return `| \`${name}\` | ${type} | ${required ? "yes" : "no"} | ${desc} |`;
};

let md = `# Tool reference

Generated from the live server (\`${MCP_URL}\`) on ${new Date().toISOString().slice(0, 10)}.
Server \`${init.serverInfo.name}\` v${init.serverInfo.version}, protocol ${init.protocolVersion}.
Regenerate with \`node scripts/gen-tools-doc.mjs\`.

Every tool also accepts an optional \`user_signature\` (see the README for the
recipe). Responses that carry \`buy_url\` links also carry a \`disclosure\`
field, the commission disclosure for those links, worded for the shopper.

## Server instructions

The server returns these instructions on \`initialize\`; hosts pass them to the
model as guidance for using the tools.

> ${init.instructions.replace(/\n/g, "\n> ")}

`;

for (const t of tools) {
  const s = t.inputSchema ?? {};
  const req = new Set(s.required ?? []);
  md += `## \`${t.name}\`\n\n`;
  md += `**${t.title ?? t.annotations?.title ?? t.name}** · ${kind(t.annotations)}\n\n`;
  md += `${t.description}\n\n`;
  md += `| Argument | Type | Required | Notes |\n|---|---|---|---|\n`;
  for (const [name, p] of Object.entries(s.properties ?? {})) {
    md += prop(name, p, req.has(name)) + "\n";
    if (p.type === "array" && p.items?.properties) {
      for (const [n2, p2] of Object.entries(p.items.properties)) {
        md += prop(`${name}[].${n2}`, p2, (p.items.required ?? []).includes(n2)) + "\n";
      }
    }
    if (p.type === "object" && p.properties) {
      for (const [n2, p2] of Object.entries(p.properties)) {
        md += prop(`${name}.${n2}`, p2, (p.required ?? []).includes(n2)) + "\n";
      }
    }
  }
  md += "\n";
}

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "tools.md");
writeFileSync(out, md);
console.log(`wrote ${out}: ${tools.length} tools`);
