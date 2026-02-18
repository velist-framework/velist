<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { Sun, Moon, Bell, Search, Check, Trash2 } from 'lucide-svelte'
  import ToastContainer from '$shared/components/ToastContainer.svelte'
  import { toast } from '$shared/lib/toast'
  
  interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    read_at: string | null
    created_at: string
  }
  
  interface Props {
    title: string
    user: {
      id: string
      email: string
      name: string
    }
    path: string
    notifications?: Notification[]
    unreadCount?: number
    children: import('svelte').Snippet
  }
  
  let { title, user, path, notifications = [], unreadCount = 0, children }: Props = $props()
  
  function isActive(menuPath: string): boolean {
    return path === menuPath || path.startsWith(menuPath + '/')
  }
  
  // UI States
  let mobileMenuOpen = $state(false)
  let userMenuOpen = $state(false)
  let notificationOpen = $state(false)
  let darkMode = $state(false)
  let userMenuElement = $state<HTMLElement | null>(null)
  let notificationElement = $state<HTMLElement | null>(null)
  
  // Notification States
  let localNotifications = $state<Notification[]>(notifications)
  let localUnreadCount = $state(unreadCount)
  let wsConnection = $state<WebSocket | null>(null)
  let wsConnected = $state(false)
  
  // Initialize dark mode
  $effect(() => {
    const saved = localStorage.getItem('dark-mode')
    if (saved !== null) {
      darkMode = saved === 'true'
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    document.documentElement.classList.toggle('dark', darkMode)
  })
  
  // Initialize WebSocket connection
  $effect(() => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      wsConnected = true
      console.log('[WS] Connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data)
        
        switch (eventType) {
          case 'connected':
            localUnreadCount = data.unreadCount
            break
            
          case 'notification':
            localNotifications = [data, ...localNotifications]
            localUnreadCount++
            toast.info(data.title)
            break
            
          case 'markedAsRead':
            localNotifications = localNotifications.map(n => 
              n.id === data.notificationId ? { ...n, read_at: new Date().toISOString() } : n
            )
            break
            
          case 'markedAllAsRead':
            localNotifications = localNotifications.map(n => ({ ...n, read_at: new Date().toISOString() }))
            localUnreadCount = 0
            break
        }
      } catch (error) {
        console.error('[WS] Parse error:', error)
      }
    }
    
    ws.onclose = () => {
      wsConnected = false
      console.log('[WS] Disconnected')
    }
    
    wsConnection = ws
    
    return () => {
      ws.close()
    }
  })
  
  // Close menus when clicking outside
  $effect(() => {
    if (!userMenuOpen || !userMenuElement) return
    
    const handleClick = (event: MouseEvent) => {
      if (userMenuElement && !userMenuElement.contains(event.target as Node)) {
        userMenuOpen = false
      }
    }
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick, true)
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClick, true)
    }
  })
  
  $effect(() => {
    if (!notificationOpen || !notificationElement) return
    
    const handleClick = (event: MouseEvent) => {
      if (notificationElement && !notificationElement.contains(event.target as Node)) {
        notificationOpen = false
      }
    }
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick, true)
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClick, true)
    }
  })
  
  function toggleDarkMode() {
    darkMode = !darkMode
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('dark-mode', String(darkMode))
  }
  
  function logout() {
    router.post('/auth/logout')
  }
  
  function markAsRead(id: string) {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ action: 'markAsRead', notificationId: id }))
      localUnreadCount = Math.max(0, localUnreadCount - 1)
    }
  }
  
  function markAllAsRead() {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ action: 'markAllAsRead' }))
    }
  }
  
  function deleteNotification(id: string, event: Event) {
    event.stopPropagation()
    router.delete(`/notifications/${id}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        localNotifications = localNotifications.filter(n => n.id !== id)
      }
    })
  }
  
  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }
  
  function getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-500'
      case 'warning': return 'bg-amber-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
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
            <a href="/dashboard" use:inertia class="{isActive('/dashboard') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
              Dashboard
            </a>
            <a href="/users" use:inertia class="{isActive('/users') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
              Users
            </a>
            <a href="/settings" use:inertia class="{isActive('/settings') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
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
            class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {#if darkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          
          <!-- Notifications -->
          <div class="relative" bind:this={notificationElement}>
            <button 
              onclick={() => notificationOpen = !notificationOpen}
              class="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Bell class="w-5 h-5" />
              {#if localUnreadCount > 0}
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              {/if}
              {#if wsConnected}
                <span class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {/if}
            </button>
            
            {#if notificationOpen}
              <div class="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-slate-700 z-50">
                <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {#if localUnreadCount > 0}
                    <button
                      onclick={markAllAsRead}
                      class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      Mark all read
                    </button>
                  {/if}
                </div>
                
                <div class="max-h-96 overflow-y-auto">
                  {#if localNotifications.length === 0}
                    <div class="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                      No notifications yet
                    </div>
                  {:else}
                    {#each localNotifications.slice(0, 10) as notification}
                      <div 
                        class="p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer {notification.read_at ? 'opacity-60' : ''}"
                        onclick={() => !notification.read_at && markAsRead(notification.id)}
                      >
                        <div class="flex items-start gap-3">
                          <div class="w-2 h-2 mt-1.5 rounded-full flex-shrink-0 {getNotificationColor(notification.type)}"></div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onclick={(e) => deleteNotification(notification.id, e)}
                            class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    {/each}
                  {/if}
                </div>
                
                <div class="p-3 border-t border-gray-200 dark:border-slate-700 text-center">
                  <a 
                    href="/notifications" 
                    use:inertia
                    class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- User Menu -->
          <div class="ml-3 relative">
            <div>
              <button
                type="button"
                class="rounded-full flex text-sm focus:outline-none transition-colors hover:opacity-80 cursor-pointer"
                onclick={() => userMenuOpen = !userMenuOpen}
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            
            {#if userMenuOpen}
              <div 
                bind:this={userMenuElement}
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-slate-700 transition-colors"
              >
                <div class="px-4 py-2 text-sm text-gray-700 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">
                  <p class="font-medium">{user.name}</p>
                  <p class="text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <a href="/settings" use:inertia class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  Settings
                </a>
                <button
                  onclick={logout}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
            class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {#if darkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors cursor-pointer"
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
          <a href="/dashboard" use:inertia class="{isActive('/dashboard') ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-200'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
            Dashboard
          </a>
          <a href="/users" use:inertia class="{isActive('/users') ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-200'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
            Users
          </a>
          <a href="/settings" use:inertia class="{isActive('/settings') ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-200'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors">
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
            <a href="/notifications" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              Notifications {#if localUnreadCount > 0}({localUnreadCount}){/if}
            </a>
            <a href="/settings" use:inertia class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              Settings
            </a>
            <button
              onclick={logout}
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
  
  <!-- Toast Notifications -->
  <ToastContainer />
</div>
