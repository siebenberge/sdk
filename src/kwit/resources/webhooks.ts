import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookEvent, WebhookEventType } from "../types";

const SIGNATURE_TOLERANCE_SECONDS = 300;

export class Webhooks {
	/**
	 * Verify and parse an incoming Kwit webhook request.
	 *
	 * @param payload  - The raw request body (string or Buffer)
	 * @param signatureHeader - The `Kwit-Signature` header value (`t=...,v1=...`)
	 * @param eventHeader - The `Kwit-Event` header value (e.g. `customer.created`)
	 * @param secret - Your webhook endpoint secret
	 * @param toleranceInSeconds - Max age of the signature in seconds (default 300)
	 */
	verify(
		payload: string | Buffer,
		signatureHeader: string,
		eventHeader: string,
		secret: string,
		toleranceInSeconds = SIGNATURE_TOLERANCE_SECONDS,
	): WebhookEvent {
		const body = typeof payload === "string" ? payload : payload.toString("utf8");

		const { timestamp, signature } = parseSignatureHeader(signatureHeader);

		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - timestamp) > toleranceInSeconds) {
			throw new Error("Webhook signature timestamp is too old");
		}

		const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

		if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
			throw new Error("Invalid webhook signature");
		}

		return {
			type: eventHeader as WebhookEventType,
			payload: JSON.parse(body),
			timestamp,
		};
	}
}

function parseSignatureHeader(header: string): { timestamp: number; signature: string } {
	const parts = header.split(",");
	let timestamp = 0;
	let signature = "";

	for (const part of parts) {
		const [key, value] = part.split("=");
		if (key === "t") timestamp = Number.parseInt(value, 10);
		if (key === "v1") signature = value;
	}

	if (!timestamp || !signature) {
		throw new Error("Invalid Kwit-Signature header format");
	}

	return { timestamp, signature };
}
