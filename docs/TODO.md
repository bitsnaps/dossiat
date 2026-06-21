# Dossiat — Project TODO

> Exhaustive checklist of every remaining task to bring the platform from scaffolding to production-ready.
> Checked items are done; unchecked items are pending.

---

## 1. Project Infrastructure & Tooling

- [x] Create a `.env.example` file documenting all required environment variables with descriptions
- [x] Create a `.env` file with local development defaults for PostgreSQL, JWT secret, encryption key, and API keys
- [x] Configure path aliases in `tsconfig.json` to match Vite aliases (e.g. `@/` for `src/`)
- [x] Set up `vitest` coverage configuration with minimum thresholds
- [x] Add a `test:watch` script to `package.json` for development workflow

---

## 2. Database — Schema & Models

### 2a. Database Configuration

- [x] Create `src/server/database/config/database.ts` with Sequelize connection setup (PostgreSQL for production, SQLite for development)
- [x] Create `.sequelizerc` configuration file pointing to config, models, migrations, and seeders directories
- [x] Create a `db:migrate` npm script to run pending migrations
- [x] Create a `db:seed` npm script to run all seeders
- [x] Create a `db:reset` npm script to drop, recreate, and reseed the database

### 2b. User & Auth Models

- [x] Create `User` model — id, email, passwordHash, firstName, lastName, role (agent|client|admin), emailVerified, createdAt, updatedAt
- [x] Create `AgentProfile` model — userId (FK), bio, specialties (JSON array), acceptedClientTypes (B2B|B2C|Both), uniqueInviteSlug, currency, timezone, profilePhotoUrl
- [x] Create `ClientProfile` model — userId (FK), companyName, companySize, industry
- [x] Create `RefreshToken` model — id, userId (FK), token, expiresAt, createdAt
- [x] Create `PasswordResetToken` model — id, userId (FK), token, expiresAt, used
- [x] Create `EmailVerificationToken` model — id, userId (FK), token, expiresAt, used

### 2c. Mission Models

- [x] Create `Mission` model — id, agentId (FK), clientId (FK), title, description, status (draft|pending_agreement|agreed|in_progress|completed|disputed|cancelled), type (one_time|recurrent), pricingType (fixed|hourly|task_based), agreedAmount, currency, agreedChecklist (JSON), completedChecklist (JSON), startedAt, completedAt, createdAt, updatedAt
- [x] Create `RecurrentMissionConfig` model — id, missionId (FK), frequency (daily|weekly|monthly|annual), interval, dayOfMonth, dayOfWeek, nextRunAt, lastRunAt, isActive
- [x] Create `MissionAttachment` model — id, missionId (FK), uploadedBy (FK to User), fileUrl, fileName, fileType, fileSize, createdAt

### 2d. Messaging Models

- [x] Create `Conversation` model — id, missionId (FK), createdAt, updatedAt
- [x] Create `Message` model — id, conversationId (FK), senderId (FK to User), content, readAt, createdAt
- [x] Create `MessageAttachment` model — id, messageId (FK), fileUrl, fileName, fileType, fileSize

### 2e. Payment & Financial Models

- [x] Create `Payment` model — id, missionId (FK), payerId (FK), payeeId (FK), amount, currency, method (cash|stripe|paypal|bank_transfer), platformFee, gatewayFee, netAmount, status (pending|confirmed|failed|refunded), confirmedByPayer, confirmedByPayee, confirmedAt, createdAt
- [x] Create `PlatformCredit` model — id, agentId (FK), balance, currency, updatedAt
- [x] Create `CreditTransaction` model — id, creditId (FK), type (purchase|deduction|refund|adjustment), amount, description, createdAt
- [x] Create `Invoice` model — id, agentId (FK), periodStart, periodEnd, totalFees, currency, status (draft|sent|paid), paidAt, createdAt

### 2f. Subscription & Billing Models

- [x] Create `SubscriptionPlan` model — id, name (small_business|professional|enterprise), price, currency, interval (monthly|annual), maxSeats, maxRecurrentMissions, features (JSON), isActive
- [x] Create `Subscription` model — id, clientId (FK to ClientProfile), planId (FK), status (active|past_due|cancelled), stripeSubscriptionId, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt
- [x] Create `SubscriptionInvoice` model — id, subscriptionId (FK), amount, currency, status (pending|paid|failed), paidAt, createdAt

