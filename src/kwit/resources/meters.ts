import type { HttpClient } from "../lib/http-client";
import type { CreateMeterParams, Meter } from "../types";

export class Meters {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateMeterParams): Promise<Meter> {
		return this.http.post<Meter>("/meters", params);
	}

	async list(params?: { active?: boolean; search?: string }): Promise<Meter[]> {
		return this.http.get<Meter[]>(
			"/meters",
			params as Record<string, string | number | boolean | undefined>,
		);
	}

	async update(id: string, params: Partial<CreateMeterParams>): Promise<Meter> {
		return this.http.patch<Meter>(`/meters/${id}`, params);
	}

	async delete(id: string): Promise<void> {
		return this.http.delete(`/meters/${id}`);
	}
}
