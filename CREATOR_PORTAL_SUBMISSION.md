# Creator Portal Submission — Manual Handoff

Submit the package at **<https://creators.n8n.io/nodes>** (sign in with the GitHub account that owns the repo, i.e. `ChocoData-com`). The portal is a Nuxt SPA that loads its form fields client-side, so I cannot dump the literal HTML labels — but the order and field set below matches what n8n's docs at <https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/> and existing submitter blog posts describe as of May 2026. Confirm each field name in the live UI; the values below are the answers to paste in.

## Prerequisites (already met)

- [x] Package is published to npm with `n8n-community-node-package` keyword → `n8n-nodes-amazonscraperapi@0.1.0-beta.1`
- [x] MIT license file at repo root
- [x] Public GitHub repo with the source: <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi>
- [x] No runtime dependencies (only `n8n-workflow` as a peer dependency)
- [x] Declarative-style node (required for verification since May 2026)
- [x] `@n8n/scan-community-package` passes (see STATUS.md)
- [x] English-only UI + docs
- [x] 60×60 SVG icon at `nodes/AmazonScraperApi/amazonscraperapi.svg`
- [ ] **Before submitting**: bump version to `0.1.0` (drop `-beta.1`), tag the commit, and let the GitHub Actions workflow publish with provenance. The portal will not accept a beta-only release. See STATUS.md → "Outstanding manual steps".
- [ ] Screenshots — capture from a local n8n run (see "Screenshots" section below)

## Field-by-field answers

### Package info

| Portal field | Answer |
|---|---|
| **npm package name** | `n8n-nodes-amazonscraperapi` |
| **npm package URL** | <https://www.npmjs.com/package/n8n-nodes-amazonscraperapi> |
| **Current version** | `0.1.0` (after the non-beta release) |
| **GitHub repository URL** | <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi> |
| **License** | MIT |

### Description

| Portal field | Answer |
|---|---|
| **Short description** (1 sentence, ~80 chars) | Fetch Amazon product data, run keyword searches, and queue bulk lookups. |
| **Long description** (1-2 paragraphs) | n8n community node for [Amazon Scraper API](https://www.amazonscraperapi.com/). Three operations: fetch a single product by ASIN or URL (`Get Product`), run a keyword search and return the SERP (`Search Amazon`), or queue up to 1,000 ASINs as a single asynchronous batch (`Bulk Lookup`). All 20+ Amazon marketplaces are supported via a dropdown — US, UK, DE, FR, IT, ES, JP, IN, BR, MX, AU, and more. Auth is a single API key sent as `X-API-Key`. Get one (with 1,000 free requests, no credit card) at <https://app.amazonscraperapi.com>. Flat $0.50 per 1,000 successful requests, billed only on 2xx responses. |
| **Categories / tags** | Marketing, Data & Storage |
| **Documentation URL** | <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi#operations> |
| **Authentication / credentials docs URL** | <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi#credentials> |

### Author / contact

| Portal field | Answer |
|---|---|
| **Author name** | ChocoData |
| **Author email** | info@amazonscraperapi.com |
| **Support URL** | <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi/issues> |
| **Homepage** | <https://www.amazonscraperapi.com/> |

### Operations (the portal may ask to list them)

1. **Product → Get** — fetch a structured product JSON for one ASIN
2. **Search → Search** — keyword search returning the SERP
3. **Bulk Lookup → Create** — queue up to 1,000 ASINs as one async job
4. **Bulk Lookup → Get Status** — poll a queued bulk-lookup job

### Workflow templates (optional, separate submission)

Three importable templates ship in `WORKFLOW_TEMPLATES.md`. Submit them via the **Workflows** tab after the node itself is verified:

1. Track Amazon prices → Google Sheets + Slack alerts
2. Daily competitor price monitor → Notion
3. Amazon stock alert → Telegram

## Screenshots — you must capture these locally

The portal requires screenshots of the node in use. The easiest way to capture them:

```bash
# Inside a separate working directory
npx n8n
# In another shell, install the community node into n8n's local data dir:
mkdir -p ~/.n8n/nodes && cd ~/.n8n/nodes
npm install n8n-nodes-amazonscraperapi@beta
# Restart n8n (Ctrl+C the first process, run `npx n8n` again).
# Open http://localhost:5678, sign in, create a credential of type
# "Amazon Scraper API" with your API key, then build a tiny test workflow.
```

Capture these 3 screenshots:

1. **Node palette** — the right-side panel showing the "Amazon Scraper API" tile when you search for "Amazon" (proves discovery works)
2. **Node config panel** — the operation parameters for `Product → Get` filled in with `B09HN3Q81F`, marketplace `US`, Simplify on (proves UI fields render correctly)
3. **Execution output** — the right-hand "Output" tab after a successful run, showing the structured JSON (proves end-to-end auth + scraping work)

Save them as `screenshot-1-palette.png`, `screenshot-2-config.png`, `screenshot-3-output.png` and upload to the portal form. The portal limits filesize to ~5 MB each; keep them under 1920×1080 PNG.

## Submission checklist

- [ ] Bump `package.json` → `0.1.0`, `git commit -am "v0.1.0"`, `git tag 0.1.0`, `git push --follow-tags`
- [ ] Watch GitHub Actions: <https://github.com/ChocoData-com/n8n-nodes-amazonscraperapi/actions> — the `Publish` workflow should run and succeed
- [ ] Confirm npm now lists `0.1.0` as `latest` (was `0.1.0-beta.1` only). The first OIDC release needs npm Trusted Publishers configured — see `.github/workflows/publish.yml` comments
- [ ] Open <https://creators.n8n.io/nodes> → Sign in → "Submit a node"
- [ ] Paste the answers from this file, upload the 3 screenshots
- [ ] Submit → wait 1–3 weeks for review

## After submission

Expect one of three outcomes within ~10 business days:

1. **Approved** — the node appears in the n8n in-app palette with a "verified" badge and is installable on n8n Cloud (not just self-hosted).
2. **Changes requested** — review the comments in the portal thread, push fixes, bump the patch version, request re-review.
3. **Rejected** — typically when the package collides with an existing first-party node or when the auth method violates n8n's policy. Neither applies here.

n8n notifies via email at `info@amazonscraperapi.com` (the address attached to the GitHub account that submits).
