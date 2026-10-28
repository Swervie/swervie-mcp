"""Minimal Python client for the Swervie MCP server.

    pip install "mcp>=2"
    python search.py "65 inch OLED TV under $1500"
"""

import asyncio
import hashlib
import json
import os
import sys

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

MCP_URL = os.environ.get(
    "MCP_URL", "https://us-central1-swervie-prod.cloudfunctions.net/mcp"
)


def user_signature(identifier: str) -> str:
    """Pseudonymous id: own rate-limit quota + click attribution. Never the raw id."""
    normalized = identifier.strip().lower()
    digest = hashlib.sha256(f"swervie/v1|{normalized}".encode()).hexdigest()
    return "sv1-" + digest[:24]


async def main(query: str) -> None:
    async with streamable_http_client(MCP_URL) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("tools:", ", ".join(t.name for t in tools.tools))

            result = await session.call_tool(
                "search_products",
                {"query": query, "limit": 5,
                 "user_signature": user_signature("demo@example.com")},
            )
            shelf = json.loads(result.content[0].text)
            print(f"\n{shelf.get('category')} · "
                  f"{shelf['interpretation'].get('match_quality')} match")
            for row in shelf.get("rows", []):
                print(f"- ${row.get('price_usd')}  {row['title']}")
                print(f"    score {row.get('swervie_score')} · {row.get('buy_url')}")
            if shelf.get("disclosure"):
                print(f"\n{shelf['disclosure']}")


if __name__ == "__main__":
    asyncio.run(main(" ".join(sys.argv[1:]) or "robot vacuum for pet hair under $600"))
