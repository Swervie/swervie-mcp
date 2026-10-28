# Response shapes

Trimmed from real production responses (2026-10-28). Every tool returns a JSON
object as `content[0].text`; hosts that support MCP Apps also receive the same
object as `structuredContent` for the interactive shelf.

## `search_products` → category shelf

Query: `"65 inch OLED TV under $1500"`, `limit: 2`.

```json
{
  "interpretation": {
    "category": "Televisions",
    "match_quality": "strong",
    "resolved_child": "OLED TVs",
    "child_filters": [{"dimension": "Display Technology", "any_of": ["OLED", "QD-OLED"]}],
    "price_max_cents": 150000,
    "filters": [
      {"dimension": "Screen Size", "min": 65},
      {"dimension": "Display Technology", "equals": "OLED"}
    ],
    "sort": "quality",
    "method": "deterministic",
    "unparsed_tokens": []
  },
  "category": "Televisions",
  "disclosure": "Swervie may earn a commission when a shopper buys through these links, at no extra cost to them. Commissions never affect rankings, scores, or which products are shown.",
  "total_matching": 3,
  "next_cursor": "2",
  "card_specs": [
    {"name": "Screen Size", "unit": "inches"},
    {"name": "Display Technology"},
    {"name": "Resolution"},
    {"name": "Refresh Rate", "unit": "Hz"},
    {"name": "HDR Support"},
    {"name": "Gaming Features"},
    {"name": "Smart TV Platform"},
    {"name": "Audio Technology"}
  ],
  "rows": [
    {
      "id": "x867BnXduwLjzQUsOKzf",
      "kind": "product",
      "title": "Panasonic Z8BAP 77\" OLED 4K Smart Fire TV, 144Hz",
      "brand": "Panasonic",
      "price_usd": 1399.99,
      "swervie_score": 70.8,
      "price_band": "premium",
      "buy_url": "https://us-central1-swervie-prod.cloudfunctions.net/go?p=x867BnXduwLjzQUsOKzf&s=amazon",
      "buy_seller": "amazon",
      "image_url": "https://…/1142565_1.jpg",
      "star_rating": 4.7,
      "star_rating_count": 111,
      "attributes": {
        "Screen Size": 77,
        "Display Technology": "OLED",
        "Resolution": "4K UHD",
        "Refresh Rate": 144,
        "HDR Support": ["Dolby Vision IQ", "HDR10+", "HDR10", "HLG"],
        "Gaming Features": ["Variable Refresh Rate (VRR)", "AMD FreeSync Premium", "NVIDIA G-SYNC Compatible", "Game Mode"],
        "Smart TV Platform": "Fire TV",
        "Audio Technology": ["Dolby Atmos"],
        "HDMI 2.1 Support": true
      }
    },
    {
      "id": "D0EKg3Hu2jonqgJZCu2H",
      "kind": "group",
      "title": "65\" 4K UHD OLED 144Hz Television",
      "brand": "Samsung",
      "price_usd": 1297.99,
      "swervie_score": 70.6,
      "value_score": 75,
      "member_count": 2,
      "product_ids": ["0Y6vwWq3Uh7isTeoF6v5", "5HkXpGipEnLp11qdmNWh"],
      "top_pick_id": "5HkXpGipEnLp11qdmNWh",
      "top_pick_title": "Samsung 65-Inch Class OLED S90F 4K Smart TV (2025 Model)",
      "price_band": "premium",
      "buy_url": "https://us-central1-swervie-prod.cloudfunctions.net/go?p=5HkXpGipEnLp11qdmNWh&s=amazon",
      "buy_seller": "Amazon",
      "star_rating": 4.4,
      "star_rating_count": 548,
      "attributes": {"Screen Size": 65, "Display Technology": "OLED", "Resolution": "4K UHD", "Refresh Rate": 144}
    }
  ]
}
```

Reading it:

- `interpretation` is the receipt. `match_quality` is `strong`, `partial`,
  `weak` or `none`; `partial` lists the shopper words the parser could not
  place in `unparsed_tokens` so the agent can weigh them. `weak` and `none`
  return no rows and queue the request as demand.
- A `group` row is several retailer listings of the same product collapsed
  into one; `top_pick_id` is the member the row is named after, and passing a
  group id to `get_products` resolves to it.
