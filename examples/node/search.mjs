// Minimal Node client for the Swervie MCP server using the official SDK.
//
//   cd examples/node && npm install && node search.mjs "65 inch OLED TV under $1500"

import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {createHash} from "node:crypto";

const MCP_URL = process.env.MCP_URL ??
  "https://us-central1-swervie-prod.cloudfunctions.net/mcp";
const query = process.argv.slice(2).join(" ") || "robot vacuum for pet hair under $600";

// Optional, pseudonymous personalization. Never send the raw identifier.
const userSignature = (id) =>
  "sv1-" + createHash("sha256").update("swervie/v1|" + id.trim().toLowerCase())
    .digest("hex").slice(0, 24);

const client = new Client({name: "swervie-example", version: "1.0.0"});
await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));

const {tools} = await client.listTools();
console.log("tools:", tools.map((t) => t.name).join(", "));

const result = await client.callTool({
  name: "search_products",
  arguments: {query, limit: 5, user_signature: userSignature("demo@example.com")},
});
const shelf = JSON.parse(result.content[0].text);

console.log(`\n${shelf.category} · ${shelf.interpretation.match_quality} match`);
for (const row of shelf.rows ?? []) {
  const specs = (shelf.card_specs ?? []).slice(0, 3)
    .map((s) => `${s.name}: ${row.attributes?.[s.name] ?? "–"}${s.unit ? " " + s.unit : ""}`)
    .join(" · ");
  console.log(`- $${row.price_usd}  ${row.title}\n    score ${row.swervie_score} · ${specs}\n    ${row.buy_url}`);
}
if (shelf.disclosure) console.log(`\n${shelf.disclosure}`);

await client.close();
