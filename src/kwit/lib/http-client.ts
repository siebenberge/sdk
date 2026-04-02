import { KwitError } from "./errors";

interface HttpClientConfig {
	baseUrl: string;
	apiKey: string;
	maxRetries: number;
	timeout: number;
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const INITIAL_RETRY_DELAY_MS = 500;

export class HttpClient {
	private config: HttpClientConfig;

	constructor(config: HttpClientConfig) {
		this.config = config;
	}

	async get<T>(path: string): Promise<T> {
		return this.request<T>("GET", path);
	}

	async post<T>(path: string, body?: object): Promise<T> {
		return this.request<T>("POST", path, body);
	}

	async patch<T>(path: string, body?: object): Promise<T> {
		return this.request<T>("PATCH", path, body);
	}

	async delete<T>(path: string): Promise<T> {
		return this.request<T>("DELETE", path);
	}

	private async request<T>(method: string, path: string, body?: object): Promise<T> {
		const url = `${this.config.baseUrl}${path}`;
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
			try {
				const response = await fetch(url, {
					method,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${this.config.apiKey}`,
					},
					body: body ? JSON.stringify(body) : undefined,
					signal: AbortSignal.timeout(this.config.timeout),
				});

				if (response.ok) {
					return (await response.json()) as T;
				}

				if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.config.maxRetries) {
					const retryAfter = response.headers.get("retry-after");
					const delay = retryAfter
						? Number.parseInt(retryAfter, 10) * 1000
						: INITIAL_RETRY_DELAY_MS * 2 ** attempt;

					await sleep(delay);
					continue;
				}

				const errorBody = await response
					.json()
					.then((json) => json as string | { error: string | Record<string, string[]> })
					.catch((): string => response.statusText);
				throw new KwitError(response.status, errorBody);
			} catch (error) {
				if (error instanceof KwitError) throw error;

				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt < this.config.maxRetries) {
					await sleep(INITIAL_RETRY_DELAY_MS * 2 ** attempt);
				}
			}
		}

		throw lastError ?? new Error("Request failed after all retries");
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
