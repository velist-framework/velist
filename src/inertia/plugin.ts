import { Elysia } from 'elysia'

interface InertiaPage {
  component: string
  props: Record<string, unknown>
  url: string
  version: string
}

interface InertiaConfig {
  version?: string
  rootTemplate?: (page: InertiaPage) => string
}

// Default HTML template for Inertia
const defaultTemplate = (page: InertiaPage) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inertia App</title>
</head>
<body>
  <div id="app" data-page="${escapeHtml(JSON.stringify(page))}"></div>
  <script type="module" src="/src/inertia/app.ts"></script>
</body>
</html>`

// Escape HTML to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Inertia response type
export interface Inertia {
  render: (component: string, props?: Record<string, unknown>) => Response
  redirect: (url: string) => Response
  location: (url: string) => Response
}

// Create inertia object bound to a request context
function createInertia(request: Request, config: InertiaConfig = {}): Inertia {
  const version = config.version || process.env.APP_VERSION || '1.0.0'
  
  return {
    render(component: string, props: Record<string, unknown> = {}) {
      const url = new URL(request.url).pathname + new URL(request.url).search
      
      const page: InertiaPage = {
        component,
        props,
        url,
        version
      }

      const isInertia = request.headers.get('X-Inertia') === 'true'
      
      if (isInertia) {
        return new Response(JSON.stringify(page), {
          headers: {
            'Content-Type': 'application/json',
            'X-Inertia': 'true',
            'Vary': 'Accept'
          }
        })
      }

      const html = config.rootTemplate 
        ? config.rootTemplate(page)
        : defaultTemplate(page)

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    },
    
    redirect(url: string) {
      return new Response(null, {
        status: 302,
        headers: { Location: url }
      })
    },
    
    location(url: string) {
      return new Response(null, {
        status: 409,
        headers: { 
          'X-Inertia-Location': url,
          'X-Inertia': 'true'
        }
      })
    }
  }
}

// Context dengan inertia
export interface InertiaContext {
  inertia: Inertia
}

// Inertia response helpers using derive
export function inertia(config: InertiaConfig = {}) {
  return new Elysia({ name: 'inertia' })
    .derive({ as: 'scoped' }, (ctx) => ({
      inertia: createInertia(ctx.request, config)
    }))
}
