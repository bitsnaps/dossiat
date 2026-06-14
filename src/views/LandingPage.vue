<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(async () => {
  await nextTick()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

  const nav = document.querySelector('.navbar') as HTMLElement | null
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.borderBottomColor =
        window.scrollY > 30 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'
    })
  }
})
</script>

<template>
  <div class="landing-page">
    <!-- NAV -->
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#">
          <span class="dot"></span> Dossiat
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <i class="bi bi-list text-light fs-3"></i>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
            <li class="nav-item"><a class="nav-link" href="#how">How it works</a></li>
            <li class="nav-item"><a class="nav-link" href="#agents">For Agents</a></li>
            <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
            <li class="nav-item"><a class="nav-link" href="#faq">FAQ</a></li>
          </ul>
          <div class="d-flex gap-2 mt-3 mt-lg-0">
            <a href="#" class="btn btn-outline-light-custom">Sign in</a>
            <a href="#" class="btn btn-accent">Get started</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="hero">
      <div class="hero-grid"></div>
      <div class="container position-relative" style="z-index: 2;">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="hero-badge"><span class="pulse"></span> Now in private beta</span>
            <h1 class="reveal">Run missions across <em>any border</em>, with the agent you already trust.</h1>
            <p class="lead reveal">Dossiat is a decentralized platform where independent Agents handle your administrative, financial, and errand-based missions — billable, traceable, and geo-independent.</p>
            <div class="d-flex flex-wrap gap-3 mt-4 reveal">
              <a href="#pricing" class="btn btn-accent"><i class="bi bi-rocket-takeoff me-2"></i> Start your network</a>
              <a href="#how" class="btn btn-outline-light-custom"><i class="bi bi-play-circle me-2"></i> See how it works</a>
            </div>
            <div class="d-flex align-items-center gap-4 mt-5 reveal">
              <div class="d-flex">
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#7c5cff,#00d4ff);margin-right:-10px;"></div>
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#c8ff00,#ff7a59);margin-right:-10px;"></div>
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#00d4ff,#7c5cff);"></div>
              </div>
              <div>
                <div class="fw-bold font-mono">2,400+</div>
                <div class="text-muted-2 small">Agents onboarded</div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="mockup-wrap">
              <div class="mockup">
                <div class="mockup-header">
                  <div class="mockup-dots"><span></span><span></span><span></span></div>
                  <div class="mockup-title">dossiat.app / missions</div>
                  <i class="bi bi-three-dots text-muted-2"></i>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-receipt-cutoff"></i></div>
                  <div class="mission-meta">
                    <div class="title">Pay local electricity bill</div>
                    <div class="sub">Agent: Yassine B. • Casablanca</div>
                  </div>
                  <span class="status-pill status-progress">In progress</span>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-file-earmark-text"></i></div>
                  <div class="mission-meta">
                    <div class="title">Renew company registration</div>
                    <div class="sub">Agent: Léa M. • Lyon</div>
                  </div>
                  <span class="status-pill status-done">Complete</span>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-arrow-repeat"></i></div>
                  <div class="mission-meta">
                    <div class="title">Monthly VAT filing</div>
                    <div class="sub">Recurrent • Auto-scheduled</div>
                  </div>
                  <span class="status-pill status-recurrent">Recurrent</span>
                </div>
              </div>
              <div class="floating-stat stat-1">
                <i class="bi bi-shield-check text-accent"></i>
                <div>
                  <div class="label">Status</div>
                  <div class="val">Verified Agent</div>
                </div>
              </div>
              <div class="floating-stat stat-2">
                <i class="bi bi-currency-exchange" style="color:var(--ds-accent-3)"></i>
                <div>
                  <div class="label">Mission</div>
                  <div class="val">$148.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- TRUST BAR -->
    <div class="trust-bar">
      <div class="container">
        <div class="row align-items-center g-3">
          <div class="col-lg-2">
            <div class="trust-text">Trusted worldwide</div>
          </div>
          <div class="col-lg-10">
            <div class="trust-marquee">
              <div class="trust-track">
                <span>Atlas Legal</span><span>•</span>
                <span>Nomad Finance</span><span>•</span>
                <span>Casablanca Admin Co.</span><span>•</span>
                <span>EuroDesk Pro</span><span>•</span>
                <span>SwiftErrand</span><span>•</span>
                <span>TrustBridge</span><span>•</span>
                <span>Maghreb Office</span><span>•</span>
                <span>Atlas Legal</span><span>•</span>
                <span>Nomad Finance</span><span>•</span>
                <span>Casablanca Admin Co.</span><span>•</span>
                <span>EuroDesk Pro</span><span>•</span>
                <span>SwiftErrand</span><span>•</span>
                <span>TrustBridge</span><span>•</span>
                <span>Maghreb Office</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FEATURES -->
    <section id="features">
      <div class="container">
        <div class="text-center mb-5">
          <span class="section-label justify-content-center mx-auto d-inline-flex">The Platform</span>
          <h2 class="section-title reveal">A workflow layer, not a gatekeeper.</h2>
          <p class="section-sub mx-auto reveal">Dossiat is intentionally hands-off. We provide the rails for traceability, quoting, and communication — Agents and clients own the relationship and the liability.</p>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-accent"><i class="bi bi-tags"></i></div>
              <h4>Flexible Quoting</h4>
              <p>Set a fixed fee or log time and tasks for dynamic billing. You price your work — we don't.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> Flat rate or hourly</li>
                <li><i class="bi bi-check2"></i> Multi-currency native</li>
                <li><i class="bi bi-check2"></i> Transparent line items</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-grad"><i class="bi bi-arrow-repeat"></i></div>
              <h4>Recurrent Missions</h4>
              <p>Schedule daily, weekly, monthly or annual tasks. Dossiat auto-generates the next mission and notifies both sides.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> Auto-renewal calendar</li>
                <li><i class="bi bi-check2"></i> "Pay the bill on the 5th" — done</li>
                <li><i class="bi bi-check2"></i> Pause / resume any time</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-purple"><i class="bi bi-list-check"></i></div>
              <h4>Checkbox Agreement</h4>
              <p>Before any work begins, both parties tick a simple checklist that acts as a mutual digital agreement.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> Scope + confidentiality</li>
                <li><i class="bi bi-check2"></i> Audit trail timestamped</li>
                <li><i class="bi bi-check2"></i> No legal complexity</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-warm"><i class="bi bi-wallet2"></i></div>
              <h4>Hybrid Payments</h4>
              <p>Cash, bank transfer, Stripe, PayPal — whatever suits the mission. Funds go directly to the Agent. We never hold them.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> Off-platform by default</li>
                <li><i class="bi bi-check2"></i> Optional online gateway</li>
                <li><i class="bi bi-check2"></i> Direct "Sent / Received" loop</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-accent"><i class="bi bi-percent"></i></div>
              <h4>Smart Fee Engine</h4>
              <p>Just <strong>1%</strong> per mission, with a <strong>$1 minimum</strong>. On online payments, the fee is calculated only on the net amount after gateway fees.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> 1% / $1 min — never hidden</li>
                <li><i class="bi bi-check2"></i> Net-of-gateway calculation</li>
                <li><i class="bi bi-check2"></i> Platform Credit top-ups</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-grad"><i class="bi bi-shield-shaded"></i></div>
              <h4>Mediation, Not Liability</h4>
              <p>If something goes sideways, our Reconciliation Room helps both parties find an amicable, out-of-court solution.</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> Structured chat log</li>
                <li><i class="bi bi-check2"></i> Priority for Pro plans</li>
                <li><i class="bi bi-check2"></i> Zero legal exposure for us</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how" class="workflow-section">
      <div class="container">
        <div class="text-center mb-5">
          <span class="section-label justify-content-center mx-auto d-inline-flex">Workflow</span>
          <h2 class="section-title reveal">From invite to invoice, in four moves.</h2>
          <p class="section-sub mx-auto reveal">No public marketplace noise. Clients are introduced by Agents they already know — or by the Agents they find through them.</p>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">01 — INVITE</span>
              <h5>Share the link</h5>
              <p>The Agent shares their unique Dossiat link via WhatsApp, email, or social. The client lands on a limited preview of the Agent's profile.</p>
              <div class="mt-3"><i class="bi bi-link-45deg fs-2 text-accent"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">02 — AGREE</span>
              <h5>Tick & sign</h5>
              <p>After registration, the full Agent profile unlocks. Both sides tick the checkbox agreement to formalize scope and confidentiality.</p>
              <div class="mt-3"><i class="bi bi-check2-square fs-2" style="color:var(--ds-accent-3)"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">03 — EXECUTE</span>
              <h5>Run the mission</h5>
              <p>The Agent updates statuses, uploads proof (docs, photos), and exchanges async messages with the client. Every step is timestamped.</p>
              <div class="mt-3"><i class="bi bi-camera fs-2" style="color:#b09aff"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">04 — SETTLE</span>
              <h5>Close the loop</h5>
              <p>Pay cash, by transfer, or via Stripe / PayPal. Both click "Sent" and "Received". The platform fee is auto-deducted from the Agent's credit balance.</p>
              <div class="mt-3"><i class="bi bi-cash-coin fs-2" style="color:var(--ds-warm)"></i></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AGENT NETWORK -->
    <section id="agents">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="section-label">For Agents</span>
            <h2 class="section-title reveal">Your network. Your rules. <span class="text-grad">Your business.</span></h2>
            <p class="section-sub mb-4 reveal">Dossiat gives independent professionals a complete toolkit to invite clients, price their work transparently, and run recurring missions — without the platform ever touching the money.</p>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-accent" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-person-badge"></i></div>
                <div>
                  <h6 class="mb-1 font-mono" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">Specialize & tag</h6>
                  <p class="text-muted-2 small mb-0">Legal, Finance, Real Estate, Admin — pick your specialties and the client types (B2B, B2C) you accept.</p>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-grad" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-share"></i></div>
                <div>
                  <h6 class="mb-1" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">Your unique link</h6>
                  <p class="text-muted-2 small mb-0">One branded URL. Share it anywhere. Each click is attributable and leads to a curated onboarding.</p>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-purple" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-cash-stack"></i></div>
                <div>
                  <h6 class="mb-1" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">Platform Credits</h6>
                  <p class="text-muted-2 small mb-0">Top up once, deduct automatically. Or settle monthly — whichever matches your cash flow.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="agent-mockup reveal">
              <div class="agent-profile">
                <div class="agent-avatar">YB</div>
                <div class="agent-info flex-grow-1">
                  <h6>Yassine Benali</h6>
                  <div class="role">Admin & Finance Agent • Casablanca, MA</div>
                </div>
                <span class="status-pill status-done"><i class="bi bi-patch-check-fill"></i> Verified</span>
              </div>
              <div class="agent-stats">
                <div class="agent-stat"><div class="num">312</div><div class="lbl">Missions</div></div>
                <div class="agent-stat"><div class="num">4.96</div><div class="lbl">Rating</div></div>
                <div class="agent-stat"><div class="num">98%</div><div class="lbl">On-time</div></div>
              </div>
              <div class="mb-3">
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Specialties</small>
                <span class="specialty-tag"><i class="bi bi-bank me-1"></i> Finance</span>
                <span class="specialty-tag"><i class="bi bi-file-earmark-medical me-1"></i> Admin</span>
                <span class="specialty-tag"><i class="bi bi-building me-1"></i> Real Estate</span>
              </div>
              <div class="mb-3">
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Accepts</small>
                <span class="specialty-tag"><i class="bi bi-building-fill me-1"></i> B2B</span>
                <span class="specialty-tag"><i class="bi bi-person-fill me-1"></i> B2C</span>
              </div>
              <div>
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Your unique invite link</small>
                <div class="link-box">
                  <i class="bi bi-link-45deg"></i>
                  <span class="url">dossiat.app/i/yassine-benali</span>
                  <i class="bi bi-copy" style="cursor:pointer"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section id="pricing">
      <div class="container">
        <div class="text-center mb-5">
          <span class="section-label justify-content-center mx-auto d-inline-flex">B2B Subscriptions</span>
          <h2 class="section-title reveal">Built for companies that ship missions.</h2>
          <p class="section-sub mx-auto reveal">Three tiers for the size of your team. Cancel any time. All plans include the full mission workflow.</p>
        </div>
        <div class="row g-4 align-items-stretch">
          <div class="col-lg-4">
            <div class="pricing-card reveal">
              <div class="tier-name">Small Business</div>
              <div class="tier-price"><span class="currency">$</span>29<span class="per">/mo</span></div>
              <div class="tier-target">Solo entrepreneurs & small agencies</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> Up to <strong>2 user seats</strong></li>
                <li><i class="bi bi-check2-circle"></i> <strong>10 recurrent missions</strong> per month</li>
                <li><i class="bi bi-check2-circle"></i> Standard async messaging</li>
                <li><i class="bi bi-check2-circle"></i> Basic monthly expense export</li>
                <li><i class="bi bi-check2-circle"></i> Email support</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> Team / department tagging</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> Bulk CSV mission creation</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> Dedicated API access</li>
              </ul>
              <a href="#" class="btn btn-outline-light-custom w-100">Start free trial</a>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="pricing-card popular reveal">
              <span class="popular-badge">Most popular</span>
              <div class="tier-name">Professional</div>
              <div class="tier-price"><span class="currency">$</span>99<span class="per">/mo</span></div>
              <div class="tier-target">Law firms & mid-size real-estate agencies</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> Up to <strong>10 user seats</strong></li>
                <li><i class="bi bi-check2-circle"></i> <strong>Unlimited</strong> recurrent missions</li>
                <li><i class="bi bi-check2-circle"></i> Standard async messaging</li>
                <li><i class="bi bi-check2-circle"></i> Monthly + custom exports</li>
                <li><i class="bi bi-check2-circle"></i> <strong>Team / department tagging</strong></li>
                <li><i class="bi bi-check2-circle"></i> <strong>Priority dispute</strong> reconciliation</li>
                <li><i class="bi bi-check2-circle"></i> Priority chat support</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> Dedicated API access</li>
              </ul>
              <a href="#" class="btn btn-grad w-100">Get started</a>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="pricing-card reveal">
              <div class="tier-name">Enterprise</div>
              <div class="tier-price"><span class="currency">$</span>499<span class="per">/mo</span></div>
              <div class="tier-target">Large corporations & international companies</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> <strong>Unlimited</strong> user seats</li>
                <li><i class="bi bi-check2-circle"></i> <strong>Unlimited</strong> recurrent missions</li>
                <li><i class="bi bi-check2-circle"></i> <strong>Bulk CSV</strong> mission creation</li>
                <li><i class="bi bi-check2-circle"></i> <strong>Dedicated API</strong> for your ERP</li>
                <li><i class="bi bi-check2-circle"></i> <strong>Custom data retention</strong> rules</li>
                <li><i class="bi bi-check2-circle"></i> Custom SSO & audit logs</li>
                <li><i class="bi bi-check2-circle"></i> Dedicated success manager</li>
                <li><i class="bi bi-check2-circle"></i> 24/7 priority support</li>
              </ul>
              <a href="#" class="btn btn-outline-light-custom w-100">Talk to sales</a>
            </div>
          </div>
        </div>
        <p class="text-center text-muted-2 mt-4 small">All prices in USD. Multi-currency support available on every plan. <a href="#" style="color:var(--ds-accent)">See full feature comparison →</a></p>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="workflow-section">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-4">
            <span class="section-label">Questions</span>
            <h2 class="section-title reveal">Everything you'd ask before signing up.</h2>
            <p class="section-sub reveal">Still curious? Our team replies to every message within one business day.</p>
            <a href="#" class="btn btn-outline-light-custom mt-3"><i class="bi bi-envelope me-2"></i> Contact us</a>
          </div>
          <div class="col-lg-8">
            <div class="accordion accordion-flush" id="faqAcc">
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q1" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    Is Dossiat an employer, bank, or legal representative?
                  </button>
                </h2>
                <div id="q1" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    No. Dossiat is a software provider — full stop. Our Terms of Service explicitly state that we are not an employer, financial institution, or legal representative. All liability sits with the Agents and their clients. We provide the workflow, traceability, and communication tools; nothing more.
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    How does the platform get paid on cash missions?
                  </button>
                </h2>
                <div id="q2" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    Agents maintain a Platform Credit Balance. For a $100 cash mission with a 1% fee, we deduct $2 from that balance. Agents can top up credits anytime, or settle via a monthly consolidated invoice — whichever matches their cash flow.
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q3" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    What happens if a dispute arises?
                  </button>
                </h2>
                <div id="q3" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    The mission enters "Reconciliation Mode" — a structured chat room where both parties state their case and propose a solution. The goal is peer-to-peer, out-of-court resolution. We provide the audit trail, but we do not arbitrate, judge, or absorb liability. Professional and Enterprise plans get priority access to mediation.
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q4" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    Which currencies are supported?
                  </button>
                </h2>
                <div id="q4" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    USD, EUR, GBP, MAD, AED, SAR, CAD, AUD, JPY, CHF, and 30+ more. Each Agent selects their operating currency; the platform fee (1% with a $1 minimum) is calculated dynamically in that currency.
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q5" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    Can my company connect Dossiat to our ERP?
                  </button>
                </h2>
                <div id="q5" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    Yes — on the Enterprise tier. You get a dedicated REST API and webhook system to create missions, fetch expense data, and push reconciliation events directly into your internal tools.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card reveal">
          <span class="hero-badge mb-3"><span class="pulse"></span> Limited spots in private beta</span>
          <h2>Start running missions <span class="text-grad">without the friction.</span></h2>
          <p class="section-sub mx-auto mb-4" style="font-size:1.1rem;">Join hundreds of Agents and B2B teams who use Dossiat to coordinate, bill, and resolve work across borders.</p>
          <div class="d-flex flex-wrap justify-content-center gap-3">
            <a href="#" class="btn btn-grad"><i class="bi bi-rocket-takeoff me-2"></i> Request early access</a>
            <a href="#" class="btn btn-outline-light-custom"><i class="bi bi-calendar me-2"></i> Book a 15-min demo</a>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="footer-brand mb-3 d-flex align-items-center gap-2"><span class="dot"></span> Dossiat</div>
            <p class="text-muted-2 mb-3" style="max-width:340px;">A decentralized mission network for Agents and the clients who trust them. Software layer only — never a bank, never an employer.</p>
            <div class="d-flex gap-3">
              <a href="#" class="fs-5"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="fs-5"><i class="bi bi-linkedin"></i></a>
              <a href="#" class="fs-5"><i class="bi bi-github"></i></a>
              <a href="#" class="fs-5"><i class="bi bi-discord"></i></a>
            </div>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>Product</h6>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Changelog</a>
            <a href="#">Roadmap</a>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>Company</h6>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Press kit</a>
            <a href="#">Contact</a>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>Resources</h6>
            <a href="#">Help center</a>
            <a href="#">Agent guide</a>
            <a href="#">API docs</a>
            <a href="#">Status</a>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>Legal</h6>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
            <a href="#">DPA</a>
          </div>
        </div>
        <div class="footer-bottom d-flex flex-wrap justify-content-between align-items-center">
          <div>&copy; 2026 Dossiat. All rights reserved.</div>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-globe"></i> English
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
