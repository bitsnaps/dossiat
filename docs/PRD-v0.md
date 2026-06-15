# Platform Functional Specification: "Dossiat"

## 1. Executive Summary
Dossiat is a decentralized, geo-independent platform designed to facilitate administrative, financial, and errand-based missions. Initially operating as an Agent-led network, Agents use the platform as a tool to invite, manage, and bill their own clients securely. The platform acts strictly as an intermediary layer for workflow traceability, flexible quoting, and communication, completely removing itself from tax, legal, and fund-holding liabilities. 

## 2. Platform Access & Network Dynamics
Instead of an open public directory (initially), the platform relies on a "Private Network" model driven by the Agents.
*   **The Unique Agent Link:** Agents are provided with a customized invitation link to share with their existing network or clients via WhatsApp, email, or social media. 
*   **Progressive Profile Visibility:** When a client clicks the link, they see a limited/anonymous version of the Agent's profile. The full profile (name, photo, detailed history) is only unlocked *after* the client registers and verifies their account on the platform.
*   **Agent Specialization:** Agents tag their profiles with:
    *   *Specialties:* Legal, Finance, Real Estate, General Admin, etc.
    *   *Accepted Client Types:* B2B (Companies), B2C (Individuals), or Both.
*   **Future Scope:** Once the platform reaches critical mass, an opt-in "Public Marketplace" can be activated, allowing unlinked clients to search for Agents globally.

## 3. Core Functional Modules & Features

### A. Flexible Quoting & Pricing Engine
Agents have total freedom in how they price their services.
*   **Fixed & Dynamic Pricing:** Agents can charge a flat rate, or log time/tasks for dynamic billing.
*   **Recurrent Missions:** A scheduling engine for ongoing tasks. Clients and Agents can set up daily, weekly, monthly, or annual missions (e.g., "Pay local electricity bill on the 5th of every month"). The system automatically generates the new mission and notifies both parties when it's time.
*   **Multi-Currency Support:** The platform parameterizes currency. Agents select their operating currency (e.g., USD, EUR, MAD, etc.), and platform fees are calculated dynamically based on the chosen currency.

### B. Lightweight Mission Workflow
*   **The Checkbox Agreement:** Before a mission begins, both parties review a simplified digital checklist outlining expectations and confidentiality. Checking the boxes acts as a mutual agreement to proceed.
*   **Step-by-Step Traceability:** Agents update mission statuses (Pending -> In Progress -> Complete) and can upload documents or photos as proof of work.
*   **Asynchronous Messaging System:** A simple, non-real-time inbox attached to each mission. Parties can leave messages, instructions, or attachments for each other, similar to an email thread or ticketing system.

### C. Financial & Payment Architecture (Hands-off Model)
The platform does not freeze funds or act as an escrow. Payments are direct and flexible.
*   **Hybrid Payment Methods:** 
    *   *Direct Cash / Off-Platform:* Clients can pay Agents directly in cash or via external bank transfer. Both parties simply click "Payment Sent" and "Payment Received" on the platform to close the loop.
    *   *Online Gateways (Optional):* Integration with Stripe, PayPal, etc., for clients who prefer to pay by card. Funds flow directly to the Agent's connected gateway account.
*   **Smart Platform Fee Calculation:** 
    *   If an online gateway is used, the platform calculates its fee *only on the net amount* (Total minus Stripe/PayPal fees). 
    *   *How the Platform gets paid on Cash transactions:* Agents maintain a "Platform Credit Balance" or receive a monthly consolidated invoice from the platform for the platform's cut of their cash/off-platform missions.

### D. Dispute & Reconciliation Process
Because the Agent is fully responsible for lost documents or mishandled cash, the platform acts only as a mediator.
*   **Amicable Resolution Room:** If a dispute arises, the mission goes into "Reconciliation Mode." 
*   Both parties use a structured messaging interface to state their case and propose a solution (e.g., Agent offers to waive the labor fee and retrieve a replacement document).
*   The goal is purely out-of-court, peer-to-peer resolution. The platform provides the chat log as an audit trail but takes no legal liability.

---

## 4. B2B Client Subscription Plans
To cater to companies of different sizes (who need to send out multiple missions to various Agents), the platform offers 3 SaaS-style subscription tiers.

### Tier 1: "Small Business" (Basic)
*   **Target:** Solo entrepreneurs, small agencies.
*   **Features:** Up to 2 User Seats (logins), limit of 10 Recurrent Missions per month, standard asynchronous messaging, basic monthly export of mission expenses.

### Tier 2: "Professional" (Most Popular)
*   **Target:** Law firms, medium real-estate agencies.
*   **Features:** Up to 10 User Seats, unlimited Recurrent Missions, Team/Department tagging (track which department requested the mission), priority dispute reconciliation access.

### Tier 3: "Enterprise" (Volume Scale)
*   **Target:** Large corporations, international companies operating locally.
*   **Features:** Unlimited Seats, bulk mission creation (uploading a CSV to spawn 50 missions at once), dedicated API access (to connect their internal ERP to Dossiat), custom data retention rules.

---

## 5. Non-Technical To-Do list

Here are some functional important details about this project:

1.  **Platform Fee Percentages:** The Agent's labor fee will enforce a minimum platform fee as follows: 1% but minimum $1.
2.  **Terms of Service (ToS):** We should create a strong ToS that explicitly states: *"Dossiat is a software provider, not an employer, financial institution, or legal representative. Users assume all liability."*
3.  **Agent Billing Cycle:** Since we support cash payments, we will collect platform fee from Agents by contacting them directly as an option, or Agents must buy "Platform Credits" in advance, so if an Agent does a -for example- $100 cash mission and the fee is $2, the $2 is deducted from their credit balance.
