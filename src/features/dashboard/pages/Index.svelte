<script lang="ts">
  import { Users, ShoppingCart, DollarSign, TrendingUp, Activity, Bell, Send, MessageSquare } from 'lucide-svelte'
  import AppLayout from '../../../shared/layouts/AppLayout.svelte'
  import { toast } from '$shared/lib/toast'
  
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
  
  // Toast demo
  function showSuccessToast() {
    toast.success('Operation completed successfully!')
  }
  
  function showErrorToast() {
    toast.error('Something went wrong. Please try again.')
  }
  
  function showWarningToast() {
    toast.warning('Please review your settings before continuing.')
  }
  
  function showInfoToast() {
    toast.info('New updates are available.')
  }
  
  // Notification demo - send real notification to yourself
  async function sendTestNotification(type: 'info' | 'success' | 'warning' | 'error') {
    const titles = {
      info: 'New Feature Available',
      success: 'Payment Received',
      warning: 'Storage Almost Full',
      error: 'Failed to Sync Data'
    }
    
    const messages = {
      info: 'Check out the new real-time notification system!',
      success: 'Customer John paid $299 for Premium Plan.',
      warning: 'You have used 90% of your storage quota.',
      error: 'Could not connect to server. Retrying...'
    }
    
    try {
      const response = await fetch('/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: titles[type],
          message: messages[type]
        })
      })
      
      if (response.ok) {
        toast.success('Notification sent! Check the bell icon ↑')
      } else {
        toast.error('Failed to send notification')
      }
    } catch {
      toast.error('Network error')
    }
  }
</script>

<AppLayout title="Dashboard" {user} path="/dashboard">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
        Welcome back, {user.name.split(' ')[0]}!
      </h1>
      <p class="mt-1 text-gray-500 dark:text-slate-400 transition-colors">
        Here's what's happening with your business today.
      </p>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Users Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Total Users</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 transition-colors">{stats.totalUsers.toLocaleString()}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm transition-colors">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+12%</span>
              <span class="text-gray-400 dark:text-slate-500 transition-colors">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
            <Users class="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors" />
          </div>
        </div>
      </div>
      
      <!-- Orders Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Total Orders</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 transition-colors">{stats.totalOrders.toLocaleString()}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm transition-colors">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+8%</span>
              <span class="text-gray-400 dark:text-slate-500 transition-colors">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center transition-colors">
            <ShoppingCart class="w-6 h-6 text-violet-600 dark:text-violet-400 transition-colors" />
          </div>
        </div>
      </div>
      
      <!-- Revenue Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Revenue</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 transition-colors">{formatCurrency(stats.revenue)}</p>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm transition-colors">
              <TrendingUp class="w-4 h-4" />
              <span class="font-medium">+24%</span>
              <span class="text-gray-400 dark:text-slate-500 transition-colors">from last month</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center transition-colors">
            <DollarSign class="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors mb-8">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Quick Actions</h2>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {#each quickActions as action}
          <a 
            href={action.href}
            class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
              <action.icon class="w-5 h-5 text-gray-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <span class="font-medium text-gray-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{action.label}</span>
          </a>
        {/each}
      </div>
    </div>
    
    <!-- Toast Demo -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors mb-8">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-2">
        <Bell class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Toast Notifications Demo</h2>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onclick={showSuccessToast}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
        >
          Success
        </button>
        <button
          onclick={showErrorToast}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all"
        >
          Error
        </button>
        <button
          onclick={showWarningToast}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
        >
          Warning
        </button>
        <button
          onclick={showInfoToast}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
        >
          Info
        </button>
      </div>
    </div>
    
    <!-- Real-time Notification Demo -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-2">
        <MessageSquare class="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Real-time Notification Demo</h2>
      </div>
      <div class="p-6">
        <p class="text-sm text-gray-600 dark:text-slate-300 mb-4">
          Send a test notification to yourself. Watch the bell icon in the navbar update in real-time! 
          This uses WebSocket to push notifications instantly.
        </p>
        <p class="text-sm mb-4">
          <a 
            href="https://velist.dev/guide/notifications.html" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
          >
            📖 Learn how to add notifications to your features →
          </a>
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onclick={() => sendTestNotification('info')}
            class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
          >
            <Send class="w-4 h-4" />
            Send Info
          </button>
          <button
            onclick={() => sendTestNotification('success')}
            class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            <Send class="w-4 h-4" />
            Send Success
          </button>
          <button
            onclick={() => sendTestNotification('warning')}
            class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
          >
            <Send class="w-4 h-4" />
            Send Warning
          </button>
          <button
            onclick={() => sendTestNotification('error')}
            class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all"
          >
            <Send class="w-4 h-4" />
            Send Error
          </button>
        </div>
      </div>
    </div>
  </div>
</AppLayout>
