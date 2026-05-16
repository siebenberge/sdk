import type { HttpClient } from "../lib/http-client";
import type { CreateCheckoutLinkParams, CheckoutLink } from "../types";

export class CheckoutLinks {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateCheckoutLinkParams): Promise<CheckoutLink> {
		return this.http.post<CheckoutLink>("/checkout-links", params);
	}

	async retrieve(id: string): Promise<CheckoutLink> {
		return this.http.get<CheckoutLink>(`/checkout-links/${id}`);
	}
}
