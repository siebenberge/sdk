import type { HttpClient } from "../lib/http-client";
import type { CreateCustomerParams, Customer } from "../types";

export class Customers {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateCustomerParams): Promise<Customer> {
		return this.http.post<Customer>("/customers", params);
	}
}
