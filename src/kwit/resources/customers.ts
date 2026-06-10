import type { HttpClient } from "../lib/http-client";
import type {
	CreateCustomerParams,
	Customer,
	GrantMeterCreditParams,
	UsageStateEntry,
} from "../types";

export class Customers {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateCustomerParams): Promise<Customer> {
		return this.http.post<Customer>("/customers", params);
	}

	async usageState(customerId: string): Promise<UsageStateEntry[]> {
		return this.http.get<UsageStateEntry[]>(`/customers/${customerId}/state`);
	}

	async grantMeterCredits(customerId: string, params: GrantMeterCreditParams) {
		return this.http.post(`/customers/${customerId}/meter-credits`, params);
	}
}