### 2g. Dispute Models

- [x] Create `Dispute` model — id, missionId (FK), initiatedBy (FK), reason, status (open|reconciling|resolved|escalated), resolution, resolvedAt, createdAt, updatedAt
- [x] Create `DisputeMessage` model — id, disputeId (FK), senderId (FK), content, createdAt

### 2h. Notification Models

- [x] Create `Notification` model — id, userId (FK), type, title, body, data (JSON), readAt, createdAt

### 2i. Migrations

- [x] Generate initial migration from models for all tables above
- [x] Add appropriate indexes on frequently queried columns (userId, missionId, status, etc.)
- [x] Add foreign key constraints with ON DELETE CASCADE or SET NULL as appropriate
- [x] Add CHECK constraints for enums and business rules (e.g. platform fee minimum $1)

### 2j. Seeders

- [x] Create seeder for `SubscriptionPlan` with the 3 tiers: Small Business ($29), Professional ($99), Enterprise ($499)
- [x] Create seeder for demo agent and client users with sample missions
- [x] Create seeder for supported currencies list

---

## 3. Backend API — Hono Server

### 3a. Server Setup

- [x] Create `src/server/index.ts` — Hono app entry point with CORS, JSON body parsing, error handling middleware
- [x] Create `src/server/middleware/auth.ts` — JWT authentication middleware using `jose` for token verification
- [x] Create `src/server/middleware/roleGuard.ts` — Role-based access control middleware (agent-only, client-only, admin-only)
- [x] Create `src/server/middleware/validateRequest.ts` — Request body/query/params validation middleware
- [x] Create `src/server/middleware/errorHandler.ts` — Global error handler with consistent error response format
- [x] Create `src/server/middleware/rateLimiter.ts` — Rate limiting middleware to prevent abuse
- [x] Create `src/server/utils/apiResponse.ts` — Standardized API response helpers (success, error, paginated)

### 3b. Authentication Routes

- [x] Create `POST /api/auth/register` — Register new user with email, password, role selection
- [x] Create `POST /api/auth/login` — Login with email/password, return access + refresh tokens
- [x] Create `POST /api/auth/refresh` — Refresh access token using refresh token
- [x] Create `POST /api/auth/logout` — Invalidate refresh token
- [x] Create `POST /api/auth/forgot-password` — Send password reset email
- [x] Create `POST /api/auth/reset-password` — Reset password with token
- [x] Create `GET /api/auth/verify-email/:token` — Verify email address
- [x] Create `POST /api/auth/resend-verification` — Resend email verification

### 3c. User & Profile Routes

- [x] Create `GET /api/users/me` — Get current user profile
- [x] Create `PUT /api/users/me` — Update current user profile
- [x] Create `PUT /api/users/me/password` — Change password
- [x] Create `POST /api/users/me/avatar` — Upload profile photo
- [x] Create `GET /api/agents/:slug` — Get agent public profile by unique invite slug (progressive visibility: limited for unauthenticated, full for registered)
- [x] Create `PUT /api/agents/me` — Update agent profile (specialties, accepted client types, bio, currency)
- [x] Create `POST /api/agents/me/invite-link` — Generate/regenerate unique invite link
- [x] Create `GET /api/clients/me` — Get client profile details
- [x] Create `PUT /api/clients/me` — Update client profile

### 3d. Mission Routes

- [x] Create `GET /api/missions` — List missions for current user (agent or client), with filtering by status, date range, type
- [x] Create `POST /api/missions` — Create a new mission (agent initiates)
- [x] Create `GET /api/missions/:id` — Get mission details (with permission check)
- [x] Create `PUT /api/missions/:id` — Update mission details
- [x] Create `DELETE /api/missions/:id` — Cancel/delete a mission
- [x] Create `POST /api/missions/:id/agree` — Accept the checklist agreement (both parties must agree)
- [x] Create `PUT /api/missions/:id/status` — Update mission status (Pending → In Progress → Complete)
- [x] Create `POST /api/missions/:id/attachments` — Upload document/photo as proof of work
- [x] Create `GET /api/missions/:id/attachments` — List mission attachments
- [x] Create `POST /api/missions/:id/dispute` — Initiate a dispute on a mission

### 3e. Recurrent Mission Routes

