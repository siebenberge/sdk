import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookEvent, WebhookEventType } from "../types";

const SIGNATURE_TOLERANCE_SECONDS = 300;

export class Webhooks {
	verify(
		payload: string | Buffer,
		header: string,
		secret: string,
		toleranceInSeconds = SIGNATURE_TOLERANCE_SECONDS,
	): WebhookEvent {
		const body = typeof payload === "string" ? payload : payload.toString("utf8");

		const { timestamp, signature } = parseSignatureHeader(header);

		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - timestamp) > toleranceInSeconds) {
			throw new Error("Webhook signature timestamp is too old");
		}

		const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

		if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
			throw new Error("Invalid webhook signature");
		}

		const parsed = JSON.parse(body);

		return {
			type: parsed.type as WebhookEventType,
			payload: parsed.payload ?? parsed,
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
