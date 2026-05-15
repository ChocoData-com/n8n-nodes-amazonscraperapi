import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Amazon Scraper API credential.
 *
 * Single field: an API key issued at https://app.amazonscraperapi.com.
 * The key is sent as `X-API-Key` per https://amazonscraperapi.com/docs.
 *
 * The credential test hits GET /api/v1/amazon/product with a known-good ASIN
 * (the Amazon Basics AAA batteries, B07THLLDLG). A 200 confirms the key works
 * and has credit. Test endpoint deliberately uses a low-cost call — Amazon
 * Scraper API only bills on 2xx, so a wrong key returns 401 free of charge.
 */
export class AmazonScraperApiApi implements ICredentialType {
	name = 'amazonScraperApiApi';

	displayName = 'Amazon Scraper API';

	icon: Icon = 'file:../nodes/AmazonScraperApi/amazonscraperapi.svg';

	documentationUrl = 'https://amazonscraperapi.com/docs/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Get your API key from <a href="https://app.amazonscraperapi.com" target="_blank">app.amazonscraperapi.com</a>. The first 1,000 requests are free.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.amazonscraperapi.com',
			url: '/api/v1/amazon/product',
			method: 'GET',
			qs: {
				query: 'B07THLLDLG',
				domain: 'com',
			},
		},
	};
}
