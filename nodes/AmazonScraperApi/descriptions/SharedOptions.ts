import type { INodePropertyOptions } from 'n8n-workflow';

/**
 * Marketplaces accepted by Amazon Scraper API. The `value` is the actual
 * Amazon domain suffix the API expects on the wire (e.g. `co.uk` for the UK
 * marketplace, `com.br` for Brazil). Names are shown in plain English in the
 * dropdown.
 *
 * Keep this list in sync with the canonical list in the public SDK:
 *   https://github.com/ChocoData-com/amazon-scraper-api-sdk-node/blob/main/src/index.ts
 */
export const marketplaceOptions: INodePropertyOptions[] = [
	{ name: 'United States (amazon.com)', value: 'com' },
	{ name: 'United Kingdom (amazon.co.uk)', value: 'co.uk' },
	{ name: 'Germany (amazon.de)', value: 'de' },
	{ name: 'France (amazon.fr)', value: 'fr' },
	{ name: 'Italy (amazon.it)', value: 'it' },
	{ name: 'Spain (amazon.es)', value: 'es' },
	{ name: 'Canada (amazon.ca)', value: 'ca' },
	{ name: 'Japan (amazon.co.jp)', value: 'co.jp' },
	{ name: 'India (amazon.in)', value: 'in' },
	{ name: 'Brazil (amazon.com.br)', value: 'com.br' },
	{ name: 'Mexico (amazon.com.mx)', value: 'com.mx' },
	{ name: 'Australia (amazon.com.au)', value: 'com.au' },
	{ name: 'Netherlands (amazon.nl)', value: 'nl' },
	{ name: 'Poland (amazon.pl)', value: 'pl' },
	{ name: 'Sweden (amazon.se)', value: 'se' },
	{ name: 'Singapore (amazon.sg)', value: 'sg' },
	{ name: 'Turkey (amazon.com.tr)', value: 'com.tr' },
	{ name: 'United Arab Emirates (amazon.ae)', value: 'ae' },
	{ name: 'Saudi Arabia (amazon.sa)', value: 'sa' },
	{ name: 'Egypt (amazon.eg)', value: 'eg' },
];

export const DEFAULT_MARKETPLACE = 'com';
