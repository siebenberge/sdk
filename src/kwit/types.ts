// ─── SDK Configuration ───────────────────────────────────────────────────────

export interface KwitConfig {
	apiKey: string;
	baseUrl?: string;
	maxRetries?: number;
	timeout?: number;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
	line1?: string;
	line2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CollectionMethod = "CHARGE_AUTOMATICALLY" | "SEND_INVOICE";

export interface CreateCustomerParams {
	email: string;
	externalId?: string;
	name?: string;
	phone?: string;
	address?: Address;
	currency?: string;
	collectionMethod?: CollectionMethod;
	metadata?: Record<string, unknown>;
}

export interface Customer {
	id: string;
	organizationId: string;
	externalId: string | null;
	email: string;
	name: string | null;
	phone: string | null;
	address: Address | null;
	currency: string;
	collectionMethod: CollectionMethod;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

// ─── Price ───────────────────────────────────────────────────────────────────

export type PriceType = "FLAT" | "PER_UNIT" | "TIERED" | "VOLUME";
export type BillingInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface Price {
	id: string;
	type: PriceType;
	amount: string;
	currency: string;
	billingInterval: BillingInterval;
	intervalCount: number;
	nickname: string | null;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export type SubscriptionStatus =
	| "ACTIVE"
	| "TRIALING"
	| "PAST_DUE"
	| "CANCELED"
	| "UNPAID"
	| "INCOMPLETE"
	| "PAUSED";

export interface SubscriptionItem {
	id: string;
	priceId: string;
	quantity: number;
	price: Price;
}

export interface Subscription {
	id: string;
	organizationId: string;
	customerId: string;
	status: SubscriptionStatus;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	trialStart: string | null;
	trialEnd: string | null;
	canceledAt: string | null;
	metadata: Record<string, unknown> | null;
	items: SubscriptionItem[];
	customer: {
		id: string;
		email: string;
		name: string | null;
	};
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";

export interface InvoiceLineItem {
	description: string;
	quantity: string;
	unitAmount: string;
	amount: string;
}

export interface Invoice {
	id: string;
	number: string;
	status: InvoiceStatus;
	currency: string;
	subtotal: string;
	tax: string;
	total: string;
	amountPaid: string;
	amountDue: string;
	dueDate: string | null;
	lineItems: InvoiceLineItem[];
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export interface CreateCheckoutParams {
	customerId: string;
	priceId: string;
	quantity?: number;
	successUrl?: string;
	cancelUrl?: string;
	metadata?: Record<string, unknown>;
}

export interface CheckoutResult {
	subscription: Subscription;
	invoice: Invoice;
	successUrl: string;
	cancelUrl: string;
}

export type CheckoutSessionStatus = "OPEN" | "COMPLETE" | "EXPIRED";

export interface CheckoutSession {
	id: string;
	status: CheckoutSessionStatus;
	customerId: string;
	priceId: string;
	invoiceId: string;
	subscriptionId: string | null;
	successUrl: string | null;
	cancelUrl: string | null;
	metadata: Record<string, unknown> | null;
	completedAt: string | null;
	createdAt: string;
}

// ─── Webhook Events ──────────────────────────────────────────────────────────

export const WEBHOOK_EVENTS = [
	"subscription.created",
	"subscription.updated",
	"subscription.canceled",
	"subscription.renewed",
	"subscription.payment_failed",
	"subscription.payment_succeeded",
	"invoice.created",
	"invoice.paid",
	"invoice.voided",
	"customer.created",
	"customer.updated",
	"customer.deleted",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export interface WebhookEvent<T = Record<string, unknown>> {
	type: WebhookEventType;
	payload: T;
	timestamp: number;
}

// ─── Error ───────────────────────────────────────────────────────────────────

export interface KwitErrorResponse {
	error: string | Record<string, string[]>;
}
