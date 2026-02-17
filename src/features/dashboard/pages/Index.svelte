<script lang="ts">
  import { Users, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-svelte'
  import AppLayout from '../../../shared/layouts/AppLayout.svelte'
  
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
</script>

<AppLayout title="Dashboard" {user}>
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
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
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
  </div>
</AppLayout>
