# Fix Dead/Empty/Unused Links

## Problem
The landing page (`src/views/LandingPage.vue`) contained many `href="#"` dead links, especially in the footer. These were placeholder links pointing to nowhere — social icons, company pages, resource pages, and other non-existent pages.

## Findings
All dead links were in a single file: `src/views/LandingPage.vue`. Total: **22 dead `href="#"` links**.

### Footer (16 dead links)
- **Social icons** (4): Twitter, LinkedIn, GitHub, Discord — no real profiles
- **Product section** (2): changelog, roadmap — no pages exist
- **Company section** (5): about, blog, careers, press kit, contact — no pages exist
- **Resources section** (4): help center, agent guide, API docs, status — no pages exist
- **Legal section** (1): DPA — no page exists; cookies was a duplicate of privacy

### Other sections (6 dead links)
- **Pricing CTAs** (3): all pointed to `#`
- **Feature comparison link** (1): pointed to `#`
- **FAQ Contact Us** (1): pointed to `#`
- **CTA section** (2): both pointed to `#`

## Solution

### Footer — removed dead sections and links
- Removed entire social icons block (no profiles to link to)
- Removed **Company** section (5 links) — no pages
- Removed **Resources** section (4 links) — no pages
- Removed changelog and roadmap from Product section
- Removed cookies (duplicate of privacy) and DPA from Legal section
- Kept: features (`#features`), howItWorks (`#how`), pricing (`#pricing`), terms (`/terms`), privacy (`/privacy`)

### Other sections — linked to existing routes
- 3 pricing CTAs → `RouterLink to="/register"`
- Feature comparison → removed (no page)
- FAQ Contact Us → `RouterLink to="/register"`
- CTA "Get Access" → `RouterLink to="/register"`
- CTA "Book a Demo" → `RouterLink to="/login"`

## Result
- Zero `href="#"` links remain in the entire `src/` directory
- Build compiles successfully
- Footer is now compact with only links that have valid targets
