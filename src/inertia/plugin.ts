import { Elysia } from 'elysia'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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

interface ManifestEntry {
  file: string
  src?: string
  isEntry?: boolean
  css?: string[]
  assets?: string[]
}

type Manifest = Record<string, ManifestEntry>

// Escape HTML to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Generate development HTML (Vite dev server)
function generateDevTemplate(page: InertiaPage): string {
  const viteUrl = process.env.VITE_URL || 'http://localhost:5173'
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.component)} | EISK App</title>
  <meta name="description" content="EISK Stack - Elysia + Inertia + Svelte + Kysely">
  <script type="module" src="${viteUrl}/@vite/client"></script>
  <link rel="stylesheet" href="${viteUrl}/src/styles/app.css">
</head>
<body>
  <div id="app" data-page="${escapeHtml(JSON.stringify(page))}"></div>
  <script type="module" src="${viteUrl}/src/inertia/app.ts"></script>
</body>
</html>`
}

// Load manifest.json
function loadManifest(): Record<string, ManifestEntry> | null {
  const manifestPath = resolve(process.cwd(), 'dist/.vite/manifest.json')
  
  if (!existsSync(manifestPath)) {
    console.warn('[Inertia] manifest.json not found at:', manifestPath)
    return null
  }
  
  try {
    const content = readFileSync(manifestPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('[Inertia] Failed to load manifest:', error)
    return null
  }
}

// Generate production HTML (hashed assets from manifest)
function generateProdTemplate(page: InertiaPage): string {
  const manifest = loadManifest()
  
  if (!manifest) {
    console.error('[Inertia] Cannot generate template without manifest.json')
    return `<!DOCTYPE html><html><body>Error: manifest.json not found</body></html>`
  }
  
  // Find JS entry (app.ts)
  const jsEntry = Object.values(manifest).find(entry => 
    entry.src?.includes('app.ts') && entry.isEntry
  )
  
  // Find CSS entry (app.css)
  const cssEntry = Object.values(manifest).find(entry => 
    entry.src?.includes('app.css') && entry.isEntry
  )
  
  const cssFiles: string[] = []
  const jsFiles: string[] = []
  
  // Add CSS from entry
  if (cssEntry?.file) {
    cssFiles.push(`/dist/${cssEntry.file}`)
  }
  
  // Add JS from entry
  if (jsEntry?.file) {
    jsFiles.push(`/dist/${jsEntry.file}`)
  }
  
  // Also check CSS files referenced by JS entry
  if (jsEntry?.css) {
    jsEntry.css.forEach(file => {
      if (!cssFiles.includes(`/dist/${file}`)) {
        cssFiles.push(`/dist/${file}`)
      }
    })
  }
  
  const cssLinks = cssFiles.map(file => 
    `<link rel="stylesheet" href="${file}">`
  ).join('\n  ')
  
  const jsScripts = jsFiles.map(file => 
    `<script type="module" src="${file}"></script>`
  ).join('\n  ')
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.component)} | EISK App</title>
  <meta name="description" content="EISK Stack - Elysia + Inertia + Svelte + Kysely">
  ${cssLinks}
</head>
<body>
  <div id="app" data-page="${escapeHtml(JSON.stringify(page))}"></div>
  ${jsScripts}
</body>
</html>`
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
  const isDev = process.env.NODE_ENV !== 'production'
  
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

      // Use custom template or default based on environment
      const html = config.rootTemplate 
        ? config.rootTemplate(page)
        : isDev 
          ? generateDevTemplate(page)
          : generateProdTemplate(page)

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
