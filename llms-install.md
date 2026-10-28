# Installing the Swervie MCP server (for AI agents)

Swervie is a hosted, remote MCP server. There is nothing to download, build,
or run locally, and no API key or account is needed.

1. Add a remote MCP server named `swervie` with transport **Streamable HTTP**
   and this URL:

   ```
   https://us-central1-swervie-prod.cloudfunctions.net/mcp
   ```

2. Authentication: **none**. Do not add headers.

3. If the client only supports stdio servers, bridge with `mcp-remote`:

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

4. Verify: list tools. You should see `search_products`, `lookup_product`,
   `find_category`, `browse_category`, `get_products`, `record_selection`,
   and `submit_feedback`. Call `search_products` with
   `{"query": "robot vacuum for pet hair under $600", "limit": 3}` and expect
   a JSON shelf with `rows`, `interpretation`, and `disclosure`.

Client-specific config files are in [docs/clients.md](docs/clients.md).
