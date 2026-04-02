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
| `priceId` | `string` | Yes | UUID of the price to subscribe to |
| `successUrl` | `string` | No | URL to redirect after successful checkout |
| `cancelUrl` | `string` | No | URL to redirect if checkout is canceled |
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
1. Dashboard:     Create a Product (e.g. "Pro Plan")
2. Dashboard:     Add a Price to the product (e.g. USD 79/month)
3. Dashboard:     Create an API Key
4. Your backend:  kwit.customers.create(...)       → get customer ID
5. Your backend:  kwit.checkout.create(...)         → subscription + invoice created
6. Kwit:          Notifies your app via webhook (customer.created, subscription.created)
7. Kwit:          Handles renewals, invoice generation, and payment collection
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
  WebhookEvent,
  WebhookEventType,
  Address,
  Price,
} from "@kwit/sdk";
```

---

## Requirements

- Node.js >= 18 (uses native `fetch` and `crypto`)
- TypeScript >= 5 (peer dependency)
