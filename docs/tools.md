# Tool reference

Generated from the live server (`https://us-central1-swervie-prod.cloudfunctions.net/mcp`) on 2026-10-28.
Server `swervie` v1.6.0, protocol 2025-06-18.
Regenerate with `node scripts/gen-tools-doc.mjs` (this revision was prepared from the v1.6.0 source ahead of its deploy; rerun once v1.6.0 is live).

Every tool also accepts an optional `user_signature` (see the README for the
recipe). Responses that carry `buy_url` links also carry a `disclosure`
field, the commission disclosure for those links, worded for the shopper.

## Server instructions

The server returns these instructions on `initialize`; hosts pass them to the
model as guidance for using the tools.

> Swervie is a cross-retailer product catalog: one consolidated, scored answer per product, from data only. search_products answers a free-text shopping query in one call: it resolves a named product (to its detail, offers and shelf rank), or a category with the shopper's constraints as filters and wishes as ranking preferences. find_category returns a category's filter contract, and browse_category applies explicit filters and preferences from that contract. lookup_product resolves one product by name or identifier (ASIN, UPC/EAN/GTIN, brand plus model number). get_products returns full offers, review sub-ratings and spec provenance for product ids; shelf rows already carry buy_url and star ratings. Each search result carries an interpretation receipt: match_quality, fit_note, unparsed_tokens and unsupported_terms record how the query was read and which shopper words no filter covered. 'partial' means rows were served with some shopper words unexplained, or no rows were served because the closest shelf was only a medium-confidence fit. A lookup_product 'ambiguous' result lists the candidates best first; a model number usually resolves it. shelf_context lists higher-scoring alternatives in the same price band. A product flagged under readiness carries no current price. card_specs is the spec order every product card uses. buy_url is the link a shopper follows to buy: every shelf row and every offer carries one, and a price without its buy_url leaves the shopper with no way to reach that seller from the answer. Results that carry buy_url links also carry a `disclosure` field: Swervie's commission disclosure for those links, worded for the shopper. user_signature is an optional pseudonymous id that gives a shopper their own rate-limit quota and attributes their buy_url clicks. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + id), where id is the user's most stable identifier normalized (lowercase, trimmed; an email with +tags stripped), or 'sv1r-' + a UUID kept for that user. A value that changes every session counts as a new shopper each session. A raw email or phone number is hashed server-side before anything is stored.

## `find_category`

**Find a product category** · read-only

Find the Swervie product category that matches a shopping intent and return its filter contract: every filterable specification with its type, units, allowed values, and importance, plus budget, mid, and premium price bands.

| Argument | Type | Required | Notes |
|---|---|---|---|
| `query` | string | yes |  |
| `user_signature` | string | no | Optional opaque, stable, pseudonymous user id: the shopper's own rate-limit quota and click attribution. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + normalized identifier), or 'sv1r-' + a UUID. A raw email or phone number is hashed server-side before anything is stored. (≤128 chars) |

## `browse_category`

**Browse a category shelf** · read-only

Return a category's consolidated, ranked shelf: one row per product, with duplicate seller listings already collapsed. Each row carries price, price_band, buy_url and buy_seller (the retailer behind the link), image_url, star ratings, and the category's required and top-weighted spec values. card_specs gives the specs every product card shows, in display order. Filters are hard: a row missing the attribute is excluded. Preferences are soft: rows that measure well on them rank higher and none are excluded (for example Rated Noise, prefer low, or a pet-hair rating, prefer high). Sort by value (default), quality, or price_asc. A filter on the Price dimension applies min/max to the live offer price in cents. Responses that carry buy_url links also carry a disclosure field: the commission disclosure for those links.

| Argument | Type | Required | Notes |
|---|---|---|---|
| `category` | string | yes |  |
| `filters` | array | no |  |
| `filters[].dimension` | string | yes |  |
| `filters[].equals` | string \| number \| boolean | no |  |
| `filters[].min` | number | no |  |
| `filters[].max` | number | no |  |
| `filters[].any_of` | array | no |  |
| `preferences` | array | no | Soft preferences: rows that measure well on a dimension rank higher, and none are excluded. Each row reports preference_boost. (–6 items) |
| `preferences[].dimension` | string | yes |  |
| `preferences[].prefer` | string | yes | (one of `high`, `low`, `equals`) |
| `preferences[].value` | string \| number \| boolean | no | Required with prefer 'equals' (enum/boolean dims). |
| `sort` | string | no | (one of `value`, `quality`, `price_asc`) |
| `limit` | integer | no | (1–50) |
| `cursor` | string | no |  |
| `user_signature` | string | no | Optional opaque, stable, pseudonymous user id: the shopper's own rate-limit quota and click attribution. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + normalized identifier), or 'sv1r-' + a UUID. A raw email or phone number is hashed server-side before anything is stored. (≤128 chars) |

