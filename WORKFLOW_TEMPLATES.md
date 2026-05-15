# Workflow Templates for n8n-nodes-amazonscraperapi

Three importable n8n workflow templates. Each is a self-contained JSON object — open the n8n editor, choose **Import from File** (or paste into a new workflow's JSON view), then connect your `Amazon Scraper API` credential.

All three assume:

- You have the `n8n-nodes-amazonscraperapi` community node installed (Settings → Community Nodes → Install → `n8n-nodes-amazonscraperapi`).
- You have a credential of type **Amazon Scraper API** saved with your API key from [app.amazonscraperapi.com](https://app.amazonscraperapi.com).

The downstream destinations (Slack, Notion, Telegram, Google Sheets) use **placeholder credentials** — replace them with your own before running.

---

## 1) Track Amazon prices → Google Sheets + Slack alerts

Daily price scrape for a list of ASINs you store in a Google Sheet. Appends a row to a history sheet on every run, and posts a Slack message whenever the current price drops below a target.

```json
{
  "name": "Amazon price tracker — Sheets + Slack",
  "nodes": [
    {
      "id": "schedule",
      "name": "Every day at 09:00",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 9 * * *" }]
        }
      }
    },
    {
      "id": "readAsins",
      "name": "Read ASINs from Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [460, 300],
      "parameters": {
        "operation": "read",
        "documentId": { "__rl": true, "mode": "list", "value": "REPLACE_WITH_YOUR_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "list", "value": "ASINs" },
        "options": {}
      },
      "credentials": {
        "googleSheetsOAuth2Api": { "id": "REPLACE", "name": "Google Sheets account" }
      }
    },
    {
      "id": "scrape",
      "name": "Get Amazon product",
      "type": "n8n-nodes-amazonscraperapi.amazonScraperApi",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "resource": "product",
        "operation": "get",
        "query": "={{$json[\"asin\"]}}",
        "domain": "={{$json[\"marketplace\"] || \"com\"}}",
        "simplify": true
      },
      "credentials": {
        "amazonScraperApiApi": { "id": "REPLACE", "name": "Amazon Scraper API account" }
      }
    },
    {
      "id": "appendHistory",
      "name": "Append price history",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [940, 300],
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "mode": "list", "value": "REPLACE_WITH_YOUR_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "list", "value": "history" },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "asin": "={{$node[\"readAsins\"].json[\"asin\"]}}",
            "title": "={{$json[\"title\"]}}",
            "current_price": "={{$json[\"price\"][\"current\"]}}",
            "currency": "={{$json[\"price\"][\"currency\"]}}",
            "availability": "={{$json[\"availability\"]}}",
            "scraped_at": "={{$now}}"
          }
        }
      },
      "credentials": {
        "googleSheetsOAuth2Api": { "id": "REPLACE", "name": "Google Sheets account" }
      }
    },
    {
      "id": "priceCheck",
      "name": "Below target price?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.1,
      "position": [940, 480],
      "parameters": {
        "conditions": {
          "options": { "version": 2 },
          "combinator": "and",
          "conditions": [
            {
              "id": "1",
              "operator": { "type": "number", "operation": "lt" },
              "leftValue": "={{$json[\"price\"][\"current\"]}}",
              "rightValue": "={{$node[\"readAsins\"].json[\"target_price\"]}}"
            }
          ]
        }
      }
    },
    {
      "id": "slack",
      "name": "Slack alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.3,
      "position": [1180, 480],
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#price-drops",
        "text": "=:bell: *Price drop on {{$json[\"title\"]}}*\\nNow ${{$json[\"price\"][\"current\"]}} (target ${{$node[\"readAsins\"].json[\"target_price\"]}})\\nhttps://www.amazon.com/dp/{{$node[\"readAsins\"].json[\"asin\"]}}"
      },
      "credentials": {
        "slackApi": { "id": "REPLACE", "name": "Slack account" }
      }
    }
  ],
  "connections": {
    "Every day at 09:00": { "main": [[{ "node": "Read ASINs from Google Sheets", "type": "main", "index": 0 }]] },
    "Read ASINs from Google Sheets": { "main": [[{ "node": "Get Amazon product", "type": "main", "index": 0 }]] },
    "Get Amazon product": { "main": [[{ "node": "Append price history", "type": "main", "index": 0 }, { "node": "Below target price?", "type": "main", "index": 0 }]] },
    "Below target price?": { "main": [[{ "node": "Slack alert", "type": "main", "index": 0 }], []] }
  }
}
```

**Sheet schema expected by this template** — columns `asin`, `marketplace`, `target_price` on the first tab named `ASINs`; columns `asin, title, current_price, currency, availability, scraped_at` on a second tab named `history`.

---

## 2) Daily competitor price monitor → Notion

Daily keyword-search snapshot for one or more search terms. The top 5 results are upserted into a Notion database so you can track who's ranking and at what price over time.

```json
{
  "name": "Amazon competitor monitor — Notion",
  "nodes": [
    {
      "id": "schedule",
      "name": "Every day at 08:00",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 8 * * *" }]
        }
      }
    },
    {
      "id": "keywords",
      "name": "Keywords to monitor",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 300],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "1",
              "name": "queries",
              "type": "array",
              "value": "=[\"wireless headphones\", \"mechanical keyboard\", \"4k monitor\"]"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "splitOut",
      "name": "Split keywords",
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [680, 300],
      "parameters": { "fieldToSplitOut": "queries", "options": {} }
    },
    {
      "id": "search",
      "name": "Search Amazon",
      "type": "n8n-nodes-amazonscraperapi.amazonScraperApi",
      "typeVersion": 1,
      "position": [900, 300],
      "parameters": {
        "resource": "search",
        "operation": "search",
        "query": "={{$json[\"queries\"]}}",
        "domain": "com",
        "simplify": true,
        "additionalOptions": {
          "sort_by": "best_match",
          "start_page": 1,
          "pages": 1
        }
      },
      "credentials": {
        "amazonScraperApiApi": { "id": "REPLACE", "name": "Amazon Scraper API account" }
      }
    },
    {
      "id": "limit",
      "name": "Top 5 results only",
      "type": "n8n-nodes-base.limit",
      "typeVersion": 1,
      "position": [1140, 300],
      "parameters": { "maxItems": 5 }
    },
    {
      "id": "notion",
      "name": "Upsert into Notion DB",
      "type": "n8n-nodes-base.notion",
      "typeVersion": 2.2,
      "position": [1380, 300],
      "parameters": {
        "resource": "databasePage",
        "operation": "create",
        "databaseId": { "__rl": true, "mode": "list", "value": "REPLACE_WITH_NOTION_DB_ID" },
        "propertiesUi": {
          "propertyValues": [
            { "key": "Keyword|title", "title": "={{$node[\"Split keywords\"].json[\"queries\"]}}" },
            { "key": "ASIN|rich_text", "richText": "={{$json[\"asin\"]}}" },
            { "key": "Title|rich_text", "richText": "={{$json[\"title\"]}}" },
            { "key": "Position|number", "numberValue": "={{$json[\"position\"]}}" },
            { "key": "Price|number", "numberValue": "={{$json[\"price\"][\"current\"]}}" },
            { "key": "Sponsored|checkbox", "checkboxValue": "={{$json[\"sponsored\"]}}" },
            { "key": "Captured At|date", "date": "={{$now}}" }
          ]
        }
      },
      "credentials": {
        "notionApi": { "id": "REPLACE", "name": "Notion account" }
      }
    }
  ],
  "connections": {
    "Every day at 08:00": { "main": [[{ "node": "Keywords to monitor", "type": "main", "index": 0 }]] },
    "Keywords to monitor": { "main": [[{ "node": "Split keywords", "type": "main", "index": 0 }]] },
    "Split keywords": { "main": [[{ "node": "Search Amazon", "type": "main", "index": 0 }]] },
    "Search Amazon": { "main": [[{ "node": "Top 5 results only", "type": "main", "index": 0 }]] },
    "Top 5 results only": { "main": [[{ "node": "Upsert into Notion DB", "type": "main", "index": 0 }]] }
  }
}
```

**Notion DB schema expected**: `Keyword` (title), `ASIN` (text), `Title` (text), `Position` (number), `Price` (number), `Sponsored` (checkbox), `Captured At` (date).

---

## 3) Amazon stock alert → Telegram

Every 15 minutes, check whether a tracked ASIN is back in stock. Sends a Telegram message the moment availability changes from "Out of Stock" to anything else.

```json
{
  "name": "Amazon stock alert — Telegram",
  "nodes": [
    {
      "id": "schedule",
      "name": "Every 15 minutes",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "minutes", "minutesInterval": 15 }]
        }
      }
    },
    {
      "id": "scrape",
      "name": "Get product",
      "type": "n8n-nodes-amazonscraperapi.amazonScraperApi",
      "typeVersion": 1,
      "position": [460, 300],
      "parameters": {
        "resource": "product",
        "operation": "get",
        "query": "B0BDHB9Y8H",
        "domain": "com",
        "simplify": true
      },
      "credentials": {
        "amazonScraperApiApi": { "id": "REPLACE", "name": "Amazon Scraper API account" }
      }
    },
    {
      "id": "inStock",
      "name": "Is it in stock?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.1,
      "position": [680, 300],
      "parameters": {
        "conditions": {
          "options": { "version": 2 },
          "combinator": "and",
          "conditions": [
            {
              "id": "1",
              "operator": { "type": "string", "operation": "notContains" },
              "leftValue": "={{$json[\"availability\"] || \"\"}}",
              "rightValue": "Out of Stock"
            },
            {
              "id": "2",
              "operator": { "type": "string", "operation": "notContains" },
              "leftValue": "={{$json[\"availability\"] || \"\"}}",
              "rightValue": "Unavailable"
            }
          ]
        }
      }
    },
    {
      "id": "dedupe",
      "name": "Only fire on transition",
      "type": "n8n-nodes-base.removeDuplicates",
      "typeVersion": 2,
      "position": [900, 220],
      "parameters": {
        "operation": "removeItemsSeenInPreviousExecutions",
        "compare": "selectedFields",
        "fieldsToCompare": "availability",
        "options": {}
      }
    },
    {
      "id": "telegram",
      "name": "Send Telegram message",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [1120, 220],
      "parameters": {
        "resource": "message",
        "operation": "sendMessage",
        "chatId": "REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID",
        "text": "=:rocket: *Back in stock!* *{{$json[\"title\"]}}*\\nPrice: ${{$json[\"price\"][\"current\"]}}\\nStatus: {{$json[\"availability\"]}}\\nhttps://www.amazon.com/dp/B0BDHB9Y8H"
      },
      "credentials": {
        "telegramApi": { "id": "REPLACE", "name": "Telegram account" }
      }
    }
  ],
  "connections": {
    "Every 15 minutes": { "main": [[{ "node": "Get product", "type": "main", "index": 0 }]] },
    "Get product": { "main": [[{ "node": "Is it in stock?", "type": "main", "index": 0 }]] },
    "Is it in stock?": { "main": [[{ "node": "Only fire on transition", "type": "main", "index": 0 }], []] },
    "Only fire on transition": { "main": [[{ "node": "Send Telegram message", "type": "main", "index": 0 }]] }
  }
}
```

The `removeItemsSeenInPreviousExecutions` step is the trick — it dedupes by the `availability` string across runs, so you only get pinged the **first** time the value changes from "Out of Stock" to "In Stock". Reset its state via the node's "Clear State" button if you want a fresh alert.

---

## Submitting these to the n8n template gallery

Once the package is verified on the Creator Portal, the same portal accepts workflow template submissions. For each template above:

1. Import the JSON into your local n8n.
2. Replace the placeholder credentials with real ones and confirm it runs.
3. Take a screenshot of the canvas (the portal requires one).
4. Open the Creator Portal **Workflows** tab → New submission.
5. Paste the JSON, add the screenshot, fill the title/description, and submit.

Approval timeline is the same 1–3 weeks as the node itself.
