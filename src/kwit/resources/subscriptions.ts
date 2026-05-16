import type { HttpClient } from "../lib/http-client";
import type { CreateSubscriptionParams, Subscription } from "../types";

export class Subscriptions {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateSubscriptionParams): Promise<Subscription> {
		return this.http.post<Subscription>("/subscriptions", params);
	}

	async retrieve(id: string): Promise<Subscription> {
		return this.http.get<Subscription>(`/subscriptions/${id}`);
	}

	async cancel(id: string, params?: { atPeriodEnd?: boolean }): Promise<Subscription> {
		return this.http.post<Subscription>(`/subscriptions/${id}/cancel`, params);
	}
}
