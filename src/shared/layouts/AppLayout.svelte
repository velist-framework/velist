<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  
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
  
  function logout() {
    router.post('/auth/logout')
  }
</script>

<svelte:head>
  <title>{title} | EISK App</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Desktop Nav -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <a href="/dashboard" use:inertia class="flex items-center">
              <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">EISK</span>
            </a>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/dashboard" use:inertia class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="#" use:inertia class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Users
            </a>
            <a href="#" use:inertia class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Settings
            </a>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <div class="ml-3 relative">
            <div>
              <button
                type="button"
                class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onclick={() => userMenuOpen = !userMenuOpen}
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            
            {#if userMenuOpen}
              <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="px-4 py-2 text-sm text-gray-700 border-b">
                  <p class="font-medium">{user.name}</p>
                  <p class="text-gray-500">{user.email}</p>
                </div>
                <a href="#" use:inertia class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </a>
                <a href="#" use:inertia class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <button
                  onclick={logout}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
      <div class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <a href="/dashboard" use:inertia class="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Dashboard
          </a>
          <a href="#" use:inertia class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Users
          </a>
          <a href="#" use:inertia class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Settings
          </a>
        </div>
        <div class="pt-4 pb-4 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{user.name}</div>
              <div class="text-sm font-medium text-gray-500">{user.email}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <a href="#" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              Your Profile
            </a>
            <a href="#" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              Settings
            </a>
            <button
              onclick={logout}
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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
