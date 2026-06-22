import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'

/* ─── NProgress configuration ─── */
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })

/* ─── Route definitions ─── */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* ── Public routes ── */
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue'),
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('@/views/Demo.vue'),
    },

    /* ── Auth routes (guest-only) ── */
    {
      path: '/',
      component: () => import('@/components/layout/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { requiresGuest: true, title: 'Login' },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
          meta: { requiresGuest: true, title: 'Register' },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
          meta: { requiresGuest: true, title: 'Forgot Password' },
        },
        {
          path: 'reset-password/:token',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
          meta: { requiresGuest: true, title: 'Reset Password' },
        },
        {
          path: 'verify-email/:token',
          name: 'verify-email',
          component: () => import('@/views/auth/VerifyEmailView.vue'),
          meta: { title: 'Verify Email' },
        },
      ],
    },

    /* ── Protected app routes ── */
    {
      path: '/app',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Dashboard' },
        },
        {
          path: 'missions',
          name: 'missions',
          component: () => import('@/views/missions/MissionListView.vue'),
          meta: { requiresAuth: true, title: 'Missions' },
        },
        {
          path: 'missions/create',
          name: 'mission-create',
          component: () => import('@/views/missions/MissionCreateView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Create Mission' },
        },
        {
          path: 'missions/:id',
          name: 'mission-detail',
          component: () => import('@/views/missions/MissionDetailView.vue'),
          meta: { requiresAuth: true, title: 'Mission Detail' },
        },
        {
          path: 'missions/:id/agree',
          name: 'mission-agree',
          component: () => import('@/views/missions/MissionAgreementView.vue'),
          meta: { requiresAuth: true, title: 'Mission Agreement' },
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/views/messages/MessageListView.vue'),
          meta: { requiresAuth: true, title: 'Messages' },
        },
        {
          path: 'messages/:missionId',
          name: 'message-thread',
          component: () => import('@/views/messages/MessageThreadView.vue'),
          meta: { requiresAuth: true, title: 'Message Thread' },
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/views/payments/PaymentSummaryView.vue'),
          meta: { requiresAuth: true, title: 'Payments' },
        },
        {
          path: 'payments/record',
          name: 'payment-record',
          component: () => import('@/views/payments/PaymentRecordView.vue'),
          meta: { requiresAuth: true, title: 'Record Payment' },
        },
        {
          path: 'payments/:id/confirm',
          name: 'payment-confirm',
          component: () => import('@/views/payments/PaymentConfirmationView.vue'),
          meta: { requiresAuth: true, title: 'Confirm Payment' },
        },
        {
          path: 'credits',
          name: 'credits',
          component: () => import('@/views/payments/CreditBalanceView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Credits' },
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/views/payments/InvoiceListView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Invoices' },
        },
        {
          path: 'stripe/connect',
          name: 'stripe-connect',
          component: () => import('@/views/payments/StripeConnectView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Stripe Connect' },
        },
        {
          path: 'subscriptions',
          redirect: { name: 'subscription-manage' },
        },
        {
          path: 'subscriptions/plans',
          name: 'subscription-plans',
          component: () => import('@/views/subscription/SubscriptionPlansView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Subscription Plans' },
        },
        {
          path: 'subscriptions/manage',
          name: 'subscription-manage',
          component: () => import('@/views/subscription/SubscriptionManageView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Manage Subscription' },
        },
        {
          path: 'subscriptions/billing',
          name: 'subscription-billing',
          component: () => import('@/views/subscription/SubscriptionBillingView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Billing History' },
        },
        {
          path: 'disputes',
          name: 'disputes',
          component: () => import('@/views/disputes/DisputeListView.vue'),
          meta: { requiresAuth: true, title: 'Disputes' },
        },
        {
          path: 'disputes/initiate',
          name: 'dispute-initiate',
          component: () => import('@/views/disputes/DisputeInitiateView.vue'),
          meta: { requiresAuth: true, title: 'Initiate Dispute' },
        },
        {
          path: 'disputes/:id',
          name: 'dispute-detail',
          component: () => import('@/views/disputes/DisputeDetailView.vue'),
          meta: { requiresAuth: true, title: 'Dispute Detail' },
        },
        {
          path: 'onboarding',
          name: 'onboarding',
          component: () => import('@/views/agent/AgentProfileSetup.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Profile Setup' },
        },
        {
          path: 'settings',
          component: () => import('@/views/settings/SettingsLayout.vue'),
          meta: { requiresAuth: true, title: 'Settings' },
          children: [
            {
              path: '',
              name: 'settings',
              component: () => import('@/views/settings/SettingsView.vue'),
              meta: { requiresAuth: true, title: 'Account Settings' },
            },
            {
              path: 'notifications',
              name: 'settings-notifications',
              component: () => import('@/views/settings/NotificationSettingsView.vue'),
              meta: { requiresAuth: true, title: 'Notification Settings' },
            },
            {
              path: 'appearance',
              name: 'settings-appearance',
              component: () => import('@/views/settings/AppearanceSettingsView.vue'),
              meta: { requiresAuth: true, title: 'Appearance Settings' },
            },
          ],
        },
        {
          path: 'client/profile',
          name: 'client-profile',
          component: () => import('@/views/client/ClientProfileView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Client Profile' },
        },
        {
          path: 'client/settings',
          name: 'client-settings',
          component: () => import('@/views/client/ClientSettingsView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Client Settings' },
        },
        {
          path: 'discover',
          name: 'discover-agents',
          component: () => import('@/views/client/AgentDiscoveryView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Discover Agents' },
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, roles: ['admin'], title: 'Admin' },
        },
      ],
    },

    /* ── Public agent profile ── */
    {
      path: '/agents/:slug',
      name: 'agent-profile',
      component: () => import('@/views/agent/AgentProfileView.vue'),
      meta: { title: 'Agent Profile' },
    },

    /* ── 404 catch-all ── */
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/LandingPage.vue'),
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

/* ─── Navigation guards ─── */
let userLoaded = false

router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const authStore = useAuthStore()

  // Load user from localStorage on first navigation (page refresh scenario)
  if (!userLoaded && !authStore.isAuthenticated) {
    userLoaded = true
    await authStore.loadUser()
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresGuest = to.meta.requiresGuest === true
  const requiredRoles = to.meta.roles as string[] | undefined

  // Redirect unauthenticated users to login
  if (requiresAuth && !authStore.isAuthenticated) {
    NProgress.done()
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Redirect authenticated users away from guest-only pages
  if (requiresGuest && authStore.isAuthenticated) {
    NProgress.done()
    return next({ name: 'dashboard' })
  }

  // Role-based access control
  if (requiredRoles && authStore.user) {
    const hasRequiredRole = requiredRoles.some((role) => authStore.hasRole(role))
    if (!hasRequiredRole) {
      NProgress.done()
      return next({ name: 'dashboard' })
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
