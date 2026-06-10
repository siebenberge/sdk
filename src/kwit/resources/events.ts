import type { HttpClient } from "../lib/http-client";
import type {
	IngestUsageEventsParams,
	IngestUsageEventsResult,
	ListUsageEventsParams,
	UsageEvent,
} from "../types";

export class Events {
	constructor(private readonly http: HttpClient) {}

	async ingest(params: IngestUsageEventsParams): Promise<IngestUsageEventsResult> {
		return this.http.post<IngestUsageEventsResult>("/events/ingest", params);
	}

	async list(params?: ListUsageEventsParams): Promise<{
		data: UsageEvent[];
		total: number;
		page: number;
		perPage: number;
	}> {
		return this.http.get<{ data: UsageEvent[]; total: number; page: number; perPage: number }>(
			"/events",
			params as Record<string, string | number | boolean | undefined>,
		);
	}
}