- [x] Create `POST /api/missions/:id/recurrence` — Set up recurrence schedule on a mission
- [x] Create `PUT /api/missions/:id/recurrence` — Update recurrence schedule
- [x] Create `DELETE /api/missions/:id/recurrence` — Disable recurrence
- [x] Create scheduler logic to generate new missions from recurrent configs when `nextRunAt` is reached

### 3f. Messaging Routes

- [x] Create `GET /api/missions/:id/messages` — Get conversation messages for a mission
- [x] Create `POST /api/missions/:id/messages` — Send a message in mission conversation
- [x] Create `POST /api/messages/:id/read` — Mark message as read
- [x] Create `GET /api/messages/unread-count` — Get unread message count across all conversations

### 3g. Payment Routes

- [x] Create `GET /api/missions/:id/payments` — List payments for a mission
- [x] Create `POST /api/missions/:id/payments` — Record a payment (cash or gateway)
- [x] Create `POST /api/payments/:id/confirm-payer` — Payer confirms payment sent
- [x] Create `POST /api/payments/:id/confirm-payee` — Payee confirms payment received
- [x] Create `GET /api/agents/me/credits` — Get agent platform credit balance
- [x] Create `POST /api/agents/me/credits/purchase` — Purchase platform credits
- [x] Create `GET /api/agents/me/credit-transactions` — List credit transaction history
- [x] Create `GET /api/agents/me/invoices` — List platform invoices

### 3h. Stripe / PayPal Integration

- [x] Create Stripe account setup endpoint — connect agent's Stripe account (OAuth flow)
- [x] Create `POST /api/payments/stripe/create-checkout-session` — Create Stripe checkout session for a mission
- [x] Create Stripe webhook handler — handle `checkout.session.completed`, `payment_intent.succeeded`, etc.
- [x] Create PayPal integration endpoints (parallel to Stripe)
- [x] Implement smart fee calculation: platform fee = 1% of agent labor fee (minimum $1), calculated on net amount after gateway fees
- [x] Implement fee deduction from platform credits for cash/off-platform missions
- [x] Create payment provider abstraction layer (`src/server/services/payment/`) with pluggable providers for Stripe, PayPal, and cash
- [x] Create stubbed Stripe routes (`/api/payments/stripe/connect`, `/create-checkout-session`, `/webhook`, `/status`)
- [x] Create stubbed PayPal routes (`/api/payments/paypal/setup`, `/create-order`, `/webhook`, `/status`)

### 3i. Subscription Routes

- [x] Create `GET /api/subscriptions/plans` — List available subscription plans
- [x] Create `POST /api/subscriptions` — Subscribe to a plan (via Stripe)
- [x] Create `GET /api/subscriptions/me` — Get current subscription details
- [x] Create `PUT /api/subscriptions/me` — Upgrade/downgrade subscription
- [x] Create `DELETE /api/subscriptions/me` — Cancel subscription
- [x] Create Stripe billing portal integration for subscription management

### 3j. Dispute Routes

- [x] Create `GET /api/disputes` — List disputes for current user
- [x] Create `GET /api/disputes/:id` — Get dispute details
- [x] Create `POST /api/disputes/:id/messages` — Send message in dispute reconciliation room
- [x] Create `PUT /api/disputes/:id/resolve` — Mark dispute as resolved with resolution note
- [x] Create `PUT /api/disputes/:id/escalate` — Escalate dispute (for admin review)

### 3k. Notification Routes

- [x] Create `GET /api/notifications` — List user notifications with pagination
- [x] Create `PUT /api/notifications/:id/read` — Mark notification as read
- [x] Create `PUT /api/notifications/read-all` — Mark all notifications as read
- [x] Implement server-side notification creation on key events (new mission, message, payment confirmation, etc.)

### 3l. Admin Routes (Internal / Future)

- [x] Create `GET /api/admin/users` — List all users (admin only)
- [x] Create `GET /api/admin/stats` — Platform statistics (total users, missions, revenue)
- [x] Create `GET /api/admin/disputes` — List all open disputes
- [x] Create role-based middleware guard for all admin routes

### 3m. Scheduler Function

- [x] Create `netlify/functions/scheduler.ts` — Netlify scheduled function running every 10 minutes
- [x] Implement recurrent mission generation logic in scheduler
- [x] Implement stale mission cleanup / status transitions in scheduler
- [x] Implement invoice generation for agents on billing cycle end
- [x] Implement notification dispatch for upcoming recurrent missions

