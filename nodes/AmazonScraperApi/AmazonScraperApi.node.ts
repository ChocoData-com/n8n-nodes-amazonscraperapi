import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import {
	batchFields,
	batchOperations,
	productFields,
	productOperations,
	searchFields,
	searchOperations,
} from './descriptions';

/**
 * Amazon Scraper API n8n community node.
 *
 * Declarative-style node — all HTTP calls are wired up via the `routing`
 * blocks in the per-operation description files. No `execute()` method is
 * needed; n8n's built-in request runner handles auth (via the
 * AmazonScraperApiApi credential's `X-API-Key` header), retries, and error
 * mapping.
 *
 * Three resources are exposed:
 *
 *   - product  → GET /api/v1/amazon/product   (1 op: "Get")
 *   - search   → GET /api/v1/amazon/search    (1 op: "Search")
 *   - batch    → POST/GET /api/v1/amazon/batch (2 ops: "Create", "Get Status")
 *
 * `usableAsTool = true` makes this node available as a tool inside an AI Agent
 * — Amazon Scraper API is the kind of utility an LLM-driven workflow will
 * reach for ("scrape this ASIN before drafting the email"), so opting in is
 * a free win.
 */
export class AmazonScraperApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Amazon Scraper API',
		name: 'amazonScraperApi',
		icon: 'file:amazonscraperapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Fetch Amazon product data, run keyword searches, and queue bulk lookups via Amazon Scraper API',
		defaults: {
			name: 'Amazon Scraper API',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'amazonScraperApiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.amazonscraperapi.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bulk Lookup',
						value: 'batch',
						description: 'Queue up to 1,000 ASINs as one async batch job',
					},
					{
						name: 'Product',
						value: 'product',
						description: 'Fetch a single Amazon product by ASIN or URL',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Run a keyword search and return the SERP',
					},
				],
				default: 'product',
			},
			...productOperations,
			...productFields,
			...searchOperations,
			...searchFields,
			...batchOperations,
			...batchFields,
		],
	};
}
