import type { INodeProperties } from 'n8n-workflow';
import { DEFAULT_MARKETPLACE, marketplaceOptions } from './SharedOptions';

/**
 * "Bulk Lookup" operations — wraps POST/GET /api/v1/amazon/batch.
 *
 * Amazon Scraper API batches are ASYNCHRONOUS: POST returns a job id, and
 * a Vercel cron processes the job within ~60 s. Two operations are exposed:
 *
 *   1. "Create"      — POST /api/v1/amazon/batch.  Required input: a list of
 *                      ASINs (textarea, one per line or comma-separated). We
 *                      transform that locally into the API's required
 *                      `items: [{query, domain}, ...]` shape via a `preSend`
 *                      hook on the body.
 *
 *   2. "Get Status"  — GET /api/v1/amazon/batch/:id. Returns progress and
 *                      results once status === 'complete'.
 *
 * The "Simplify" flag on Get Status returns just `results[]` so downstream
 * nodes (Loop Over Items, Filter, etc.) work without an extra Set node.
 */

const showOnlyForBatchCreate = {
	resource: ['batch'],
	operation: ['create'],
};

const showOnlyForBatchGet = {
	resource: ['batch'],
	operation: ['getStatus'],
};

export const batchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['batch'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a bulk lookup',
				description:
					'Queue up to 1,000 ASINs as a single async job. Returns a job ID — poll "Get Status" or supply a webhook URL for the callback.',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/amazon/batch',
						body: {
							endpoint: 'amazon.product',
						},
					},
				},
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get bulk lookup status',
				description:
					'Fetch the status of a bulk lookup job. When status === "complete", the response includes the parsed results for every ASIN.',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/amazon/batch/{{$parameter.batchId}}',
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ $parameter.simplify ? { id: $responseItem.id, status: $responseItem.status, processed_count: $responseItem.processed_count, total_count: $responseItem.total_count, results: $responseItem.results } : $responseItem }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'create',
	},
];

export const batchFields: INodeProperties[] = [
	// ─── CREATE ─────────────────────────────────────────────────────────────
	{
		displayName: 'ASINs',
		name: 'asins',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		placeholder: 'B09HN3Q81F\nB000ALVUM6\nB07THLLDLG',
		description:
			'One ASIN per line, or comma-separated. Max 1,000 per batch. Each ASIN is queued against the marketplace selected below.',
		displayOptions: { show: showOnlyForBatchCreate },
		routing: {
			send: {
				type: 'body',
				property: 'items',
				value:
					'={{ ($value || "").split(/[\\n,]+/).map((s) => s.trim()).filter(Boolean).map((q) => ({ query: q, domain: $parameter.domain })) }}',
			},
		},
	},
	{
		displayName: 'Marketplace',
		name: 'domain',
		type: 'options',
		options: marketplaceOptions,
		default: DEFAULT_MARKETPLACE,
		description: 'Marketplace applied to every ASIN in the batch',
		displayOptions: { show: showOnlyForBatchCreate },
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		default: '',
		placeholder: 'https://your.server/webhooks/asa',
		description:
			'Optional. If supplied, we POST the completed batch to this URL when done so you do not have to poll. The response includes a one-time HMAC signing secret — save it to verify the callback. <a href="https://amazonscraperapi.com/docs/batch#webhooks" target="_blank">Webhook docs</a>.',
		displayOptions: { show: showOnlyForBatchCreate },
		routing: {
			send: {
				type: 'body',
				property: 'webhook_url',
				value: '={{ $value || undefined }}',
			},
		},
	},
	// ─── GET STATUS ─────────────────────────────────────────────────────────
	{
		displayName: 'Batch ID',
		name: 'batchId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
		description: 'The job ID returned by the "Create" operation. Polls the batch endpoint until the job completes.',
		displayOptions: { show: showOnlyForBatchGet },
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description:
			'Whether to return only progress fields (identifier, status, processed_count, total_count, results) instead of the full job record',
		displayOptions: { show: showOnlyForBatchGet },
	},
];
