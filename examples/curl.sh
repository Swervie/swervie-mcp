#!/usr/bin/env bash
# Talk to the Swervie MCP server with nothing but curl.
# Streamable HTTP, stateless: every call is an independent POST.
set -euo pipefail

MCP="${MCP_URL:-https://us-central1-swervie-prod.cloudfunctions.net/mcp}"
H=(-H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream')

rpc() { curl -s -X POST "$MCP" "${H[@]}" -d "$1"; echo; }

echo "# initialize"
rpc '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl-example","version":"1.0"}}}'

echo "# tools/list"
rpc '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

echo "# search_products: one call answers the shopping question"
rpc '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_products","arguments":{"query":"robot vacuum for pet hair under $600","limit":3}}}'

echo "# lookup_product: a specific product by name"
rpc '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"lookup_product","arguments":{"query":"Ninja AF101 air fryer"}}}'

echo "# find_category -> browse_category: explicit filter control"
rpc '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"find_category","arguments":{"query":"espresso machine"}}}'
rpc '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"browse_category","arguments":{"category":"Espresso Machines","filters":[{"dimension":"Price","max":80000}],"sort":"value","limit":5}}}'
