import type { KwitErrorResponse } from "../types";

export class KwitError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details: string | Record<string, string[]> | undefined;

	constructor(status: number, body: KwitErrorResponse | string) {
		const message =
			typeof body === "string"
				? body
				: typeof body.error === "string"
					? body.error
					: "Validation error";

		super(message);
		this.name = "KwitError";
		this.status = status;
		this.code = KwitError.statusToCode(status);
		this.details =
			typeof body === "object" && typeof body.error === "object" ? body.error : undefined;
	}

	private static statusToCode(status: number): string {
		switch (status) {
			case 400:
				return "validation_error";
			case 401:
				return "authentication_error";
			case 404:
				return "not_found";
			case 429:
				return "rate_limit_exceeded";
			default:
				return status >= 500 ? "internal_error" : "api_error";
		}
	}
}
