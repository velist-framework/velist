import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte';
import { mount, hydrate } from 'svelte';
import type { Component } from 'svelte';

// Type augmentation for Vite's import.meta.glob
declare global {
  interface ImportMeta {
    glob: <T>(pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<T>>
  }
}

createInertiaApp({
  id: 'app',
  
  resolve: async (name) => {
    // name format: "auth/login" -> features/auth/pages/Login.svelte
    const [feature, page] = name.split('/')
    
    // Dynamic import dengan glob
    const pages = import.meta.glob<{ default: Component; layout?: Component }>('../features/**/pages/**/*.svelte', {
      eager: false
    })
    
    const path = `../features/${feature}/pages/${page.charAt(0).toUpperCase() + page.slice(1)}.svelte`
    
    const module = await pages[path]()
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