---

## 4. Frontend — Auth & Layout

### 4a. API Client Setup

- [x] Create `src/services/api.ts` — Axios instance with base URL, interceptors for auth tokens, error handling, and token refresh
- [x] Create `src/services/auth.ts` — Auth API functions (login, register, logout, refresh, forgot-password, etc.)
- [x] Create `src/services/missions.ts` — Mission API functions (CRUD, agreement, status, attachments)
- [x] Create `src/services/messages.ts` — Messaging API functions
- [x] Create `src/services/payments.ts` — Payment API functions
- [x] Create `src/services/users.ts` — User/profile API functions
- [x] Create `src/services/subscriptions.ts` — Subscription API functions
- [x] Create `src/services/disputes.ts` — Dispute API functions

### 4b. Pinia Stores

- [x] Create `src/stores/auth.ts` — Authentication state (user, tokens, login/logout actions, token refresh)
- [x] Create `src/stores/missions.ts` — Missions list, filters, current mission details
- [x] Create `src/stores/messages.ts` — Conversations, unread counts, message sending
- [x] Create `src/stores/notifications.ts` — Notifications list, unread count, mark as read
- [x] Create `src/stores/payments.ts` — Payment history, credit balance
- [x] Create `src/stores/subscriptions.ts` — Current plan, billing info
- [x] Create `src/stores/ui.ts` — Sidebar state, theme preferences, loading states

### 4c. Composables

- [x] Create `src/composables/useAuth.ts` — Auth helpers (isAuthenticated, currentUser, hasRole)
- [x] Create `src/composables/useToast.ts` — Toast notification composable
- [x] Create `src/composables/useConfirmDialog.ts` — Confirmation dialog composable
- [x] Create `src/composables/usePagination.ts` — Pagination state and helpers
- [x] Create `src/composables/useDebounce.ts` — Debounced search/filter input
- [x] Create `src/composables/useCopyToClipboard.ts` — Copy-to-clipboard utility (for invite links)

### 4d. Internationalization (i18n)

- [x] Configure `vue-i18n` with supported locales (English, Arabic and French)
- [x] Create `src/locales/en.json` — English translations for all UI strings
- [x] Create `src/locales/ar.json` — Arabic translations
- [x] Create `src/locales/fr.json` — French translations
- [x] Create language switcher component
- [x] Replace all hardcoded strings in views with i18n translation keys

#### 4d-RTL. RTL Support Preparation

- [x] Replace physical CSS properties with logical equivalents in `src/assets/main.css` — convert `padding-left`/`padding-right` to `padding-inline-start`/`padding-inline-end`, `margin-left`/`margin-right` to `margin-inline-start`/`margin-inline-end`, `left`/`right` to `inset-inline-start`/`inset-inline-end`, `border-left`/`border-right` to `border-inline-start`/`border-inline-end`
- [x] Replace inline directional styles in `src/views/LandingPage.vue` — convert `margin-right:-10px` to `margin-inline-end:-10px` in avatar stack, and review all inline style attributes for directional values
- [x] Fix directional CSS in base components — update `BInput.vue` icon positioning (`padding-left`, `left`), `BAvatar.vue` online indicator (`right`, `bottom`), `BDropdown.vue` menu positioning (`left`, `right`)
- [x] Fix table header alignment — convert `text-align: left` in `.ds-table__table th` to `text-align: start`
- [x] Fix sort indicator margin — convert `.ds-table__sort-indicator` `margin-left` to `margin-inline-start`
- [x] Fix table search clear button border — convert `.ds-table-search__clear` `border-left` to `border-inline-start`
- [x] Fix popular badge positioning — convert `.popular-badge` `right: 24px` to `inset-inline-end: 24px`
- [x] Fix trust marquee gradient edges — convert `.trust-marquee::before` `left: 0` to `inset-inline-start: 0` and `::after` `right: 0` to `inset-inline-end: 0`
- [x] Add RTL font stack to `index.html` or `main.css` — include Arabic-compatible fonts (e.g., IBM Plex Sans Arabic, Noto Sans Arabic) for `lang="ar"` mode
- [x] Set `dir="rtl"` attribute dynamically on `<html>` element when Arabic locale is active
- [x] Add Bootstrap 5 RTL CSS import or use RTL-compatible Bootstrap build for Arabic locale
- [x] Add `unicode-bidi: isolate` and `direction` rules for mixed LTR/RTL content where needed (e.g., numbers, codes, URLs)
- [x] Add a composable `src/composables/useDirection.ts` — reactive composable that returns current text direction (`ltr` or `rtl`) based on active locale
- [x] Audit and test all Bootstrap grid/layout classes — verify `me-*`/`ms-*` are replaced with `ms-*`/`me-*` RTL-aware equivalents or use logical properties
- [x] Ensure chevron/arrow icons in `BTable.vue` pagination flip direction correctly in RTL mode

