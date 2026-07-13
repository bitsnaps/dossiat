# Dossiat — User Guide

> Help center content for Agents and Clients using the Dossiat platform.
>
> Dossiat is a SaaS platform that facilitates administrative, financial, and errand-based **missions** between **Agents** (service providers) and **Clients** (individuals or businesses).

---

## Table of Contents

- [Getting Started](#getting-started)
- [For Agents](#for-agents)
- [For Clients](#for-clients)
- [For Both Roles](#for-both-roles)
- [FAQ](#faq)
- [Glossary](#glossary)

---

## Getting Started

### What is Dossiat?

Dossiat connects **Agents** (people who perform administrative, financial, or errand tasks) with **Clients** (people or businesses who need those tasks done). Each task is called a **mission**. Dossiat provides tools for mission agreements, progress tracking, messaging, payments, and dispute resolution.

> **Important:** Dossiat is a **software provider**. It is not an employer, financial institution, or legal representative. Agents and Clients transact directly; Dossiat provides the platform and tools.

### Register an account

1. Go to the registration page
2. Choose your role: **Agent** or **Client**
3. Enter your email, first name, last name, and password (minimum 8 characters)
4. Check the **Terms of Service** box to confirm you accept them
5. Submit the form

You will be logged in immediately and receive a verification email.

### Verify your email

Click the link in the verification email, or use the "Resend verification" option from your account settings. Verified emails are required for agents to appear in client discovery search results.

### Log in

Enter your email and password on the login page. If you forget your password, use the "Forgot password" link to receive a reset email.

---

## For Agents

### Complete your agent profile

After registering, complete your agent profile so clients can find and trust you:

- **Bio** — describe your experience and services
- **Specialties** — tag your areas of expertise (e.g., bookkeeping, document filing, errands)
- **Accepted client types** — choose `B2B` (businesses), `B2C` (individuals), or `Both`
- **Currency** — your preferred billing currency
- **Timezone** — your working timezone
- **Profile photo** — upload a professional photo (JPEG, PNG, or WebP; max 5 MB)

### Share your invite link

Every agent gets a **unique invite link** (e.g., `/agents/your-name-abc123`). Share this link with potential clients via WhatsApp, email, or any channel. Anyone who opens it sees your public profile.

You can regenerate your invite link at any time from your agent settings — the old link will stop working.

### Create missions

As an agent, you can create missions and assign them to clients in your network:

1. Go to **Missions → Create**
2. Enter the mission **title** and **description**
3. Choose a **pricing type**:
   - **Fixed** — a single agreed amount
   - **Hourly** — billed by the hour
   - **Task-based** — billed per task or milestone
4. Set the **agreed amount** and **currency**
5. Add **checklist items** (the deliverables both parties will agree to)
6. Select the **client** from your network
7. Submit — the mission is created in `draft` status and the client is notified

### Mission agreement workflow

Before work begins, both parties must agree to the checklist:

1. The mission moves to `pending_agreement` status
2. Both the agent and the client review the checklist
3. Each party checks all the boxes and confirms agreement
4. Once **both** parties have agreed, the mission moves to `agreed` status
5. Either party can then start the mission (move it to `in_progress`)

### Track mission status

The mission timeline shows the progression:

```
draft → pending_agreement → agreed → in_progress → completed
                                                    ↘ disputed
```

- **draft** — created, not yet sent for agreement
- **pending_agreement** — waiting for both parties to agree to the checklist
- **agreed** — both parties accepted the checklist
- **in_progress** — work has started
- **completed** — work is done
- **disputed** — a dispute has been opened
- **cancelled** — the mission was cancelled

### Upload proof-of-work attachments

On any mission you're part of, you can upload documents or photos as proof of work (receipts, completed forms, photos of errands, etc.). Attachments are visible to both parties and admins.

### Message clients

Each mission has its own conversation thread. Use it to clarify requirements, share updates, and coordinate. Unread message counts appear in the navigation bar.

### Payments

#### Recording a payment

When a client pays you (by cash, bank transfer, or online gateway):

1. Go to the mission's **Payments** section
2. Record the payment with the **amount** and **method** (`cash`, `bank_transfer`, `stripe`, or `paypal`)
3. The platform fee is calculated automatically (see [Fee Calculation](FEE_CALCULATION.md))

#### Dual-party confirmation

For cash and bank transfer payments, **both** the payer and the payee must confirm:

1. The **client** (payer) confirms the payment was sent
2. You (the **payee**) confirm the payment was received
3. Once both confirm, the payment status becomes `confirmed`

#### Platform credits and fees

Dossiat charges a **platform fee** of 1% of your labor fee (minimum $1) on every confirmed payment. For cash/bank transfer payments, this fee is deducted from your **platform credit balance**.

- **Check your balance** in the Credit Balance page
- **Purchase credits** to top up your balance
- **View transactions** to see all purchases, deductions, and adjustments
- **View invoices** for your billing cycle statements

If your credit balance is insufficient when a payment confirms, the outstanding fee is tracked and added to your next invoice.

### Disputes

If a mission goes wrong, you can initiate a dispute:

1. Open the mission and choose **Initiate Dispute**
2. Provide a **reason** for the dispute
3. The mission status changes to `disputed` and a reconciliation room is created
4. Both parties can message in the reconciliation room to resolve the issue
5. Either party can **resolve** the dispute (with a resolution note) or **escalate** it for admin review

---

## For Clients

### Discover agents

There are two ways to find an agent:

1. **Invite link** — an agent shares their unique link with you directly. Open it to view their profile.
2. **Agent discovery** — browse agents by name, specialty, or accepted client type (B2B/B2C/Both). Only agents with verified emails appear in search.

### Accept and agree to missions

When an agent creates a mission for you:

1. You'll receive a notification
2. Open the mission to review the title, description, amount, and checklist
3. Go through the **agreement** flow: check all checklist items and confirm
4. Once both you and the agent have agreed, the mission is `agreed` and work can begin

### Create missions yourself

Clients can also create missions:

- **Assign to a specific agent** — choose an agent from your network; the mission starts in `pending_agreement`
- **Open mission** — create a mission without assigning an agent; agents can then **claim** it

### Track mission progress

Use the mission detail page to track the status timeline, view attachments uploaded by the agent, and message the agent with questions or updates.

### Make payments

You can pay an agent using:

- **Cash** — record the payment and confirm it was sent; the agent confirms receipt
- **Bank transfer** — same dual-confirmation flow as cash
- **Stripe** — online card payment via Stripe Checkout
- **PayPal** — online payment via PayPal

For cash and bank transfer, you (the payer) confirm the payment was sent, and the agent confirms it was received. The payment is `confirmed` only when both parties have confirmed.

### Subscriptions

Clients subscribe to a plan to use the platform. Three tiers are available:

| Plan | Price | Best for |
|------|-------|----------|
| **Small Business** | $29/mo | Small teams with basic needs |
| **Professional** | $99/mo | Growing businesses |
| **Enterprise** | $499/mo | Large teams with CSV bulk import and custom rules |

#### Manage your subscription

- **View your plan** in the Subscription Manage page
- **Upgrade or downgrade** to a different plan at any time
- **Cancel** your subscription (takes effect at the end of the billing period)
- **View billing history** and invoices in the Billing page

#### Seat limits

Each plan has a **maximum number of agent seats** (the number of distinct agents you can work with simultaneously). If you reach the limit, upgrade your plan to add more agents.

### Disputes

If you're unhappy with a mission, you can initiate a dispute (same flow as agents — see [Disputes](#disputes) under For Agents).

---

## For Both Roles

### Notifications

The bell icon in the top navigation shows your recent notifications:

- New missions, mission status changes, agreement updates
- New messages
- Payment recordings and confirmations
- Dispute updates
- Subscription changes

Click the bell to view notifications, and use **Mark all as read** to clear the unread count.

### Account settings

- **Profile** — update your first name, last name, and avatar
- **Password** — change your password (requires your current password)
- **Notification preferences** — manage email notification settings
- **Appearance** — theme and display preferences

### Language switching

Dossiat supports three languages:

- **English** (LTR)
- **French** (LTR)
- **Arabic** (RTL)

Switch language from the language switcher in the navigation. When Arabic is selected, the entire interface flips to right-to-left (RTL) layout automatically.

### Data and privacy (GDPR)

You have control over your data:

- **Data export** — download a full JSON bundle of your account data (profile, missions, payments, disputes, notifications)
- **Account deletion** — permanently anonymize your account. Note: you cannot delete your account while you have active missions (`pending_agreement`, `agreed`, or `in_progress`). Complete or cancel them first.

---

## FAQ

### Can I change my role after registering?

Roles (agent/client) are set at registration. Contact an admin if you need your role changed.

### What happens if I cancel a mission?

Cancelling sets the mission status to `cancelled`. It is not deleted — the record remains for history. The other party is notified.

### How is the platform fee calculated?

The platform fee is **1% of your labor fee, with a minimum of $1**. For online gateway payments (Stripe/PayPal), the fee is calculated on the net amount after gateway fees. See [Fee Calculation](FEE_CALCULATION.md) for full details and worked examples.

### What if my credit balance is too low to cover a fee?

The payment still confirms. The outstanding fee is tracked and added to your next invoice. You can top up your credit balance at any time.

### Can I use Dossiat without Stripe or PayPal?

Yes. Cash and bank transfer payments work without any payment gateway configuration. The dual-confirmation flow handles them.

### How do recurrent missions work?

You can configure a recurrence schedule on any mission (daily, weekly, monthly, or annual). The scheduler automatically generates new mission instances when the next run time is reached. You can view upcoming runs and disable recurrence at any time.

### What is the difference between an open mission and an assigned mission?

- **Open mission** — created by a client without an agent; any agent can claim it
- **Assigned mission** — has a specific agent; only that agent and the client can access it

### How do disputes get resolved?

Disputes can be resolved in two ways:

1. **Mutual resolution** — either party marks the dispute as resolved with a resolution note
2. **Escalation** — either party escalates the dispute for admin review; an admin can then resolve it

---

## Glossary

| Term | Definition |
|------|------------|
| **Mission** | A unit of work between an agent and a client (administrative, financial, or errand-based) |
| **Agent** | The service provider who performs missions |
| **Client** | The person or business who commissions missions |
| **Checklist** | The list of deliverables both parties agree to before a mission starts |
| **Agreement** | The state where both parties have checked all checklist items |
| **Recurrent mission** | A mission with a recurring schedule that auto-generates new instances |
| **Platform fee** | Dossiat's 1% fee (min $1) on agent labor, deducted from agent credits or invoiced |
| **Gateway fee** | The fee charged by Stripe/PayPal for online payments (2.9% + $0.30) |
| **Platform credit** | An agent's prepaid balance used to pay platform fees for cash/bank payments |
| **Credit transaction** | A record of a credit purchase, deduction, refund, or adjustment |
| **Invoice** | A billing statement for an agent's platform fees over a period |
| **Subscription plan** | A client's tier (Small Business, Professional, Enterprise) with seat and feature limits |
| **Seat** | A slot for a distinct agent a client can work with simultaneously |
| **Dispute** | A formal disagreement on a mission, handled in a reconciliation room |
| **Invite link** | An agent's unique shareable URL to their public profile |
| **Private network** | The set of users with whom you share at least one mission |

---

## Related Documentation

- [API Reference](API.md) — for developers integrating with the platform
- [Fee Calculation](FEE_CALCULATION.md) — detailed fee math
- [Deployment Guide](DEPLOYMENT.md) — for platform operators
