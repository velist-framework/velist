<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { Sun, Moon, Bell, Search } from 'lucide-svelte'
  
  interface Props {
    title: string
    user: {
      id: number
      email: string
      name: string
    }
    children: import('svelte').Snippet
  }
  
  let { title, user, children }: Props = $props()
  
  let mobileMenuOpen = $state(false)
  let userMenuOpen = $state(false)
  let darkMode = $state(false)
  
  // Initialize dark mode from localStorage or system preference
  $effect(() => {
    const saved = localStorage.getItem('dark-mode')
    if (saved !== null) {
      darkMode = saved === 'true'
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    document.documentElement.classList.toggle('dark', darkMode)
  })
  
  function toggleDarkMode() {
    darkMode = !darkMode
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('dark-mode', String(darkMode))
  }
  
  function logout() {
    router.post('/auth/logout')
  }
</script>

<svelte:head>
  <title>{title} | Velist</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
  <!-- Navigation -->
  <nav class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 transition-colors sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Desktop Nav -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <a href="/dashboard" use:inertia class="flex items-center">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white transition-colors">Velist</span>
            </a>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/dashboard" use:inertia class="border-indigo-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
              Dashboard
            </a>
            <a href="#" use:inertia class="border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
              Users
            </a>
            <a href="#" use:inertia class="border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
              Settings
            </a>
          </div>
        </div>
        
        <!-- Right Side -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center gap-4">
          <!-- Search -->
          <div class="flex items-center gap-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg px-3 py-1.5">
            <Search class="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              class="bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none w-48"
            />
          </div>
          
          <!-- Dark Mode Toggle -->
          <button 
            onclick={toggleDarkMode}
            class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {#if darkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          
          <!-- Notifications -->
          <button class="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Bell class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <!-- User Menu -->
          <div class="ml-3 relative">
            <div>
              <button
                type="button"
                class="bg-white dark:bg-slate-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onclick={() => userMenuOpen = !userMenuOpen}
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            
            {#if userMenuOpen}
              <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-slate-700 transition-colors">
                <div class="px-4 py-2 text-sm text-gray-700 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">
                  <p class="font-medium">{user.name}</p>
                  <p class="text-gray-500 dark:text-slate-400">{user.email}</p>
                </div>
                <a href="#" use:inertia class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  Your Profile
                </a>
                <a href="#" use:inertia class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  Settings
                </a>
                <button
                  onclick={logout}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden gap-2">
          <!-- Mobile Dark Mode Toggle -->
          <button 
            onclick={toggleDarkMode}
            class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {#if darkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            onclick={() => mobileMenuOpen = !mobileMenuOpen}
          >
            <span class="sr-only">Open main menu</span>
            {#if mobileMenuOpen}
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            {:else}
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 transition-colors">
        <div class="pt-2 pb-3 space-y-1">
          <a href="/dashboard" use:inertia class="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
            Dashboard
          </a>
          <a href="#" use:inertia class="border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-200 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
            Users
          </a>
          <a href="#" use:inertia class="border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-200 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
            Settings
          </a>
        </div>
        <div class="pt-4 pb-4 border-t border-gray-200 dark:border-slate-700">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800 dark:text-white">{user.name}</div>
              <div class="text-sm font-medium text-gray-500 dark:text-slate-400">{user.email}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <a href="#" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              Your Profile
            </a>
            <a href="#" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              Settings
            </a>
            <button
              onclick={logout}
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Main Content -->
  <main>
    {@render children()}
  </main>
</div>
