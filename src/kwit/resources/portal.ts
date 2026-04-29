import type { HttpClient } from "../lib/http-client";
import type { CreatePortalSessionParams, PortalSession } from "../types";

export class Portal {
	readonly sessions: PortalSessions;

	constructor(http: HttpClient) {
		this.sessions = new PortalSessions(http);
	}
}

class PortalSessions {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreatePortalSessionParams): Promise<PortalSession> {
		return this.http.post<PortalSession>("/portal/sessions", params);
	}
}
