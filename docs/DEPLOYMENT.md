# Dossiat — Deployment Guide

> Production deployment instructions for the Dossiat SaaS platform on Netlify with PostgreSQL.

---

## Prerequisites

- [Netlify](https://app.netlify.com) account connected to your Git repository
- [Neon](https://neon.tech), [Supabase](https://supabase.com), or any managed PostgreSQL database
- Stripe account (for payment processing)
- PayPal Developer account (optional, for PayPal payments)

---

## 1. Netlify Site Setup

### Connect Repository

1. Log in to Netlify → **Add new site** → **Import an existing project**
2. Select your Git provider and repository
3. Netlify auto-detects build settings from [`netlify.toml`](../netlify.toml):
   - **Build command:** `pnpm install --frozen-lockfile && pnpm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### Build Settings

The build pipeline in [`netlify.toml`](../netlify.toml) is pre-configured:

```toml
[build]
  command = "pnpm install --frozen-lockfile && pnpm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### Node.js Version

Set the Node.js version in Netlify:

1. Go to **Site settings** → **Build & deploy** → **Environment** → **Environment variables**
2. Add `NODE_VERSION` = `20`

Or add a `.nvmrc` file in the repo root:

```
20
```

---

## 2. Environment Variables

Configure these in **Netlify → Site settings → Environment variables**.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DB_DIALECT` | Database dialect | `postgres` |
| `DB_HOST` | Database host | `your-host.example.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `your_database` |
| `DB_USER` | Database user | `your_db_user` |
| `DB_PASSWORD` | Database password | (your database password) |
| `JWT_SECRET` | Access token signing secret | (random 64+ char string) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | (random 64+ char string) |
| `ENCRYPTION_KEY` | 32-char encryption key for sensitive data | (random 32 char string) |

### Payment Gateway Variables

| Variable | Description | When Required |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | When Stripe is enabled |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | When Stripe is enabled |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | When Stripe is enabled |
| `PAYPAL_CLIENT_ID` | PayPal client ID | When PayPal is enabled |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | When PayPal is enabled |
| `PAYPAL_MODE` | `live` or `sandbox` | When PayPal is enabled |

### Email Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | — |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `EMAIL_FROM` | From address for emails | `noreply@dossiat.com` |

### Frontend Variables (VITE_*)

These are exposed to the browser at build time:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API base URL (use `/api` for same-domain) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side |

> **Note:** `VITE_*` variables are embedded in the JavaScript bundle. Never put secrets in `VITE_*` variables.

---

## 3. Database Setup

### PostgreSQL (Production)

1. Create a PostgreSQL database on your preferred provider (Neon, Supabase, AWS RDS, etc.)
2. Run migrations:
   ```bash
   pnpm db:migrate
   ```
3. Seed initial data (subscription plans, demo users):
   ```bash
   pnpm db:seed
   ```

### Required Tables

The migration at [`src/server/database/migrations/20260614000000-initial-schema.cjs`](../src/server/database/migrations/20260614000000-initial-schema.cjs) creates all tables:

- Users, AgentProfile, ClientProfile
- RefreshToken, PasswordResetToken, EmailVerificationToken
- Mission, RecurrentMissionConfig, MissionAttachment
- Conversation, Message, MessageAttachment
- Payment, PlatformCredit, CreditTransaction, Invoice
- SubscriptionPlan, Subscription, SubscriptionInvoice
- Dispute, DisputeMessage
- Notification

---

## 4. Netlify Functions

### API Function

[`netlify/functions/api.ts`](../netlify/functions/api.ts) wraps the Hono app as a serverless function:

- **Route:** `/api/*` → handled by the API function
- **Runtime:** Node.js 20
- **Bundler:** esbuild (with external node modules for pg, bcryptjs, etc.)

### Scheduler Function

[`netlify/functions/scheduler.ts`](../netlify/functions/scheduler.ts) runs on a cron schedule (`*/10 * * * *`):

1. Generates recurring missions when `nextRunAt` is reached
2. Auto-cancels stale draft missions (>7 days) and pending missions (>30 days)
3. Generates monthly invoices for agents
4. Sends notifications for upcoming recurring missions (within 24h)

### External Modules

The following packages are configured as external in [`netlify.toml`](../netlify.toml) (not bundled by esbuild):

```
pg, pg-hstore, pg-native, pg-connection-string, pg-types,
pg-int8, pg-numeric, pg-pass, postgres-array, postgres-bytea,
postgres-date, postgres-interval, packet-reader, packet-writer,
buffer-writer, split2, readable-stream, bcryptjs, jsonwebtoken, dotenv
```

---

## 5. Netlify Redirects

The API function is configured via the [`config` export`](../netlify/functions/api.ts:17-19) in `api.ts`:

```ts
export const config = {
  path: '/api/*',
}
```

This routes all `/api/*` requests to the serverless function.

---

## 6. Deploy Previews

Netlify automatically creates deploy previews for:

- **Pull requests** — Each PR gets a unique preview URL
- **Branch deploys** — Non-production branches get branch-specific URLs

No additional configuration is needed — this is enabled by default when connecting a Git repo.

To configure production vs. preview environment variables:

1. Go to **Site settings → Environment variables**
2. Use the **Scope** dropdown to set different values for:
   - **All (Production & Deploy Previews)** — shared values
   - **Production only** — production database, live API keys
   - **Deploy Previews only** — staging/test database, sandbox API keys

---

## 7. Custom Domain

1. Go to **Site settings → Domain management**
2. Add your custom domain (e.g., `dossiat.com`)
3. Configure DNS (Netlify provides nameservers or CNAME records)
4. Enable HTTPS (automatic via Let's Encrypt)

---

## 8. Health Check

The API exposes a health check endpoint at:

```
GET /api/auth/health
```

Use this for monitoring uptime.

---

## 9. Local Development

```bash
# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Start development server (frontend + API)
pnpm dev
```

The development server runs both the Vue frontend and Hono API server via the Vite dev plugin.

---

## 10. Production Checklist

- [ ] All environment variables set in Netlify
- [ ] `NODE_ENV=production`
- [ ] `DB_DIALECT=postgres` (not `sqlite`)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are random, unique values
- [ ] Database migrations have been run
- [ ] Stripe/PayPal keys are production keys (not test)
- [ ] Custom domain configured with HTTPS
- [ ] Deploy preview environment variables scoped correctly
- [ ] Scheduler function is running (check Netlify Functions → scheduler → Invocations)
