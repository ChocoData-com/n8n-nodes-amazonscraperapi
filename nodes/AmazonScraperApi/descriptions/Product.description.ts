import type { INodeProperties } from 'n8n-workflow';
import { DEFAULT_MARKETPLACE, marketplaceOptions } from './SharedOptions';

/**
 * "Get Product" operation — wraps GET /api/v1/amazon/product.
 *
 * Required: query (ASIN or Amazon product URL).
 * Optional: marketplace, language, country (residential IP), simplify, includeRawHtml.
 *
 * "Simplify" is a UX convenience: when enabled, we post-process the response
 * down to {title, price, rating, availability, buybox_seller} so users don't
 * have to wire up a Set node afterwards. Implementation: the `routing.output`
 * postReceive hook reshapes the body — see below.
 */

const showOnlyForProductGet = {
	resource: ['product'],
	operation: ['get'],
};

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['product'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product',
				description:
					'Fetch a structured product JSON for one ASIN: title, price, rating, images, variants, seller, categories',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/amazon/product',
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ $parameter.simplify ? { title: $responseItem.title, price: $responseItem.price, rating: $responseItem.rating, availability: $responseItem.availability, buybox_seller: ($responseItem.buybox && $responseItem.buybox.seller) || null } : $responseItem }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'get',
	},
];

export const productFields: INodeProperties[] = [
	{
		displayName: 'ASIN or URL',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'B09HN3Q81F',
		description:
			'The Amazon ASIN (10 characters) or full Amazon product URL. Examples: <code>B09HN3Q81F</code>, <code>https://www.amazon.com/dp/B09HN3Q81F</code>.',
		displayOptions: { show: showOnlyForProductGet },
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
		description: 'Which Amazon marketplace to scrape. Defaults to amazon.com (US).',
		displayOptions: { show: showOnlyForProductGet },
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
			'Whether to return only the most common fields (title, price, rating, availability, buybox seller). Leave off to receive the full structured response.',
		displayOptions: { show: showOnlyForProductGet },
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showOnlyForProductGet },
		options: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'en_US',
				description:
					'Locale code for the page (e.g. <code>en_US</code>, <code>de_DE</code>). Defaults to the marketplace default.',
				routing: {
					send: {
						type: 'query',
						property: 'language',
					},
				},
			},
			{
				displayName: 'Residential IP Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'DE',
				description:
					'ISO-2 country code for the residential exit IP (e.g. <code>DE</code>, <code>JP</code>). Overrides the default which matches the marketplace.',
				routing: {
					send: {
						type: 'query',
						property: 'country',
					},
				},
			},
			{
				displayName: 'Include Raw HTML',
				name: 'add_html',
				type: 'boolean',
				default: false,
				description: 'Whether to include the raw page HTML alongside the structured JSON',
				routing: {
					send: {
						type: 'query',
						property: 'add_html',
					},
				},
			},
		],
	},
];
