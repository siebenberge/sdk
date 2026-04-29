import { HttpClient } from "./lib/http-client";
import { Customers } from "./resources/customers";
import { Checkout } from "./resources/checkout";
import { Portal } from "./resources/portal";
import { Webhooks } from "./resources/webhooks";
import type { KwitConfig } from "./types";

const BASE_URL = "https://api.kwit.dev/v1";
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 30_000;

export class Kwit {
	readonly customers: Customers;
	readonly checkout: Checkout;
	readonly portal: Portal;
	readonly webhooks: Webhooks;

	constructor(apiKeyOrConfig: string | KwitConfig) {
		const config: KwitConfig =
			typeof apiKeyOrConfig === "string" ? { apiKey: apiKeyOrConfig } : apiKeyOrConfig;

		const http = new HttpClient({
			baseUrl: BASE_URL,
			apiKey: config.apiKey,
			maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
			timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
		});

		this.customers = new Customers(http);
		this.checkout = new Checkout(http);
		this.portal = new Portal(http);
		this.webhooks = new Webhooks();
	}
}

export default Kwit;
