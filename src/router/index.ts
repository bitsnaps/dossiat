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
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Missions' },
        },
        {
          path: 'missions/create',
          name: 'mission-create',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Create Mission' },
        },
        {
          path: 'missions/:id',
          name: 'mission-detail',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Mission Detail' },
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Messages' },
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Payments' },
        },
        {
          path: 'credits',
          name: 'credits',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Credits' },
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, roles: ['agent'], title: 'Invoices' },
        },
        {
          path: 'subscriptions',
          name: 'subscriptions',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, roles: ['client'], title: 'Subscriptions' },
        },
        {
          path: 'disputes',
          name: 'disputes',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Disputes' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, title: 'Settings' },
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/DashboardView.vue'),
          meta: { requiresAuth: true, roles: ['admin'], title: 'Admin' },
        },
      ],
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
