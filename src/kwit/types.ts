// ─── SDK Configuration ───────────────────────────────────────────────────────

export interface KwitConfig {
	apiKey: string;
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
	successUrl?: string;
	cancelUrl?: string;
	metadata?: Record<string, unknown>;
}

export type CheckoutSessionStatus = "OPEN" | "COMPLETE" | "EXPIRED";

export type PaymentProvider = "ZAHLS" | "MANUAL";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type CheckoutSessionPriceBillingInterval =
	| "DAILY"
	| "WEEKLY"
	| "MONTHLY"
	| "QUARTERLY"
	| "YEARLY"
	| "ONE_TIME";

export interface CheckoutSessionInvoiceLineItem {
	id: string;
	invoiceId: string;
	description: string;
	quantity: string;
	unitAmount: string;
	amount: string;
	priceId: string | null;
	metadata: Record<string, unknown> | null;
}

export interface CheckoutSessionPayment {
	id: string;
	organizationId: string;
	invoiceId: string;
	amount: string;
	currency: string;
	provider: PaymentProvider;
	providerPaymentId: string | null;
	status: PaymentStatus;
	metadata: Record<string, unknown> | null;
	createdAt: string;
}

export interface CheckoutSessionInvoice {
	id: string;
	organizationId: string;
	customerId: string;
	subscriptionId: string | null;
	number: string;
	status: InvoiceStatus;
	collectionMethod: CollectionMethod;
	currency: string;
	subtotal: string;
	tax: string;
	total: string;
	amountPaid: string;
	amountDue: string;
	dueDate: string;
	paidAt: string | null;
	hostedUrl: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
	lineItems: CheckoutSessionInvoiceLineItem[];
	payments: CheckoutSessionPayment[];
}

export type CheckoutCreatedInvoice = Omit<CheckoutSessionInvoice, "payments">;

export interface CheckoutResult {
	sessionId: string;
	checkoutUrl: string;
	invoice: CheckoutCreatedInvoice;
}

export interface CheckoutSessionPrice {
	id: string;
	productId: string;
	nickname: string | null;
	type: PriceType;
	currency: string;
	amount: string;
	billingInterval: CheckoutSessionPriceBillingInterval;
	intervalCount: number;
	trialDays: number | null;
	active: boolean;
	metadata: Record<string, unknown> | null;
	lookupKey: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CheckoutSessionSubscription {
	id: string;
	organizationId: string;
	customerId: string;
	status: SubscriptionStatus;
	priceId: string;
	authorizedTransactionId: string | null;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	canceledAt: string | null;
	trialStart: string | null;
	trialEnd: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
	price: CheckoutSessionPrice;
}

export interface CheckoutSession {
	id: string;
	organizationId: string;
	customerId: string;
	invoiceId: string;
	subscriptionId: string | null;
	priceId: string;
	status: CheckoutSessionStatus;
	providerGatewayId: string;
	checkoutUrl: string;
	successUrl: string | null;
	cancelUrl: string | null;
	expiresAt: string;
	completedAt: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
	invoice: CheckoutSessionInvoice;
	subscription: CheckoutSessionSubscription | null;
	customer: Customer;
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
