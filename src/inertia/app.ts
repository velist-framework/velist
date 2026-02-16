import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte';
import { mount, hydrate } from 'svelte';
import type { Component } from 'svelte';

// Type augmentation for Vite's import.meta.glob
declare global {
  interface ImportMeta {
    glob: <T>(pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<T>>
  }
}

// Pre-load all pages
const pages = import.meta.glob<{ default: Component; layout?: Component }>('../features/**/pages/**/*.svelte', {
  eager: false
})

console.log('[Inertia] Available pages:', Object.keys(pages))

createInertiaApp({
  id: 'app',
  
  resolve: async (name) => {
    // name format: "auth/Login" atau "auth/login" -> features/auth/pages/Login.svelte
    const [feature, page] = name.split('/')
    
    // Coba dengan huruf kapital di awal
    const pathWithCapital = `../features/${feature}/pages/${page.charAt(0).toUpperCase() + page.slice(1)}.svelte`
    // Coba dengan lowercase
    const pathWithLower = `../features/${feature}/pages/${page}.svelte`
    
    console.log('[Inertia] Resolving:', name)
    console.log('[Inertia] Trying path:', pathWithCapital)
    console.log('[Inertia] Available paths:', Object.keys(pages))
    
    // Coba cari path yang cocok
    let matchedPath = Object.keys(pages).find(p => 
      p.toLowerCase().includes(`/${feature}/pages/${page.toLowerCase()}`)
    )
    
    if (!matchedPath) {
      matchedPath = pathWithCapital
    }
    
    const loadPage = pages[matchedPath]
    
    if (!loadPage) {
      console.error('[Inertia] Page not found:', name)
      console.error('[Inertia] Tried path:', matchedPath)
      throw new Error(`Page not found: ${name}`)
    }
    
    const module = await loadPage()
    return {
      default: module.default as unknown as ResolvedComponent['default'],
      layout: module.layout as any
    }
  },
  
  setup({ el, App, props }) {
    if (!el) throw new Error('Root element not found')
    
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el, props })
    } else {
      mount(App, { target: el, props })
    }
  },
  
  progress: {
    color: '#4f46e5',
    showSpinner: true
  }
})
