<script lang="ts">
  import { LogOut, Users, ShoppingCart, DollarSign, TrendingUp, Activity, Bell, Search, Sun, Moon } from 'lucide-svelte'
  
  interface Props {
    user: {
      id: string
      email: string
      name: string
    }
    stats: {
      totalUsers: number
      totalOrders: number
      revenue: number
    }
  }
  
  let { user, stats }: Props = $props()
  
  // Dark mode state
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
  
  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
  // Quick actions
  const quickActions = [
    { label: 'New Order', icon: ShoppingCart, href: '#orders' },
    { label: 'Add User', icon: Users, href: '#users' },
    { label: 'Reports', icon: Activity, href: '#reports' },
  ]
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
  <!-- Navbar -->
  <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Activity class="w-5 h-5 text-white" />
          </div>
          <span class="text-lg font-bold text-slate-900 dark:text-white">Dashboard</span>
        </div>
        
        <!-- Right Side -->
        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-3 py-1.5">
            <Search class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              class="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-48"
            />
          </div>
          
          <!-- Dark Mode Toggle -->
          <button 
            onclick={toggleDarkMode}
            class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {#if darkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          
          <!-- Notifications -->
          <button class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Bell class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <!-- User Menu -->
          <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <form method="POST" action="/auth/logout">
              <button 
                type="submit" 
                class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut class="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Welcome back, {user.name.split(' ')[0]}!
      </h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">
        Here's what's happening with your business today.
      </p>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Users Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+12%</span>
              <span class="text-slate-400 dark:text-slate-500">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
      
      <!-- Orders Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalOrders.toLocaleString()}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+8%</span>
              <span class="text-slate-400 dark:text-slate-500">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <ShoppingCart class="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
      </div>
      
      <!-- Revenue Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(stats.revenue)}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+24%</span>
              <span class="text-slate-400 dark:text-slate-500">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <DollarSign class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {#each quickActions as action}
          <a 
            href={action.href}
            class="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
              <action.icon class="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </div>
            <span class="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{action.label}</span>
          </a>
        {/each}
      </div>
    </div>
  </main>
</div>