### 4e. Route Configuration

- [x] Add route definitions for all pages (auth, dashboard, missions, messages, settings, etc.)
- [x] Implement route meta fields for required auth and roles
- [x] Create navigation guards — redirect unauthenticated users to login, redirect authenticated users away from auth pages
- [x] Implement NProgress page transition loading bar on route changes

### 4f. Auth Pages

- [x] Create `LoginView.vue` — Email/password login form with "Forgot password" link
- [x] Create `RegisterView.vue` — Registration form with role selection (Agent or Client)
- [x] Create `ForgotPasswordView.vue` — Request password reset form
- [x] Create `ResetPasswordView.vue` — Set new password form (with token from email)
- [x] Create `VerifyEmailView.vue` — Email verification confirmation page

### 4g. App Layout

- [x] Create `AppLayout.vue` — Authenticated layout with sidebar, top navbar, and main content area
- [x] Create `AuthLayout.vue` — Unauthenticated layout (centered card for login/register)
- [x] Create `Sidebar.vue` — Navigation sidebar with links based on user role (agent vs client)
- [x] Create `TopNavbar.vue` — Top bar with search, notifications bell, user avatar dropdown
- [x] Create `NotificationDropdown.vue` — Dropdown showing recent notifications with mark-as-read

---

## 5. Frontend — Core Pages

### 5a. Dashboard

- [x] Create `DashboardView.vue` — Overview page with key stats cards (active missions, pending payments, unread messages)
- [x] Create `AgentDashboard.vue` — Agent-specific dashboard (earnings chart, active missions, recent client activity)
- [x] Create `ClientDashboard.vue` — Client-specific dashboard (spending summary, active missions, pending agreements)

### 5b. Agent Profile & Onboarding

- [x] Create `AgentProfileSetup.vue` — Onboarding wizard for new agents (specialties, client types, bio, photo)
- [x] Create `AgentProfileView.vue` — Public/semi-public agent profile view (progressive visibility)
- [x] Create `AgentSettingsView.vue` — Edit agent profile, specialties, currency, invite link management
- [x] Create `InviteLinkShare.vue` — Component to display and share the agent's unique invite link (copy to clipboard, share via WhatsApp/email)

### 5c. Client Pages

- [x] Create `ClientProfileView.vue` — Client profile view
- [x] Create `ClientSettingsView.vue` — Edit client profile and company info
- [x] Create `AgentDiscoveryView.vue` — Browse agents discovered via invite links (future: public marketplace)

### 5d. Mission Pages

- [x] Create `MissionListView.vue` — List of missions with filters (status, date, type) and sort options
- [x] Create `MissionDetailView.vue` — Full mission detail with status timeline, checklist, attachments, and action buttons
- [x] Create `MissionCreateView.vue` — Create new mission form (title, description, pricing type, amount, checklist items, currency)
- [x] Create `MissionAgreementView.vue` — Checkbox agreement view where both parties review and accept the checklist
- [x] Create `MissionTimeline.vue` — Component showing mission status progression (Pending → Agreed → In Progress → Complete)
- [x] Create `MissionChecklist.vue` — Interactive checklist component for agreement and completion tracking
- [x] Create `MissionAttachments.vue` — File upload and display component for mission proof-of-work documents

### 5e. Recurrent Missions

- [ ] Create `RecurrentMissionSetup.vue` — UI for configuring recurrence (frequency, interval, day/time)
- [ ] Create `RecurrentMissionList.vue` — List of active recurrent mission schedules
- [ ] Implement visual calendar/timeline preview of upcoming recurrent mission instances

### 5f. Messaging