## `search_products`

**Search products** · read-only

Answer one free-text shopping query, such as 'TVs under $500 with 120hz refresh rate', 'quiet dishwasher for a small kitchen', 'robot vacuum for pet hair under $600', or 'Sony WH-1000XM5 lowest price'. A query naming one specific product resolves to that product (interpretation.mode 'product'): products[0] holds every seller offer, and shelf_context gives its shelf rank and higher-scoring alternatives. 'A vs B' returns both products with specs in one shared order (mode 'comparison'). Otherwise the category is resolved, hard constraints such as price and specs become filters, and soft wishes such as 'quiet' or 'for pet hair' become ranking preferences that exclude nothing; interpretation.preferences lists them with reasons, and each row's preference_boost shows the effect. The interpretation object records how the query was read: method (deterministic parser or query-understanding model), fit_note (a one-line judgment of the category fit), and match_quality. 'strong' means the shelf plainly fits. 'partial' means either rows are served with some shopper words unexplained (listed in unparsed_tokens and unsupported_terms), or no rows are served because the closest shelf was only a medium-confidence fit (named in interpretation.llm_category). 'weak' and 'none' return no rows and queue the request as demand (queued_for_creation for a missing category, queued_product_request for a missing product). card_specs gives the specs every product card shows, in display order. Responses that carry buy_url links also carry a disclosure field: the commission disclosure for those links.

| Argument | Type | Required | Notes |
|---|---|---|---|
| `query` | string | yes |  |
| `sort` | string | no | (one of `value`, `quality`, `price_asc`) |
| `limit` | integer | no | (1–50) |
| `cursor` | string | no |  |
| `user_signature` | string | no | Optional opaque, stable, pseudonymous user id: the shopper's own rate-limit quota and click attribution. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + normalized identifier), or 'sv1r-' + a UUID. A raw email or phone number is hashed server-side before anything is stored. (≤128 chars) |

## `lookup_product`

**Look up a specific product** · read-only

Look up one specific product by name or identifier: a product name such as 'Sony WH-1000XM5' or 'Ninja AF101 air fryer', an ASIN, a UPC/EAN/GTIN, or brand plus model number. match reports the result: 'exact' (identifier hit), 'likely' (one clear name match; interpretation.runner_up names the next best), 'ambiguous' (several fit; rows lists the candidates, best first), or 'none' (not carried; the miss is recorded as demand). On exact or likely, products[0] is the full detail (all specs, review-derived ratings with evidence quotes, every seller offer with buy_url), and shelf_context gives its rank on its category shelf by value and quality, its variants (colorways, sizes), and up to three higher-scoring alternatives in the same price band. A product with no live price or image is still returned, flagged under readiness; its price is not current. Responses that carry buy_url links also carry a disclosure field: the commission disclosure for those links.

| Argument | Type | Required | Notes |
|---|---|---|---|
| `query` | string | no | The product's name as the shopper said it: brand, model, name. May contain an ASIN or barcode. (≤200 chars) |
| `identifiers` | object | no | Known identifiers. mpn/model_number need brand to resolve. |
| `identifiers.asin` | string | no | (≤20 chars) |
| `identifiers.upc` | string | no | (≤20 chars) |
| `identifiers.ean` | string | no | (≤20 chars) |
| `identifiers.gtin` | string | no | (≤20 chars) |
| `identifiers.mpn` | string | no | (≤64 chars) |
| `identifiers.model_number` | string | no | (≤64 chars) |
| `brand` | string | no | (≤80 chars) |
| `category` | string | no | Restrict the name match to one Swervie category (exact name). (≤200 chars) |
| `user_signature` | string | no | Optional opaque, stable, pseudonymous user id: the shopper's own rate-limit quota and click attribution. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + normalized identifier), or 'sv1r-' + a UUID. A raw email or phone number is hashed server-side before anything is stored. (≤128 chars) |

## `get_products`

**Get product details** · read-only

Full detail for up to 25 products: all specifications in the category's standard order (card_specs first), review-derived ratings with verbatim evidence quotes, every seller offer with price and buy_url, and attribute_provenance recording where each spec value came from (manufacturer page, retailer listing, spec table). ids accepts product ids and shelf row ids alike: a group row's id resolves to the product the row is named after (its top_pick_id), and resolved_groups reports each substitution. Responses that carry buy_url links also carry a disclosure field: the commission disclosure for those links.

| Argument | Type | Required | Notes |
|---|---|---|---|
| `ids` | array | yes | (1–25 items) |
| `user_signature` | string | no | Optional opaque, stable, pseudonymous user id: the shopper's own rate-limit quota and click attribution. Format: 'sv1-' + the first 24 hex characters of SHA-256('swervie/v1|' + normalized identifier), or 'sv1r-' + a UUID. A raw email or phone number is hashed server-side before anything is stored. (≤128 chars) |
