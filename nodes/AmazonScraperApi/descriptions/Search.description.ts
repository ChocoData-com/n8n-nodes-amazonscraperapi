import type { INodeProperties } from 'n8n-workflow';
import { DEFAULT_MARKETPLACE, marketplaceOptions } from './SharedOptions';

/**
 * "Search Amazon" operation — wraps GET /api/v1/amazon/search.
 *
 * Required: query.
 * Optional: marketplace, sort_by, start_page, pages (1..10), simplify.
 *
 * Note on pagination: the API accepts `start_page` (1-indexed) and `pages` (how
 * many consecutive pages to scrape, max 10). n8n users typically want a single
 * page from a Schedule trigger, so we default to start_page=1 / pages=1 and
 * surface both inside "Additional Options" rather than the main form.
 */

const showOnlyForSearch = {
	resource: ['search'],
	operation: ['search'],
};

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['search'] } },
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search for a keyword',
				description:
					'Run a keyword search and return the SERP: position, ASIN, title, price, rating, sponsored flag',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/amazon/search',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'results',
								},
							},
							{
								type: 'set',
								properties: {
									value: '={{ $parameter.simplify ? { position: $responseItem.position, asin: $responseItem.asin, title: $responseItem.title, price: $responseItem.price, rating: $responseItem.rating, sponsored: $responseItem.sponsored } : $responseItem }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'search',
	},
];

export const searchFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'wireless headphones',
		description: 'The keyword(s) to search for. Same input as the Amazon search bar.',
		displayOptions: { show: showOnlyForSearch },
		routing: {
			send: {
				type: 'query',
				property: 'query',
			},
		},
	},
	{
		displayName: 'Marketplace',
		name: 'domain',
		type: 'options',
		options: marketplaceOptions,
		default: DEFAULT_MARKETPLACE,
		description: 'Which Amazon marketplace to search. Defaults to amazon.com (US).',
		displayOptions: { show: showOnlyForSearch },
		routing: {
			send: {
				type: 'query',
				property: 'domain',
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description:
			'Whether to return only the most useful fields per result (position, ASIN, title, price, rating, sponsored). Leave off to receive every field per result.',
		displayOptions: { show: showOnlyForSearch },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showOnlyForSearch },
		options: [
			{
				displayName: 'Sort By',
				name: 'sort_by',
				type: 'options',
				default: 'best_match',
				options: [
					{ name: 'Average Customer Review', value: 'avg_customer_review' },
					{ name: 'Best Match', value: 'best_match' },
					{ name: 'Newest Arrivals', value: 'newest' },
					{ name: 'Price: High to Low', value: 'price_desc' },
					{ name: 'Price: Low to High', value: 'price_asc' },
				],
				description: 'Result ordering — mirrors the Amazon sort dropdown',
				routing: {
					send: {
						type: 'query',
						property: 'sort_by',
					},
				},
			},
			{
				displayName: 'Start Page',
				name: 'start_page',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 1,
				description: 'First SERP page to fetch (1-indexed). Default 1.',
				routing: {
					send: {
						type: 'query',
						property: 'start_page',
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'pages',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 1,
				description:
					'How many consecutive SERP pages to fetch starting from "Start Page". Max 10. Each page counts as one billable request.',
				routing: {
					send: {
						type: 'query',
						property: 'pages',
					},
				},
			},
		],
	},
];
