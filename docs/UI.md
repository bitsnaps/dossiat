# UI

## 🎨 Design Highlights

### Custom Dark Theme with Vibrant Accents

- Deep navy/black background (#0a0e1a) with a tri-color gradient palette: lime green (#c8ff00), cyan (#00d4ff), and purple (#7c5cff)
- Subtle radial gradient lighting and a masked grid pattern in the hero
- Custom scrollbar, glassmorphism navbar, and floating UI elements

#### Unique Typography

- Fraunces (serif, variable) — for all headings with that distinctive high-contrast modern look
- Inter (sans-serif) — for body text
- Space Grotesk (monospace-ish) — for technical labels, prices, and code-like elements
- All loaded via Google Fonts CDN

Bootstrap 5 + Bootstrap Icons via CDN, fully custom-themed.

## 📄 Sections Built
- Sticky glassmorphism navbar with brand dot and CTAs
- Hero — headline, subhead, dual CTAs, social proof avatars, plus a 3D-tilted mission dashboard mockup with two floating stat card
- Trust marquee — infinite-scrolling client logos
- Features grid (6 cards) — Flexible Quoting, Recurrent Missions, Checkbox Agreement, Hybrid Payments, Smart Fee Engine (1% / $1 min), Mediation

- 4-step workflow — Invite → Agree → Execute → Settle
- For Agents — split section with checklist + interactive Agent profile mockup (specialties, stats, copyable unique link)
- Pricing — 3 tiers (Small Business $29, Professional $99 marked "Most Popular" with lime glow, Enterprise $499) with full feature comparison
- FAQ accordion — 5 deep Q&As covering the ToS, cash missions, disputes, currencies, and ERP API
- CTA section with glowing gradient card
- Rich footer with 4 link columns and social icons

## ⚡ Interactivity
- Scroll-reveal animations via IntersectionObserver
- Navbar border fade on scroll
- Hover transforms on cards (lift + glow)
- Animated pulse dot in badges
- 3D-tilted mockup on hover
- Copy-to-clipboard on the unique invite link

Everything is in a single index.html using only CDN links — no build step required.