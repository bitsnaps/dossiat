<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDirection } from '@/composables/useDirection'
import { useAuthStore } from '@/stores/auth'
import BLanguageSwitcher from '@/components/base/BLanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
useDirection()

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

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
        <RouterLink class="navbar-brand d-flex align-items-center gap-2 text-accent" to="/">
          <span class="dot"></span> Dossiat
        </RouterLink>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <i class="bi bi-list text-light fs-3"></i>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link" href="#features">{{ t('nav.features') }}</a></li>
            <li class="nav-item"><a class="nav-link" href="#how">{{ t('nav.howItWorks') }}</a></li>
            <li class="nav-item"><a class="nav-link" href="#agents">{{ t('nav.forAgents') }}</a></li>
            <li class="nav-item"><a class="nav-link" href="#pricing">{{ t('nav.pricing') }}</a></li>
            <li class="nav-item"><a class="nav-link" href="#faq">{{ t('nav.faq') }}</a></li>
          </ul>
          <div class="d-flex gap-2 mt-3 mt-lg-0 align-items-center">
            <BLanguageSwitcher />
            <template v-if="!authStore.isAuthenticated">
              <RouterLink to="/login" class="btn btn-outline-light-custom">{{ t('nav.signIn') }}</RouterLink>
              <RouterLink to="/register" class="btn btn-accent">{{ t('nav.getStarted') }}</RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/app/dashboard" class="btn btn-outline-light-custom">{{ t('nav.dashboard') }}</RouterLink>
              <button class="btn btn-accent" @click="handleLogout">{{ t('layout.topbar.logout') }}</button>
            </template>
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
            <span class="hero-badge"><span class="pulse"></span> {{ t('hero.badge') }}</span>
            <h1 class="reveal">{{ t('hero.titlePart1') }} <em>{{ t('hero.titleEmphasis') }}</em>{{ t('hero.titlePart2') }}</h1>
            <p class="lead reveal">{{ t('hero.subtitle') }}</p>
            <div class="d-flex flex-wrap gap-3 mt-4 reveal">
              <a href="#pricing" class="btn btn-accent"><i class="bi bi-rocket-takeoff me-2"></i> {{ t('hero.ctaStart') }}</a>
              <a href="#how" class="btn btn-outline-light-custom"><i class="bi bi-play-circle me-2"></i> {{ t('hero.ctaHow') }}</a>
            </div>
            <div class="d-flex align-items-center gap-4 mt-5 reveal">
              <div class="d-flex">
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#7c5cff,#00d4ff);margin-inline-end:-10px;"></div>
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#c8ff00,#ff7a59);margin-inline-end:-10px;"></div>
                <div class="rounded-circle border border-2 border-dark" style="width:38px;height:38px;background:linear-gradient(135deg,#00d4ff,#7c5cff);"></div>
              </div>
              <div>
                <div class="fw-bold font-mono">2,400+</div>
                <div class="text-muted-2 small">{{ t('hero.agentsOnboarded') }}</div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="mockup-wrap">
              <div class="mockup">
                <div class="mockup-header">
                  <div class="mockup-dots"><span></span><span></span><span></span></div>
                  <div class="mockup-title">{{ t('mockup.url') }}</div>
                  <i class="bi bi-three-dots text-muted-2"></i>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-receipt-cutoff"></i></div>
                  <div class="mission-meta">
                    <div class="title">{{ t('mockup.mission1Title') }}</div>
                    <div class="sub">{{ t('mockup.mission1Sub') }}</div>
                  </div>
                  <span class="status-pill status-progress">{{ t('mockup.mission1Status') }}</span>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-file-earmark-text"></i></div>
                  <div class="mission-meta">
                    <div class="title">{{ t('mockup.mission2Title') }}</div>
                    <div class="sub">{{ t('mockup.mission2Sub') }}</div>
                  </div>
                  <span class="status-pill status-done">{{ t('mockup.mission2Status') }}</span>
                </div>
                <div class="mission-card">
                  <div class="mission-icon"><i class="bi bi-arrow-repeat"></i></div>
                  <div class="mission-meta">
                    <div class="title">{{ t('mockup.mission3Title') }}</div>
                    <div class="sub">{{ t('mockup.mission3Sub') }}</div>
                  </div>
                  <span class="status-pill status-recurrent">{{ t('mockup.mission3Status') }}</span>
                </div>
              </div>
              <div class="floating-stat stat-1">
                <i class="bi bi-shield-check text-accent"></i>
                <div>
                  <div class="label">{{ t('mockup.statusLabel') }}</div>
                  <div class="val">{{ t('mockup.verifiedAgent') }}</div>
                </div>
              </div>
              <div class="floating-stat stat-2">
                <i class="bi bi-currency-exchange" style="color:var(--ds-accent-3)"></i>
                <div>
                  <div class="label">{{ t('mockup.missionLabel') }}</div>
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
            <div class="trust-text">{{ t('trustBar.label') }}</div>
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
          <span class="section-label justify-content-center mx-auto d-inline-flex">{{ t('features.sectionLabel') }}</span>
          <h2 class="section-title reveal">{{ t('features.title') }}</h2>
          <p class="section-sub mx-auto reveal">{{ t('features.subtitle') }}</p>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-accent"><i class="bi bi-tags"></i></div>
              <h4>{{ t('features.quotingTitle') }}</h4>
              <p>{{ t('features.quotingDesc') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.quotingItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.quotingItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.quotingItem3') }}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-grad"><i class="bi bi-arrow-repeat"></i></div>
              <h4>{{ t('features.recurrentTitle') }}</h4>
              <p>{{ t('features.recurrentDesc') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.recurrentItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.recurrentItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.recurrentItem3') }}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-purple"><i class="bi bi-list-check"></i></div>
              <h4>{{ t('features.agreementTitle') }}</h4>
              <p>{{ t('features.agreementDesc') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.agreementItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.agreementItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.agreementItem3') }}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-warm"><i class="bi bi-wallet2"></i></div>
              <h4>{{ t('features.paymentsTitle') }}</h4>
              <p>{{ t('features.paymentsDesc') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.paymentsItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.paymentsItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.paymentsItem3') }}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-accent"><i class="bi bi-percent"></i></div>
              <h4>{{ t('features.feeTitle') }}</h4>
              <p>{{ t('features.feeDesc1') }} <strong>1%</strong> {{ t('features.feeDesc2') }} <strong>$1 minimum</strong>{{ t('features.feeDesc3') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.feeItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.feeItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.feeItem3') }}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card reveal">
              <div class="feature-icon fi-grad"><i class="bi bi-shield-shaded"></i></div>
              <h4>{{ t('features.mediationTitle') }}</h4>
              <p>{{ t('features.mediationDesc') }}</p>
              <ul class="feature-list">
                <li><i class="bi bi-check2"></i> {{ t('features.mediationItem1') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.mediationItem2') }}</li>
                <li><i class="bi bi-check2"></i> {{ t('features.mediationItem3') }}</li>
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
          <span class="section-label justify-content-center mx-auto d-inline-flex">{{ t('workflow.sectionLabel') }}</span>
          <h2 class="section-title reveal">{{ t('workflow.title') }}</h2>
          <p class="section-sub mx-auto reveal">{{ t('workflow.subtitle') }}</p>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">{{ t('workflow.step1Label') }}</span>
              <h5>{{ t('workflow.step1Title') }}</h5>
              <p>{{ t('workflow.step1Desc') }}</p>
              <div class="mt-3"><i class="bi bi-link-45deg fs-2 text-accent"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">{{ t('workflow.step2Label') }}</span>
              <h5>{{ t('workflow.step2Title') }}</h5>
              <p>{{ t('workflow.step2Desc') }}</p>
              <div class="mt-3"><i class="bi bi-check2-square fs-2" style="color:var(--ds-accent-3)"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">{{ t('workflow.step3Label') }}</span>
              <h5>{{ t('workflow.step3Title') }}</h5>
              <p>{{ t('workflow.step3Desc') }}</p>
              <div class="mt-3"><i class="bi bi-camera fs-2" style="color:#b09aff"></i></div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="step-card reveal">
              <span class="step-num">{{ t('workflow.step4Label') }}</span>
              <h5>{{ t('workflow.step4Title') }}</h5>
              <p>{{ t('workflow.step4Desc') }}</p>
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
            <span class="section-label">{{ t('agents.sectionLabel') }}</span>
            <h2 class="section-title reveal">{{ t('agents.titlePart1') }} <span class="text-grad">{{ t('agents.titleGrad') }}</span></h2>
            <p class="section-sub mb-4 reveal">{{ t('agents.subtitle') }}</p>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-accent" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-person-badge"></i></div>
                <div>
                  <h6 class="mb-1 font-mono" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">{{ t('agents.feature1Title') }}</h6>
                  <p class="text-muted-2 small mb-0">{{ t('agents.feature1Desc') }}</p>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-grad" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-share"></i></div>
                <div>
                  <h6 class="mb-1" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">{{ t('agents.feature2Title') }}</h6>
                  <p class="text-muted-2 small mb-0">{{ t('agents.feature2Desc') }}</p>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-start reveal">
                <div class="feature-icon fi-purple" style="width:44px;height:44px;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-cash-stack"></i></div>
                <div>
                  <h6 class="mb-1" style="font-family:'Space Grotesk',sans-serif;font-weight:600;">{{ t('agents.feature3Title') }}</h6>
                  <p class="text-muted-2 small mb-0">{{ t('agents.feature3Desc') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="agent-mockup reveal">
              <div class="agent-profile">
                <div class="agent-avatar">YB</div>
                <div class="agent-info flex-grow-1">
                  <h6>{{ t('agents.profileName') }}</h6>
                  <div class="role">{{ t('agents.profileRole') }}</div>
                </div>
                <span class="status-pill status-done"><i class="bi bi-patch-check-fill"></i> {{ t('agents.verified') }}</span>
              </div>
              <div class="agent-stats">
                <div class="agent-stat"><div class="num">312</div><div class="lbl">{{ t('agents.statMissions') }}</div></div>
                <div class="agent-stat"><div class="num">4.96</div><div class="lbl">{{ t('agents.statRating') }}</div></div>
                <div class="agent-stat"><div class="num">98%</div><div class="lbl">{{ t('agents.statOntime') }}</div></div>
              </div>
              <div class="mb-3">
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">{{ t('agents.specialties') }}</small>
                <span class="specialty-tag"><i class="bi bi-bank me-1"></i> {{ t('agents.finance') }}</span>
                <span class="specialty-tag"><i class="bi bi-file-earmark-medical me-1"></i> {{ t('agents.admin') }}</span>
                <span class="specialty-tag"><i class="bi bi-building me-1"></i> {{ t('agents.realEstate') }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">{{ t('agents.accepts') }}</small>
                <span class="specialty-tag"><i class="bi bi-building-fill me-1"></i> B2B</span>
                <span class="specialty-tag"><i class="bi bi-person-fill me-1"></i> B2C</span>
              </div>
              <div>
                <small class="text-muted-2 d-block mb-2 font-mono" style="font-family:'Space Grotesk',sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">{{ t('agents.inviteLinkLabel') }}</small>
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
          <span class="section-label justify-content-center mx-auto d-inline-flex">{{ t('pricing.sectionLabel') }}</span>
          <h2 class="section-title reveal">{{ t('pricing.title') }}</h2>
          <p class="section-sub mx-auto reveal">{{ t('pricing.subtitle') }}</p>
        </div>
        <div class="row g-4 align-items-stretch">
          <div class="col-lg-4">
            <div class="pricing-card reveal">
              <div class="tier-name">{{ t('pricing.smallBusiness') }}</div>
              <div class="tier-price"><span class="currency">$</span>29<span class="per">{{ t('pricing.perMonth') }}</span></div>
              <div class="tier-target">{{ t('pricing.smallBusinessTarget') }}</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature1', { count: t('pricing.feature1Count2') }) }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature2Recurrent', { count: t('pricing.feature2Recurrent10') }) }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature3Messaging') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature4Basic') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature5Email') }}</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> {{ t('pricing.feature6') }}</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> {{ t('pricing.feature7') }}</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> {{ t('pricing.feature8') }}</li>
              </ul>
              <RouterLink to="/register" class="btn btn-outline-light-custom w-100">{{ t('pricing.ctaSmall') }}</RouterLink>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="pricing-card popular reveal">
              <span class="popular-badge">{{ t('pricing.mostPopular') }}</span>
              <div class="tier-name">{{ t('pricing.professional') }}</div>
              <div class="tier-price"><span class="currency">$</span>99<span class="per">{{ t('pricing.perMonth') }}</span></div>
              <div class="tier-target">{{ t('pricing.professionalTarget') }}</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature1', { count: t('pricing.feature1Count10') }) }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature2Unlimited') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature3Messaging') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature4Custom') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature5Team') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature5Priority') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature5PriorityChat') }}</li>
                <li class="disabled"><i class="bi bi-dash-circle"></i> {{ t('pricing.feature8') }}</li>
              </ul>
              <RouterLink to="/register" class="btn btn-grad w-100">{{ t('pricing.ctaPro') }}</RouterLink>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="pricing-card reveal">
              <div class="tier-name">{{ t('pricing.enterprise') }}</div>
              <div class="tier-price"><span class="currency">$</span>499<span class="per">{{ t('pricing.perMonth') }}</span></div>
              <div class="tier-target">{{ t('pricing.enterpriseTarget') }}</div>
              <div class="pricing-divider"></div>
              <ul class="pricing-features">
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseUnlimitedSeats') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.feature2Unlimited') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseBulkCsv') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseDedicatedApi') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseDataRetention') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseSso') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseSuccess') }}</li>
                <li><i class="bi bi-check2-circle"></i> {{ t('pricing.featureEnterpriseSupport') }}</li>
              </ul>
              <RouterLink to="/register" class="btn btn-outline-light-custom w-100">{{ t('pricing.ctaEnterprise') }}</RouterLink>
            </div>
          </div>
        </div>
        <p class="text-center text-muted-2 mt-4 small">{{ t('pricing.currencyNote') }}</p>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="workflow-section">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-4">
            <span class="section-label">{{ t('faq.sectionLabel') }}</span>
            <h2 class="section-title reveal">{{ t('faq.title') }}</h2>
            <p class="section-sub reveal">{{ t('faq.subtitle') }}</p>
            <RouterLink to="/register" class="btn btn-outline-light-custom mt-3"><i class="bi bi-envelope me-2"></i> {{ t('faq.contactUs') }}</RouterLink>
          </div>
          <div class="col-lg-8">
            <div class="accordion accordion-flush" id="faqAcc">
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q1" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    {{ t('faq.q1') }}
                  </button>
                </h2>
                <div id="q1" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    {{ t('faq.a1') }}
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    {{ t('faq.q2') }}
                  </button>
                </h2>
                <div id="q2" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    {{ t('faq.a2') }}
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q3" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    {{ t('faq.q3') }}
                  </button>
                </h2>
                <div id="q3" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    {{ t('faq.a3') }}
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q4" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    {{ t('faq.q4') }}
                  </button>
                </h2>
                <div id="q4" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    {{ t('faq.a4') }}
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:16px;margin-bottom:0.8rem;overflow:hidden;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q5" style="background:transparent;color:var(--ds-text);font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;padding:1.4rem 1.5rem;">
                    {{ t('faq.q5') }}
                  </button>
                </h2>
                <div id="q5" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                  <div class="accordion-body text-muted-2" style="padding:0 1.5rem 1.4rem;">
                    {{ t('faq.a5') }}
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
          <span class="hero-badge mb-3"><span class="pulse"></span> {{ t('cta.badge') }}</span>
          <h2>{{ t('cta.title1') }} <span class="text-grad">{{ t('cta.titleGrad') }}</span></h2>
          <p class="section-sub mx-auto mb-4" style="font-size:1.1rem;">{{ t('cta.subtitle') }}</p>
          <div class="d-flex flex-wrap justify-content-center gap-3">
            <RouterLink to="/register" class="btn btn-grad"><i class="bi bi-rocket-takeoff me-2"></i> {{ t('cta.ctaAccess') }}</RouterLink>
            <RouterLink to="/login" class="btn btn-outline-light-custom"><i class="bi bi-calendar me-2"></i> {{ t('cta.ctaDemo') }}</RouterLink>
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
            <p class="text-muted-2 mb-3" style="max-width:340px;">{{ t('footer.tagline') }}</p>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>{{ t('footer.product') }}</h6>
            <a href="#features">{{ t('footer.features') }}</a>
            <a href="#how">{{ t('footer.howItWorks') }}</a>
            <a href="#pricing">{{ t('footer.pricing') }}</a>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h6>{{ t('footer.legal') }}</h6>
            <RouterLink to="/terms">{{ t('footer.terms') }}</RouterLink>
            <RouterLink to="/privacy">{{ t('footer.privacy') }}</RouterLink>
          </div>
        </div>
        <div class="footer-bottom d-flex flex-wrap justify-content-between align-items-center">
          <div>{{ t('footer.copyright') }}</div>
          <div class="d-flex align-items-center gap-2">
            <BLanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
