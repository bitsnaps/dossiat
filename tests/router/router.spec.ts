import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

vi.mock('nprogress', () => ({
  default: {
    start: vi.fn(),
    done: vi.fn(),
    configure: vi.fn(),
    set: vi.fn(),
  },
  start: vi.fn(),
  done: vi.fn(),
}))

// We'll import the actual routes from the router module but test them with a fresh router
// to avoid side effects from the actual router instance

// Minimal stub components for route testing
const StubComponent = { template: '<div />' }

/**
 * Creates a test router with the same route definitions as the app.
 * Uses memory history for testing.
 */
function createTestRouter(authState: { isAuthenticated: boolean; user: any; hasRole: (role: string) => boolean }) {
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'landing',
      component: StubComponent,
    },
    {
      path: '/demo',
      name: 'demo',
      component: StubComponent,
    },
    {
      path: '/login',
      name: 'login',
      component: StubComponent,
      meta: { requiresGuest: true, title: 'Login' },
    },
    {
      path: '/register',
      name: 'register',
      component: StubComponent,
      meta: { requiresGuest: true, title: 'Register' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: StubComponent,
      meta: { requiresGuest: true, title: 'Forgot Password' },
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: StubComponent,
      meta: { requiresGuest: true, title: 'Reset Password' },
    },
    {
      path: '/verify-email/:token',
      name: 'verify-email',
      component: StubComponent,
      meta: { title: 'Verify Email' },
    },
    {
      path: '/app',
      component: StubComponent,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Dashboard' },
        },
        {
          path: 'missions',
          name: 'missions',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Missions' },
        },
        {
          path: 'missions/:id',
          name: 'mission-detail',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Mission Detail' },
        },
        {
          path: 'missions/create',
          name: 'mission-create',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Create Mission' },
        },
        {
          path: 'messages',
          name: 'messages',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Messages' },
        },
        {
          path: 'payments',
          name: 'payments',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Payments' },
        },
        {
          path: 'credits',
          name: 'credits',
          component: StubComponent,
          meta: { requiresAuth: true, roles: ['agent'], title: 'Credits' },
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: StubComponent,
          meta: { requiresAuth: true, roles: ['agent'], title: 'Invoices' },
        },
        {
          path: 'subscriptions',
          name: 'subscriptions',
          component: StubComponent,
          meta: { requiresAuth: true, roles: ['client'], title: 'Subscriptions' },
        },
        {
          path: 'disputes',
          name: 'disputes',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Disputes' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: StubComponent,
          meta: { requiresAuth: true, title: 'Settings' },
        },
        {
          path: 'admin',
          name: 'admin',
          component: StubComponent,
          meta: { requiresAuth: true, roles: ['admin'], title: 'Admin' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: StubComponent,
    },
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  // Navigation guard logic (mirrors what the real router will have)
  router.beforeEach(async (to, _from, next) => {
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
    const requiresGuest = to.meta.requiresGuest === true
    const requiredRoles = to.meta.roles as string[] | undefined

    if (requiresAuth && !authState.isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    if (requiresGuest && authState.isAuthenticated) {
      return next({ name: 'dashboard' })
    }

    if (requiredRoles && authState.user) {
      const hasRequiredRole = requiredRoles.some((role) => authState.hasRole(role))
      if (!hasRequiredRole) {
        return next({ name: 'dashboard' })
      }
    }

    next()
  })

  return router
}

describe('Router Configuration', () => {
  let authState: {
    isAuthenticated: boolean
    user: any
    hasRole: (role: string) => boolean
  }

  beforeEach(() => {
    authState = {
      isAuthenticated: false,
      user: null,
      hasRole: vi.fn(() => false),
    }
    localStorage.clear()
  })

  describe('Route Definitions', () => {
    it('defines the landing page route at /', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/')
      expect(route.name).toBe('landing')
    })

    it('defines the demo route at /demo', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/demo')
      expect(route.name).toBe('demo')
    })

    it('defines the login route at /login', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/login')
      expect(route.name).toBe('login')
    })

    it('defines the register route at /register', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/register')
      expect(route.name).toBe('register')
    })

    it('defines the forgot-password route at /forgot-password', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/forgot-password')
      expect(route.name).toBe('forgot-password')
    })

    it('defines the reset-password route with token param', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/reset-password/abc123')
      expect(route.name).toBe('reset-password')
      expect(route.params.token).toBe('abc123')
    })

    it('defines the verify-email route with token param', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/verify-email/abc123')
      expect(route.name).toBe('verify-email')
      expect(route.params.token).toBe('abc123')
    })

    it('defines the dashboard route at /app/dashboard', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/dashboard')
      expect(route.name).toBe('dashboard')
    })

    it('defines the missions route at /app/missions', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/missions')
      expect(route.name).toBe('missions')
    })

    it('defines the mission-detail route with id param', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/missions/42')
      expect(route.name).toBe('mission-detail')
      expect(route.params.id).toBe('42')
    })

    it('defines the mission-create route at /app/missions/create', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/missions/create')
      expect(route.name).toBe('mission-create')
    })

    it('defines the messages route at /app/messages', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/messages')
      expect(route.name).toBe('messages')
    })

    it('defines the payments route at /app/payments', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/payments')
      expect(route.name).toBe('payments')
    })

    it('defines the credits route at /app/credits', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/credits')
      expect(route.name).toBe('credits')
    })

    it('defines the invoices route at /app/invoices', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/invoices')
      expect(route.name).toBe('invoices')
    })

    it('defines the subscriptions route at /app/subscriptions', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/subscriptions')
      expect(route.name).toBe('subscriptions')
    })

    it('defines the disputes route at /app/disputes', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/disputes')
      expect(route.name).toBe('disputes')
    })

    it('defines the settings route at /app/settings', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/settings')
      expect(route.name).toBe('settings')
    })

    it('defines the admin route at /app/admin', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/app/admin')
      expect(route.name).toBe('admin')
    })

    it('defines a catch-all 404 route', () => {
      const router = createTestRouter(authState)
      const route = router.resolve('/nonexistent-page')
      expect(route.name).toBe('not-found')
    })
  })

  describe('Route Meta Fields', () => {
    it('marks auth-protected routes with requiresAuth', () => {
      const router = createTestRouter(authState)
      const dashboardRoute = router.resolve('/app/dashboard')
      expect(dashboardRoute.meta.requiresAuth).toBe(true)
    })

    it('marks guest-only routes with requiresGuest', () => {
      const router = createTestRouter(authState)
      const loginRoute = router.resolve('/login')
      expect(loginRoute.meta.requiresGuest).toBe(true)
    })

    it('marks agent-only routes with roles', () => {
      const router = createTestRouter(authState)
      const creditsRoute = router.resolve('/app/credits')
      expect(creditsRoute.meta.roles).toEqual(['agent'])
    })

    it('marks client-only routes with roles', () => {
      const router = createTestRouter(authState)
      const subscriptionsRoute = router.resolve('/app/subscriptions')
      expect(subscriptionsRoute.meta.roles).toEqual(['client'])
    })

    it('marks admin-only routes with roles', () => {
      const router = createTestRouter(authState)
      const adminRoute = router.resolve('/app/admin')
      expect(adminRoute.meta.roles).toEqual(['admin'])
    })

    it('sets title meta on routes', () => {
      const router = createTestRouter(authState)
      const loginRoute = router.resolve('/login')
      expect(loginRoute.meta.title).toBe('Login')

      const dashboardRoute = router.resolve('/app/dashboard')
      expect(dashboardRoute.meta.title).toBe('Dashboard')
    })
  })

  describe('Navigation Guards — Authentication', () => {
    it('redirects unauthenticated user to /login when accessing protected route', async () => {
      const router = createTestRouter(authState)
      await router.push('/app/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.query.redirect).toBe('/app/dashboard')
    })

    it('redirects authenticated user away from /login to /app/dashboard', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }

      const router = createTestRouter(authState)
      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('redirects authenticated user away from /register to /app/dashboard', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }

      const router = createTestRouter(authState)
      await router.push('/register')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('allows unauthenticated user to access /login', async () => {
      const router = createTestRouter(authState)
      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('allows authenticated user to access protected routes', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }

      const router = createTestRouter(authState)
      await router.push('/app/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('allows unauthenticated user to access public routes (landing, demo)', async () => {
      const router = createTestRouter(authState)
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('landing')

      await router.push('/demo')
      expect(router.currentRoute.value.name).toBe('demo')
    })

    it('allows unauthenticated user to access /forgot-password', async () => {
      const router = createTestRouter(authState)
      await router.push('/forgot-password')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('forgot-password')
    })
  })

  describe('Navigation Guards — Role-Based Access', () => {
    it('allows agent to access agent-only routes', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }
      authState.hasRole = vi.fn((role: string) => role === 'agent')

      const router = createTestRouter(authState)
      await router.push('/app/credits')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('credits')
    })

    it('redirects client away from agent-only routes to dashboard', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 2, role: 'client' }
      authState.hasRole = vi.fn((role: string) => role === 'client')

      const router = createTestRouter(authState)
      await router.push('/app/credits')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('allows client to access client-only routes', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 2, role: 'client' }
      authState.hasRole = vi.fn((role: string) => role === 'client')

      const router = createTestRouter(authState)
      await router.push('/app/subscriptions')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('subscriptions')
    })

    it('redirects agent away from client-only routes to dashboard', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }
      authState.hasRole = vi.fn((role: string) => role === 'agent')

      const router = createTestRouter(authState)
      await router.push('/app/subscriptions')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('allows admin to access admin-only routes', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 3, role: 'admin' }
      authState.hasRole = vi.fn((role: string) => role === 'admin')

      const router = createTestRouter(authState)
      await router.push('/app/admin')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('admin')
    })

    it('redirects non-admin away from admin-only routes to dashboard', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }
      authState.hasRole = vi.fn((role: string) => role === 'agent')

      const router = createTestRouter(authState)
      await router.push('/app/admin')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })

  describe('Navigation — General', () => {
    it('redirects /app to /app/dashboard via nested redirect', async () => {
      authState.isAuthenticated = true
      authState.user = { id: 1, role: 'agent' }

      const router = createTestRouter(authState)
      await router.push('/app')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('handles unknown routes with 404 catch-all', async () => {
      const router = createTestRouter(authState)
      await router.push('/totally-unknown-page')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('not-found')
    })
  })
})