- `card_specs` is the spec order every product card shows; the server
  instructions ask agents to list specs in that order when describing or
  comparing products.
- Rows carry `preference_boost` when the query (or `browse_category`
  `preferences`) included soft wishes such as "quiet" or "for pet hair".

## `search_products` → named product

A query naming one product (`"Sony WH-1000XM5 lowest price"`) returns
`interpretation.mode: "product"`, `products[0]` with every seller offer, and
`shelf_context` with its shelf rank and up to three higher-scoring
alternatives in the same price band. `"A vs B"` returns both products with
specs in one shared order (`mode: "comparison"`).

## `lookup_product`

```json
{
  "match": "ambiguous",
  "interpretation": {"query": "Sony WH-1000XM5", "model_tokens": ["wh1000xm5"], "lane": "name"},
  "rows": [
    {"id": "AlBl9pPLBrf4Vx7OCrEj", "title": "Sony WH1000XM5 Wireless Noise Canceling Headphones, Black", "brand": "Sony", "category": "Headphones", "price_usd": 195.99, "swervie_score": 66.1, "match_score": 9.1},
    {"id": "FhC0fwGQIOF0PEC1DctR", "title": "Restored Sony WH-1000XM5 Wireless Noise-Canceling Over-Ear Headphones, Black", "brand": "Sony", "category": "Headphones", "price_usd": 275.49, "swervie_score": 35.5, "match_score": 8.1}
  ],
  "note": "Several products fit this name. rows are the candidates, best match first (match_score). If one plainly matches what the shopper said, call lookup_product again with its model or get_products with its id; otherwise ask the shopper which one."
}
```

`match` is `exact` (identifier hit), `likely` (one clear name match),
`ambiguous` (candidates in `rows`), or `none` (recorded as demand). On `exact`
or `likely`, `products[0]` is the full detail and `shelf_context` gives rank,
variants (colorways, sizes) and alternatives. A product with no live price is
flagged under `readiness`; never quote its price as current.

## `find_category`

```json
{
  "matches": [
    {
      "category": "Robot Vacuums",
      "group": "Smart Home",
      "product_count": 312,
      "key_dimensions": ["Navigation Technology", "Mopping Type", "Self-Empty Dock", "Suction Power"],
      "child_categories": [
        {"name": "Robot Vacuum and Mop Combos", "filters": [{"dimension": "Mopping Type", "any_of": ["Dual Rotating Mops", "Vibrating/Sonic Mop Pad", "Flat Pad with Auto-Lift"]}]},
        {"name": "LiDAR Robot Vacuums", "filters": [{"dimension": "Navigation Technology", "any_of": ["LiDAR + Camera Fusion", "LiDAR (LDS)"]}]}
      ],
      "price_bands": {
        "budget": {"max_usd": 239.98},
        "mid": {"min_usd": 239.98, "max_usd": 549.99},
        "premium": {"min_usd": 549.99},
        "sample_size": 271
      },
      "filters": [
        {"name": "Navigation Technology", "type": "enum", "allowed_values": ["LiDAR + Camera Fusion", "LiDAR (LDS)", "Camera vSLAM", "Gyroscope + Optical Sensor", "Random Bounce"], "role": "quality", "importance": 9, "filterable": true},
        {"name": "Carpet Cleaning Performance", "type": "rating", "range": {"min": 0, "max": 10}, "role": "review_derived", "importance": 10, "filterable": false}
      ]
    }
  ]
}
```

`filters` is the category's contract: use its `name` values verbatim as the
`dimension` in `browse_category` filters and preferences. Review-derived
ratings are marked `filterable: false` but work as soft `preferences`.
`child_categories` are named sub-shelves with the filters that define them.
A full miss returns `queued_for_creation: true`, which is how new categories
get prioritized.

## `get_products`

Full detail per id: `attributes` in the category's standard order (card
specs first), `attribute_provenance` recording where each value came from
(manufacturer page, retailer listing, spec table), `review_ratings` with
verbatim evidence quotes, `offers` with every seller's price and `buy_url`,
and `resolved_groups` when a group id was substituted by its top pick.

## Writes

`record_selection` returns `{"recorded": true, "count": 1}`.
`submit_feedback` returns `{"recorded": true, "id": "…", "kind": "wrong_match"}`.
Feedback over 2,000 characters is rejected with an error, never truncated.