- [ ] Create `MessageListView.vue` — List of all conversations (per mission) with unread indicators
- [ ] Create `MessageThreadView.vue` — Message thread view for a specific mission (like an email thread)
- [ ] Create `MessageComposer.vue` — Message input with text and file attachment support
- [ ] Create `MessageBubble.vue` — Individual message display with sender info, timestamp, read status
- [ ] Implement real-time polling or WebSocket for new message notifications

### 5g. Payments

- [ ] Create `PaymentSummaryView.vue` — Overview of payments sent/received, pending confirmations
- [ ] Create `PaymentRecordView.vue` — Record a payment (cash, bank transfer, or gateway selection)
- [ ] Create `PaymentConfirmationView.vue` — Confirm payment sent/received toggle UI
- [ ] Create `CreditBalanceView.vue` — Agent platform credit balance, purchase credits, transaction history
- [ ] Create `InvoiceListView.vue` — Agent's platform invoices list
- [ ] Create `StripeConnectView.vue` — Stripe account connection flow for agents

### 5h. Subscriptions

- [ ] Create `SubscriptionPlansView.vue` — Display 3 tiers with feature comparison (port from landing page pricing section)
- [ ] Create `SubscriptionManageView.vue` — Current plan details, upgrade/downgrade, cancel
- [ ] Create `SubscriptionBillingView.vue` — Billing history and invoices

### 5i. Disputes

- [ ] Create `DisputeListView.vue` — List of disputes for current user
- [ ] Create `DisputeDetailView.vue` — Dispute reconciliation room with structured messaging
- [ ] Create `DisputeInitiateView.vue` — Form to initiate a dispute on a mission

### 5j. Settings

- [ ] Create `SettingsView.vue` — Account settings (email, name, password change)
- [ ] Create `NotificationSettingsView.vue` — Email notification preferences
- [ ] Create `AppearanceSettingsView.vue` — Theme and display preferences (future dark/light mode toggle)

### 5k. Shared Components

- [ ] Create `src/components/common/Modal.vue` — Reusable modal dialog
- [ ] Create `src/components/common/ConfirmDialog.vue` — Confirmation dialog (yes/no)
- [ ] Create `src/components/common/LoadingSpinner.vue` — Loading indicator
- [ ] Create `src/components/common/EmptyState.vue` — Empty state placeholder with icon and action
- [ ] Create `src/components/common/Pagination.vue` — Pagination controls
- [ ] Create `src/components/common/SearchInput.vue` — Debounced search input
- [ ] Create `src/components/common/StatusBadge.vue` — Color-coded status badge for missions/payments
- [ ] Create `src/components/common/FileUpload.vue` — Drag-and-drop file upload with preview
- [ ] Create `src/components/common/CurrencyDisplay.vue` — Formatted currency amount display
- [ ] Create `src/components/common/Avatar.vue` — User avatar with fallback initials
- [ ] Create `src/components/common/Breadcrumb.vue` — Page breadcrumb navigation

---

## 6. Styling & UI

- [ ] Audit and refactor `src/assets/main.css` — extract reusable CSS variables and utility classes
- [ ] Ensure consistent dark theme across all new pages (navy/black background, gradient accents)
- [ ] Ensure responsive design — mobile-first approach for all views
- [ ] Create a style guide or design tokens file documenting colors, typography, spacing, and component patterns
- [ ] Verify all pages work with Bootstrap 5 grid and utility classes consistently
- [ ] Add loading states and skeleton screens for async data fetching

---

## 7. Deployment & DevOps

- [ ] Create `netlify/functions/` directory structure for serverless functions
- [ ] Create a `netlify/functions/api.ts` entry point that wraps the Hono app for Netlify Functions
- [ ] Configure Netlify redirects to route `/api/*` to the serverless function
- [ ] Set up Netlify environment variables for production (database URL, JWT secret, Stripe keys, etc.)
- [ ] Create the `netlify/functions/scheduler.ts` scheduled function
- [ ] Test the full build + deploy pipeline end-to-end on Netlify
- [ ] Set up Netlify deploy previews for pull requests
- [ ] Create a `.github/workflows/ci.yml` for GitHub Actions (lint, test, type-check on PRs)

---

## 8. Testing

### 8a. Unit Tests

- [x] Write unit tests for all Pinia stores (auth, missions, messages, etc.)
- [x] Write unit tests for all composables
- [x] Write unit tests for API service functions (mock axios)
- [ ] Write unit tests for utility functions (fee calculation, currency formatting, date helpers)

