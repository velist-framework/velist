/**
 * Type-safe Inertia.js types for EISK Stack
 * Provides end-to-end type safety from backend to frontend
 */

import type { Component } from 'svelte'

// ============================================================================
// Base Types
// ============================================================================

export interface SharedProps {
  /** Current authenticated user (null if guest) */
  user: SafeUser | null
  /** Flash messages from session */
  flash?: {
    success?: string
    error?: string
    warning?: string
    info?: string
  }
  /** CSRF token for forms */
  csrf?: string
  /** Current route info */
  route?: {
    name: string
    params: Record<string, string>
  }
}

export interface SafeUser {
  id: string
  email: string
  name: string
  role: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Page Props - Extend this for each page
// ============================================================================

/**
 * Base interface for all page props.
 * All page props automatically include SharedProps via Inertia.
 * 
 * @example
 * ```typescript
 * // Define page-specific props
 * interface DashboardProps extends PageProps {
 *   stats: {
 *     totalUsers: number
 *     revenue: number
 *   }
 *   recentActivity: Activity[]
 * }
 * ```
 */
export type PageProps = SharedProps & Record<string, unknown>

// ============================================================================
// Inertia Page Component Type
// ============================================================================

/**
 * Type for Svelte page components with typed props.
 * Use this to type your page components.
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import type { InertiaPage } from '$types/inertia'
 *   
 *   interface Props {
 *     invoices: Invoice[]
 *     filters: { status: string }
 *   }
 *   
 *   let { invoices, filters, user, flash }: Props & SharedProps = $props()
 * </script>
 * ```
 */
export type InertiaPage<T extends Record<string, unknown> = Record<string, unknown>> = 
  Component<T & SharedProps>

// ============================================================================
// Form Types
// ============================================================================

/**
 * Type for form errors returned from backend
 */
export type FormErrors<T extends Record<string, unknown> = Record<string, unknown>> = {
  [K in keyof T]?: string
} & {
  message?: string
  general?: string
}

/**
 * Props for pages with forms
 */
export interface FormPageProps<T extends Record<string, unknown> = Record<string, unknown>> 
  extends SharedProps {
  errors: FormErrors<T>
  old?: Partial<T> // Previous form values
}

/**
 * Props for edit pages
 */
export interface EditPageProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends FormPageProps<T> {
  item: T & { id: string }
}

// ============================================================================
// List/Pagination Types
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

/**
 * Paginated response
 */
export interface PaginatedData<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

/**
 * Props for list/index pages
 */
export interface ListPageProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends SharedProps {
  items: T[]
  pagination?: PaginationMeta
  filters?: Record<string, string | string[]>
  sort?: {
    column: string
    direction: 'asc' | 'desc'
  }
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

/**
 * Error response
 */
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  code?: string
}

// ============================================================================
// Route Types
// ============================================================================

/**
 * Available page components (for type-safe render calls)
 * Extend this union when adding new pages
 */
export type PageComponent =
  // Auth pages
  | 'auth/Login'
  | 'auth/Register'
  | 'auth/ForgotPassword'
  | 'auth/ResetPassword'
  // Dashboard
  | 'dashboard/Index'
  // Error pages
  | 'errors/404'
  | 'errors/500'
  // Add your feature pages here:
  // | 'invoices/Index'
  // | 'invoices/Create'
  // | 'invoices/Edit'

/**
 * Props for each page component
 * This provides full type safety for inertia.render() calls
 */
export interface PageComponentProps {
  'auth/Login': {
    errors?: FormErrors<{ email: string; password: string }>
  }
  'auth/Register': {
    errors?: FormErrors<{ name: string; email: string; password: string; password_confirmation: string }>
  }
  'dashboard/Index': Record<string, never> // No additional props
  'errors/404': {
    path?: string
  }
  'errors/500': {
    message?: string
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract props type for a specific page
 * 
 * @example
 * ```typescript
 * type LoginProps = PagePropsFor<'auth/Login'>
 * // Equivalent to: SharedProps & { errors?: FormErrors<...> }
 * ```
 */
export type PagePropsFor<T extends PageComponent> = 
  T extends keyof PageComponentProps 
    ? SharedProps & PageComponentProps[T]
    : SharedProps

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P]
}

/**
 * Type for Inertia form helpers
 */
export interface InertiaForm<T extends Record<string, unknown>> {
  data(): T
  transform(callback: (data: T) => T): InertiaForm<T>
  defaults(): InertiaForm<T>
  defaults(key: keyof T, value: unknown): InertiaForm<T>
  defaults(fields: Partial<T>): InertiaForm<T>
  reset(...fields: (keyof T)[]): InertiaForm<T>
  clearErrors(...fields: (keyof T)[]): InertiaForm<T>
  error(key: keyof T): string | undefined
  errors: FormErrors<T>
  hasErrors: boolean
  processing: boolean
  progress: { percentage: number } | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  get(url: string, options?: unknown): Promise<void>
  post(url: string, options?: unknown): Promise<void>
  put(url: string, options?: unknown): Promise<void>
  patch(url: string, options?: unknown): Promise<void>
  delete(url: string, options?: unknown): Promise<void>
  submit(method: string, url: string, options?: unknown): Promise<void>
  cancel(): void
}

// ============================================================================
// Declaration Merging for Inertia
// ============================================================================

declare global {
  namespace Inertia {
    interface PageProps extends SharedProps {}
  }
}

// Make this a module
export {}
