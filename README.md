# n8n-nodes-amazonscraperapi

[![npm](https://img.shields.io/npm/v/n8n-nodes-amazonscraperapi)](https://www.npmjs.com/package/n8n-nodes-amazonscraperapi)
[![license](https://img.shields.io/npm/l/n8n-nodes-amazonscraperapi)](./LICENSE)

An [n8n](https://n8n.io) community node for [Amazon Scraper API](https://www.amazonscraperapi.com/). Fetch structured Amazon product data, run keyword searches, and queue async bulk lookups — all inside your n8n workflows.

Amazon Scraper API is a managed Amazon-scraping endpoint with rotating residential proxies, automatic CAPTCHA handling, and structured JSON output for 20+ marketplaces. Flat $0.50 per 1,000 successful requests, billed only on 2xx responses. [1,000 free requests on signup](https://app.amazonscraperapi.com).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage examples](#usage-examples)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

In short, inside any self-hosted n8n instance:

1. Go to **Settings → Community Nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-amazonscraperapi` and click **Install**.

The node appears in the editor's node palette under **Amazon Scraper API**.

## Operations

The node exposes three resources:

### Product → Get

Fetch a single Amazon product by ASIN or URL. Wraps `GET /api/v1/amazon/product`.

| Field | Required | Description |
|---|---|---|
| ASIN or URL | yes | `B09HN3Q81F` or `https://www.amazon.com/dp/B09HN3Q81F` |
| Marketplace | no | Dropdown — defaults to amazon.com (US) |
| Simplify | no | Return only `{title, price, rating, availability, buybox_seller}` instead of the full structured response |
| Language | no | Locale, e.g. `en_US`, `de_DE` |
| Residential IP Country | no | ISO-2 code, e.g. `DE`, `JP` |
| Include Raw HTML | no | Append the raw page HTML to the response |

### Search → Search

Run a keyword search and return the SERP. Wraps `GET /api/v1/amazon/search`.

| Field | Required | Description |
|---|---|---|
| Query | yes | Keywords, same as the Amazon search bar |
| Marketplace | no | Dropdown — defaults to amazon.com (US) |
| Simplify | no | Return only `{position, asin, title, price, rating, sponsored}` per result |
| Sort By | no | best_match · price_asc · price_desc · avg_customer_review · newest |
| Start Page | no | 1-indexed, max 10 |
| Pages | no | Consecutive pages to scrape (1–10) |

Output is flattened to one item per SERP result.

### Bulk Lookup → Create / Get Status

Queue up to 1,000 ASINs as a single asynchronous job. Wraps `POST /api/v1/amazon/batch` and `GET /api/v1/amazon/batch/:id`.

**Create**

| Field | Required | Description |
|---|---|---|
| ASINs | yes | One ASIN per line, or comma-separated. Max 1,000 per batch. |
| Marketplace | no | Applied to every ASIN in the batch |
| Webhook URL | no | If supplied, the completed batch is POSTed to this URL when done. The response includes a one-time HMAC signing secret — save it to verify callbacks. |

Returns:

```json
{
  "id": "a1b2c3d4-...",
  "status": "pending",
  "total_count": 42,
  "created_at": "2026-05-15T10:00:00Z",
  "poll_url": "/api/v1/amazon/batch/a1b2c3d4-...",
  "webhook_signature_secret": "whsec_..."
}
```

**Get Status**

| Field | Required | Description |
|---|---|---|
| Batch ID | yes | The job ID returned by Create |
| Simplify | no | Return only `{id, status, processed_count, total_count, results}` |

Poll every 30–60 seconds until `status === 'complete'`.

## Credentials

Get your API key at [app.amazonscraperapi.com](https://app.amazonscraperapi.com) — 1,000 free requests, no credit card required.

In n8n:

1. Open the node, click the **Credential to connect with** dropdown, and choose **Create new credential**.
2. Paste your API key into the **API Key** field.
3. Click **Save**. n8n runs a credential test against `GET /api/v1/amazon/product?query=B07THLLDLG&domain=com` to validate the key before saving.

The key is sent on every request as the `X-API-Key` header.

## Compatibility

- Tested against n8n `1.62.x` and newer.
- Node.js `>= 20.15` (matches n8n's runtime).
- No runtime dependencies; the node uses n8n's built-in declarative request runner.

## Usage examples

### Track an ASIN's price daily and alert on drops

```
Schedule Trigger (daily, 09:00)
  → Amazon Scraper API : Product → Get   (ASIN: B09HN3Q81F, Simplify: true)
  → IF $json.price.current < 199
  → Slack : Send Message
```

### Hourly competitor SERP snapshot to Google Sheets

```
Schedule Trigger (hourly)
  → Amazon Scraper API : Search → Search   (Query: "wireless headphones", Sort: price_asc)
  → Google Sheets : Append Row
```

### Bulk price refresh for a 500-ASIN catalog (webhook-driven)

```
Schedule Trigger (every 6h)
  → Read 500 ASINs from Google Sheets
  → Amazon Scraper API : Bulk Lookup → Create   (Webhook URL: <your callback URL>)

Webhook Trigger (the callback URL above)
  → Loop Over Items ($json.results)
  → Update Google Sheets row by ASIN
```

See [WORKFLOW_TEMPLATES.md](./WORKFLOW_TEMPLATES.md) for importable JSON.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Amazon Scraper API docs](https://amazonscraperapi.com/docs)
- [Amazon Scraper API pricing](https://amazonscraperapi.com/pricing)
- [Node.js SDK on npm](https://www.npmjs.com/package/amazon-scraper-api-sdk)
- [Python SDK](https://pypi.org/project/amazonscraperapi-sdk/) · [Go SDK](https://github.com/ChocoData-com/amazon-scraper-api-sdk-go) · [CLI](https://www.npmjs.com/package/amazon-scraper-api-cli) · [MCP server](https://www.npmjs.com/package/amazon-scraper-api-mcp)

## Version history

| Version | Notes |
|---|---|
| 0.1.0 | Initial release — Product Get, Search, Bulk Lookup (Create + Get Status) operations. Declarative-style node with provenance-signed npm release. |

## License

MIT
