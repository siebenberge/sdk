import type { HttpClient } from "../lib/http-client";
import type { CreateDiscountParams, Discount, ValidateDiscountParams } from "../types";

export class Discounts {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateDiscountParams): Promise<Discount> {
		return this.http.post<Discount>("/discounts", params);
	}

	async retrieve(id: string): Promise<Discount> {
		return this.http.get<Discount>(`/discounts/${id}`);
	}

	async validate(params: ValidateDiscountParams): Promise<Discount> {
		return this.http.post<Discount>("/discounts/validate", params);
	}
}
