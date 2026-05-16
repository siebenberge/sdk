# @kwit/sdk

Official TypeScript SDK for the [Kwit](https://kwit.dev) billing API.

## Installation

```bash
npm install @kwit/sdk
# or
yarn add @kwit/sdk
# or
pnpm add @kwit/sdk
# or
bun add @kwit/sdk
```

## Quick Start

```typescript
import Kwit from "@kwit/sdk";

const kwit = new Kwit("kwit_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

const customer = await kwit.customers.create({
  externalId: "cus_ext_123",
  email: "john.doe@example.com",
  name: "John Doe",
});

const checkout = await kwit.checkout.create({
  customerId: customer.id,
  priceId: "price-uuid-from-dashboard",
  successUrl: "https://your-app.com/success",
  cancelUrl: "https://your-app.com/cancel",
});
```

## Configuration

Pass an API key string for defaults, or an object for full control:

```typescript
const kwit = new Kwit({
  apiKey: "kwit_live_xxx",
  maxRetries: 3,   // default: 2
  timeout: 15_000, // default: 30000 (ms)
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | **Required.** Your API key from the Kwit dashboard (Developers → API Keys) |
| `maxRetries` | `number` | `2` | Number of retries on 429 / 5xx responses with exponential backoff |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

---

## Customers

### `kwit.customers.create(params)`

Create a new customer scoped to your organization.

```typescript
const customer = await kwit.customers.create({
  externalId: "cus_ext_123",
  email: "jane.doe@example.com",
  name: "Jane Doe",
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Customer email address |
| `externalId` | `string` | No | Your own identifier for this customer |
| `name` | `string` | No | Display name |
| `phone` | `string` | No | Phone number |
| `address` | `Address` | No | Structured address (see below) |
| `currency` | `string` | No | 3-letter ISO currency code (default: `CHF`) |
| `collectionMethod` | `string` | No | `"CHARGE_AUTOMATICALLY"` or `"SEND_INVOICE"` |
| `metadata` | `object` | No | Arbitrary key-value pairs |

**Address**

| Field | Type | Description |
|-------|------|-------------|
| `line1` | `string` | Street address |
| `line2` | `string` | Apartment, suite, etc. |
| `city` | `string` | City |
| `state` | `string` | State / canton |
| `postalCode` | `string` | Postal code |
| `country` | `string` | 2-letter ISO country code |

**Returns** → `Customer`

---

## Checkout

### `kwit.checkout.create(params)`

Create a checkout session for a customer, generate the first invoice, and finalize it in a single call.

```typescript
const result = await kwit.checkout.create({
  customerId: "a1b2c3d4-...",
  priceId: "p1q2r3s4-...",
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/cancel",
});

console.log(result.sessionId);         // checkout session UUID
console.log(result.checkoutUrl);       // hosted payment URL
console.log(result.invoice.number);    // INV-0001
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | `string` | Yes | UUID of an existing customer |
| `productId` | `string` | Yes | UUID of the product to subscribe to |
| `checkoutLinkId` | `string` | No | UUID of a checkout link to associate |
| `successUrl` | `string` | No | URL to redirect after successful checkout |
| `cancelUrl` | `string` | No | URL to redirect if checkout is canceled |
| `discountId` | `string` | No | UUID of a discount to apply |
| `metadata` | `object` | No | Arbitrary key-value pairs |

**Returns** → `CheckoutResult`

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | `string` | Created checkout session ID |
| `checkoutUrl` | `string` | Hosted URL where the customer completes payment |
| `invoice` | `CheckoutCreatedInvoice` | Invoice for this checkout (same shape as session invoice without `payments`) |

### `kwit.checkout.sessions.retrieve(sessionId)`

Retrieve an existing checkout session by ID.

```typescript
const session = await kwit.checkout.sessions.retrieve("session-uuid");

console.log(session.status); // "OPEN" | "COMPLETE" | "EXPIRED"
```

**Returns** → `CheckoutSession`

---

## Customer Portal

### `kwit.portal.sessions.create(params)`

Create a short-lived portal session for an existing customer. Redirect them to the
returned `url` so they can update their contact info, manage subscriptions, and edit
billing details on a Kwit-hosted page.

```typescript
const portal = await kwit.portal.sessions.create({
  customerId: "a1b2c3d4-...",
  returnUrl: "https://your-app.com/account",
});

console.log(portal.url);       // https://kwit.dev/portal/ps_xxx (valid 1h)
console.log(portal.expiresAt); // ISO timestamp
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | `string` | Yes | UUID of an existing customer |
| `returnUrl` | `string` | No | URL the portal can link back to (e.g. your account page) |

**Returns** → `PortalSession`

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | `string` | Created portal session ID |
| `url` | `string` | Hosted portal URL — redirect your customer here |
| `expiresAt` | `string` | ISO timestamp when the session token stops working |

---

## Products

### `kwit.products.create(params)`

Create a new product with pricing.

```typescript
const product = await kwit.products.create({
  name: "Pro Plan",
  type: "FLAT",
  currency: "CHF",
  amount: 7900,
  billingInterval: "MONTHLY",
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Product display name |
| `description` | `string` | No | Product description |
| `type` | `string` | Yes | Price type: `"FLAT"`, `"PER_UNIT"`, `"TIERED"`, `"VOLUME"` |
| `currency` | `string` | Yes | 3-letter ISO currency code |
| `amount` | `number` | Yes | Price amount in smallest currency unit (e.g. cents) |
| `billingInterval` | `string` | Yes | `"DAILY"`, `"WEEKLY"`, `"MONTHLY"`, `"QUARTERLY"`, `"YEARLY"`, `"ONE_TIME"` |
| `intervalCount` | `number` | No | Number of intervals between billings |
| `trialDays` | `number \| null` | No | Number of trial days |
| `active` | `boolean` | No | Whether the product is active |
| `metadata` | `object` | No | Arbitrary key-value pairs |
| `lookupKey` | `string` | No | Unique key for programmatic lookup |

**Returns** → `Product`

### `kwit.products.retrieve(id)`

Retrieve a product by its ID.

```typescript
const product = await kwit.products.retrieve("product-uuid");
```

**Returns** → `Product`

### `kwit.products.list(params?)`

List products with optional filtering and pagination.

```typescript
const { data, total, page, perPage } = await kwit.products.list({
  active: true,
  page: 1,
  perPage: 20,
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `active` | `boolean` | No | Filter by active status |
| `page` | `number` | No | Page number |
| `perPage` | `number` | No | Items per page |

**Returns** → `ProductListResult`

---

## Discounts

### `kwit.discounts.create(params)`

Create a discount (coupon) that can be applied to checkouts and subscriptions.

```typescript
const discount = await kwit.discounts.create({
  name: "Launch 20%",
  code: "LAUNCH20",
  type: "PERCENTAGE",
  value: 20,
  duration: "REPEATING",
  durationInMonths: 3,
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Discount display name |
| `code` | `string` | No | Promo code customers can enter |
| `type` | `string` | Yes | `"PERCENTAGE"` or `"FIXED"` |
| `value` | `number` | Yes | Discount value (percentage or fixed amount) |
| `duration` | `string` | Yes | `"ONCE"`, `"REPEATING"`, or `"FOREVER"` |
| `durationInMonths` | `number` | No | Required when duration is `"REPEATING"` |
| `maxRedemptions` | `number` | No | Maximum number of times this discount can be used |
| `startsAt` | `string` | No | ISO timestamp when the discount becomes valid |
| `endsAt` | `string` | No | ISO timestamp when the discount expires |
| `productIds` | `string[]` | No | Restrict discount to specific product IDs |
| `active` | `boolean` | No | Whether the discount is active |
| `metadata` | `object` | No | Arbitrary key-value pairs |

**Returns** → `Discount`

### `kwit.discounts.retrieve(id)`

Retrieve a discount by its ID.

```typescript
const discount = await kwit.discounts.retrieve("discount-uuid");
```

**Returns** → `Discount`

### `kwit.discounts.validate(params)`

Validate a discount code and return the resolved discount if valid.

```typescript
const discount = await kwit.discounts.validate({
  code: "LAUNCH20",
  productId: "product-uuid",
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | The discount code to validate |
| `productId` | `string` | No | Product ID to check discount applicability |

**Returns** → `Discount` (or throws 404 if invalid)

---

## Subscriptions

### `kwit.subscriptions.create(params)`

Create a subscription for a customer directly (without a checkout session).

```typescript
const subscription = await kwit.subscriptions.create({
  customerId: "customer-uuid",
  productId: "product-uuid",
  discountId: "discount-uuid",
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | `string` | Yes | UUID of an existing customer |
| `productId` | `string` | Yes | UUID of the product to subscribe to |
| `authorizedTransactionId` | `string` | No | Pre-authorized transaction ID |
| `startAt` | `string` | No | ISO timestamp for delayed start |
| `discountId` | `string` | No | UUID of a discount to apply |
| `metadata` | `object` | No | Arbitrary key-value pairs |

**Returns** → `Subscription`

### `kwit.subscriptions.retrieve(id)`

Retrieve a subscription by its ID.

```typescript
const subscription = await kwit.subscriptions.retrieve("subscription-uuid");
```

**Returns** → `Subscription`

### `kwit.subscriptions.cancel(id, params?)`

Cancel a subscription immediately or at the end of the current billing period.

```typescript
const subscription = await kwit.subscriptions.cancel("subscription-uuid", {
  atPeriodEnd: true,
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `atPeriodEnd` | `boolean` | No | If `true`, cancel at end of period instead of immediately |

**Returns** → `Subscription`

---

## Checkout Links

### `kwit.checkoutLinks.create(params)`

Create a reusable, shareable checkout link for one or more products.

```typescript
const link = await kwit.checkoutLinks.create({
  label: "Pro Plan Checkout",
  productIds: ["product-uuid-1"],
  successUrl: "https://your-app.com/success",
  discountId: "discount-uuid",
});
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Display label for the checkout link |
| `productIds` | `string[]` | Yes | Product IDs included in this checkout |
| `successUrl` | `string` | No | URL to redirect after successful checkout |
| `returnUrl` | `string` | No | URL to redirect if customer cancels |
| `active` | `boolean` | No | Whether the link is active |
| `discountId` | `string \| null` | No | UUID of a discount to auto-apply |
| `metadata` | `object` | No | Arbitrary key-value pairs |

**Returns** → `CheckoutLink`

### `kwit.checkoutLinks.retrieve(id)`

Retrieve a checkout link by its ID.

```typescript
const link = await kwit.checkoutLinks.retrieve("checkout-link-uuid");
```

**Returns** → `CheckoutLink`

---

## Webhooks

Kwit sends webhook events to your registered endpoints with an HMAC-SHA256 signature for verification.

**Headers sent by Kwit:**

| Header | Example | Description |
|--------|---------|-------------|
| `Kwit-Signature` | `t=1711454400,v1=5257a...` | Timestamp and HMAC signature |
| `Kwit-Event` | `customer.created` | The event type |

### `kwit.webhooks.verify(payload, signatureHeader, eventHeader, secret)`

Verify and parse an incoming webhook request. Throws if the signature is invalid or the timestamp is too old.

```typescript
import Kwit from "@kwit/sdk";

const kwit = new Kwit("kwit_live_xxx");

// In your Express / Hono / Fastify webhook handler:
app.post("/webhooks/kwit", (req, res) => {
  try {
    const event = kwit.webhooks.verify(
      req.body,                          // raw body string or Buffer
      req.headers["kwit-signature"],     // Kwit-Signature header
      req.headers["kwit-event"],         // Kwit-Event header
      "whsec_your_webhook_secret",       // your endpoint secret from the dashboard
    );

    switch (event.type) {
      case "customer.created":
        console.log("New customer:", event.payload);
        break;
      case "subscription.created":
        console.log("New subscription:", event.payload);
        break;
      case "invoice.paid":
        console.log("Invoice paid:", event.payload);
        break;
      // ...
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).json({ error: "Invalid signature" });
  }
});
```

**Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `payload` | `string \| Buffer` | The raw request body |
| `signatureHeader` | `string` | Value of the `Kwit-Signature` header |
| `eventHeader` | `string` | Value of the `Kwit-Event` header |
| `secret` | `string` | Your webhook endpoint secret |
| `toleranceInSeconds` | `number` | Max signature age (default: `300`) |

**Returns** → `WebhookEvent`

```typescript
{
  type: "customer.created",     // WebhookEventType
  payload: { ... },             // event-specific data
  timestamp: 1711454400,        // unix seconds from the signature
}
```

### Available Events

| Event | Fired when |
|-------|-----------|
| `customer.created` | A new customer is created |
| `customer.updated` | Customer details are modified |
| `customer.deleted` | A customer is deleted |
| `subscription.created` | A new subscription starts |
| `subscription.updated` | Subscription is modified |
| `subscription.canceled` | Subscription is canceled |
| `subscription.renewed` | Subscription renews for a new period |
| `subscription.payment_succeeded` | A payment succeeds |
| `subscription.payment_failed` | A payment fails |
| `invoice.created` | A draft invoice is generated |
| `invoice.paid` | Invoice is fully paid |
| `invoice.voided` | Invoice is voided |

---

## Error Handling

All API errors throw a `KwitError` with structured information:

```typescript
import Kwit, { KwitError } from "@kwit/sdk";

const kwit = new Kwit("kwit_live_xxx");

try {
  await kwit.customers.create({ email: "invalid" });
} catch (err) {
  if (err instanceof KwitError) {
    console.log(err.status);   // 400
    console.log(err.code);     // "validation_error"
    console.log(err.message);  // "Validation error"
    console.log(err.details);  // { email: ["Invalid email"] }
  }
}
```

**KwitError properties:**

| Property | Type | Description |
|----------|------|-------------|
| `status` | `number` | HTTP status code |
| `code` | `string` | Machine-readable error code |
| `message` | `string` | Human-readable error message |
| `details` | `Record<string, string[]> \| undefined` | Field-level validation errors (400 only) |

**Error codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | `400` | Invalid request body — check `details` for field errors |
| `authentication_error` | `401` | Missing, malformed, or expired API key |
| `not_found` | `404` | Referenced resource does not exist |
| `rate_limit_exceeded` | `429` | Too many requests — auto-retried by SDK |
| `internal_error` | `5xx` | Server error — auto-retried by SDK |

---

## Typical Integration Flow

```
1. Your backend:  kwit.products.create(...)          → create a product with pricing
2. Your backend:  kwit.discounts.create(...)          → optionally create a discount
3. Your backend:  kwit.customers.create(...)          → get customer ID
4. Your backend:  kwit.checkout.create(...)            → checkout session + invoice created
   OR:           kwit.subscriptions.create(...)       → subscribe directly
   OR:           kwit.checkoutLinks.create(...)       → create a shareable checkout link
5. Kwit:          Notifies your app via webhook
6. Kwit:          Handles renewals, invoice generation, and payment collection
7. Your backend:  kwit.portal.sessions.create(...)    → redirect URL for self-service
```

---

## TypeScript Types

All types are exported for full type safety:

```typescript
import type {
  Customer,
  CreateCustomerParams,
  Subscription,
  Invoice,
  CheckoutResult,
  CheckoutCreatedInvoice,
  CheckoutSession,
  CreatePortalSessionParams,
  PortalSession,
  WebhookEvent,
  WebhookEventType,
  Address,
  Price,
  Product,
  CreateProductParams,
  ProductListResult,
  ListProductsParams,
  Discount,
  CreateDiscountParams,
  ValidateDiscountParams,
  CreateSubscriptionParams,
  CheckoutLink,
  CreateCheckoutLinkParams,
  DiscountType,
  DiscountDuration,
} from "@kwit/sdk";
```

---

## Requirements

- Node.js >= 18 (uses native `fetch` and `crypto`)
- TypeScript >= 5 (peer dependency)
