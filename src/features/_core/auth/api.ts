import { Elysia } from 'elysia'
import { AuthService, LoginSchema, RegisterSchema } from './service'
import { AuthRepository } from './repository'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { inertia, type Inertia } from '../../../inertia/plugin'
import { google, getGoogleUserInfo, type GoogleUserInfo } from './google'
import { generateState, generateCodeVerifier } from 'arctic'

// Extend Elysia context
declare module 'elysia' {
  interface ElysiaInstance {
    inertia: Inertia
    user: {
      id: string  // UUID v7
      email: string
      name: string
      role: string
    } | null
  }
}

/**
 * Auth API - Public routes for authentication
 * Use createProtectedApi() from './protected' for protected routes
 */
export const authApi = new Elysia({ prefix: '/auth' })
  .use(inertia())
  .use(cookie())
  .use(jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    exp: '7d'
  }))
  
  // Dependency injection
  .derive(() => ({
    authService: new AuthService(),
    authRepo: new AuthRepository()
  }))

  // GET /auth/login - Show login page
  .get('/login', (ctx) => {
    return ctx.inertia.render('auth/Login', {
      errors: {},
      status: null
    })
  })

  // POST /auth/login - Handle login
  .post('/login', async (ctx) => {
    const { body, authService, jwt, cookie, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      const user = await authService.attempt(body.email, body.password)
      
      // Create token with UUID sub and role
      const token = await jwt.sign({ 
        sub: user.id,  // UUID v7
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      })

      // Set cookie
      cookie.auth.set({
        value: token,
        httpOnly: true,
        maxAge: body.remember ? 86400 * 30 : 86400, // 30 days or 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })

      return inertia.redirect('/dashboard')
      
    } catch (error) {
      return inertia.render('auth/Login', {
        errors: { email: error instanceof Error ? error.message : 'Login failed' },
        status: null
      })
    }
  }, {
    body: LoginSchema
  })

  // GET /auth/register
  .get('/register', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('auth/Register', { errors: {} })
  })

  // POST /auth/register
  .post('/register', async (ctx) => {
    const { body, authService, jwt, cookie, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      const user = await authService.register(body)

      // Create token (auto-login)
      const token = await jwt.sign({ 
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      })

      // Set cookie
      cookie.auth.set({
        value: token,
        httpOnly: true,
        maxAge: 86400, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
      
      return inertia.redirect('/dashboard')
      
    } catch (error) {
      return inertia.render('auth/Register', {
        errors: { 
          email: error instanceof Error ? error.message : 'Registration failed' 
        }
      })
    }
  }, {
    body: RegisterSchema
  })

  // POST /auth/logout
  .post('/logout', async (ctx) => {
    const { cookie, jwt, authRepo, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const token = (cookie.auth as { value?: string }).value
    if (token) {
      try {
        await jwt.verify(token) // Just to decode
        await authRepo.deleteSession(token)
      } catch {
        // Ignore invalid token
      }
    }
    
    ;(cookie.auth as { remove: () => void }).remove()
    return inertia.redirect('/auth/login')
  })

  // GET /auth/google - Redirect to Google OAuth
  .get('/google', async (ctx) => {
    const { cookie } = ctx
    
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = await google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

    // Store state and code verifier in cookies
    cookie.google_oauth_state.set({
      value: state,
      httpOnly: true,
      maxAge: 600, // 10 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    cookie.google_code_verifier.set({
      value: codeVerifier,
      httpOnly: true,
      maxAge: 600, // 10 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return Response.redirect(url.toString())
  })

  // GET /auth/google/callback - Handle Google OAuth callback
  .get('/google/callback', async (ctx) => {
    const { query, cookie, authService, jwt, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const { code, state } = query as { code: string; state: string }
    
    const savedState = (cookie.google_oauth_state as { value?: string }).value
    const codeVerifier = (cookie.google_code_verifier as { value?: string }).value
    
    // Clear OAuth cookies
    ;(cookie.google_oauth_state as { remove?: () => void }).remove?.()
    ;(cookie.google_code_verifier as { remove?: () => void }).remove?.()
    
    // Validate state
    if (!savedState || savedState !== state || !codeVerifier) {
      return inertia.render('auth/Login', {
        errors: { email: 'Invalid OAuth state. Please try again.' },
        status: null
      })
    }
    
    try {
      // Exchange code for tokens
      const tokens = await google.validateAuthorizationCode(code, codeVerifier)
      
      // Get user info from Google
      const googleUser = await getGoogleUserInfo(tokens.accessToken())
      
      // Find or create user
      const user = await authService.findOrCreateGoogleUser(googleUser)
      
      // Create JWT token
      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      })
      
      // Set cookie
      cookie.auth.set({
        value: token,
        httpOnly: true,
        maxAge: 86400, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
      
      return inertia.redirect('/dashboard')
      
    } catch (error) {
      console.error('Google OAuth error:', error)
      return inertia.render('auth/Login', {
        errors: { email: 'Failed to authenticate with Google. Please try again.' },
        status: null
      })
    }
  })