### 8b. Component Tests

- [x] Write component tests for auth forms (login, register, forgot password)
- [x] Write component tests for mission components (checklist, timeline, status badge)
- [ ] Write component tests for messaging components (thread, composer, bubble)
- [ ] Write component tests for payment components (confirmation, credit balance)
- [ ] Write component tests for shared/common components

### 8c. Integration Tests

- [ ] Write integration tests for authentication flow (register → verify → login → access protected route)
- [ ] Write integration tests for mission lifecycle (create → agree → progress → complete → pay)
- [ ] Write integration tests for dispute flow (initiate → message → resolve)
- [ ] Write integration tests for subscription flow (subscribe → upgrade → cancel)

### 8d. Backend Tests

- [x] Write API endpoint tests for auth routes
- [x] Write API endpoint tests for mission routes
- [x] Write API endpoint tests for payment routes (including credit deduction, bank transfer, Stripe/PayPal stubs)
- [x] Write API endpoint tests for messaging routes
- [x] Write API endpoint tests for dispute routes
- [x] Write API endpoint tests for subscription routes
- [x] Write unit tests for fee calculator and payment providers
- [ ] Set up test database (SQLite in-memory) for backend integration tests

---

## 9. Business Logic & Rules

- [x] Implement platform fee calculation: 1% of agent labor fee, minimum $1
- [x] Implement fee calculation on net amount (total minus Stripe/PayPal gateway fees) when using online gateways
- [x] Implement platform credit deduction for cash/off-platform missions
- [ ] Implement progressive profile visibility (limited profile for unauthenticated visitors, full after registration)
- [ ] Implement mission agreement workflow (both parties must check all boxes before mission starts)
- [ ] Implement recurrent mission auto-generation with proper date scheduling
- [ ] Implement seat limit enforcement per subscription tier
- [ ] Implement recurring mission limit per tier (10/month for Small Business, unlimited for others)
- [ ] Implement CSV bulk mission creation for Enterprise tier
- [ ] Implement agent billing cycle and invoice generation

---

## 10. Legal & Compliance

- [ ] Draft Terms of Service document — explicitly stating Dossiat is a software provider, not an employer, financial institution, or legal representative
- [ ] Create Privacy Policy document
- [ ] Add ToS acceptance checkbox to user registration flow
- [ ] Add ToS/Privacy Policy links in footer and registration page
- [ ] Implement data retention policies per Enterprise tier custom rules
- [ ] Ensure GDPR compliance (data export, account deletion)

---

## 11. Documentation

- [ ] Write comprehensive API documentation (endpoints, request/response formats, authentication)
- [ ] Write developer setup guide (local development, environment variables, database setup)
- [ ] Write deployment guide (Netlify setup, environment configuration, domain setup)
- [ ] Update `AGENTS.md` with new routers, models, and directory structure as they are created
- [ ] Write user guide / help center content for Agents and Clients
- [ ] Document the platform fee calculation logic for transparency

---

## 12. Performance & Security

- [ ] Implement input sanitization on all API endpoints (prevent XSS)
- [ ] Implement SQL injection prevention (Sequelize parameterized queries)
- [ ] Add CSRF protection for form submissions
- [ ] Implement secure HTTP headers (Helmet or equivalent)
- [ ] Implement pagination on all list endpoints to prevent unbounded queries
- [ ] Add database query optimization (eager loading, select only needed columns)
- [ ] Implement image/file upload size limits and type validation
- [ ] Implement JWT token rotation and secure storage (httpOnly cookies or secure storage)
- [ ] Set up application logging (structured logs for debugging and audit)
- [ ] Implement health check endpoint for monitoring

---

## 13. Future Scope (Post-MVP)

- [ ] Build opt-in Public Marketplace for Agent discovery without invite links
- [ ] Add real-time messaging via WebSocket or Server-Sent Events
- [ ] Add push notifications (browser push, mobile if PWA)
- [ ] Implement multi-language support beyond EN/FR
- [ ] Add analytics dashboard for agents (earnings trends, client retention)
- [ ] Build admin dashboard for platform management
- [ ] Implement Agent rating and review system
- [ ] Add document management system with OCR for receipts/invoices
- [ ] Build mobile app or PWA for on-the-go mission management
- [ ] Integrate with additional payment gateways (local options per region)
- [ ] Implement automated tax report generation for agents
