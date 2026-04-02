import type { HttpClient } from "../lib/http-client";
import type { CheckoutResult, CheckoutSession, CreateCheckoutParams } from "../types";

export class Checkout {
	readonly sessions: CheckoutSessions;

	constructor(private readonly http: HttpClient) {
		this.sessions = new CheckoutSessions(http);
	}

	async create(params: CreateCheckoutParams): Promise<CheckoutResult> {
		return this.http.post<CheckoutResult>("/checkout", params);
	}
}

class CheckoutSessions {
	constructor(private readonly http: HttpClient) {}

	async retrieve(sessionId: string): Promise<CheckoutSession> {
		return this.http.get<CheckoutSession>(`/checkout/${sessionId}`);
	}
}
