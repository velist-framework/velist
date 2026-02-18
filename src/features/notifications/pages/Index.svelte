<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { Bell, Check, Trash2, ArrowLeft, CheckCheck } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
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
    user: { id: string; email: string; name: string }
    notifications: Notification[]
    unreadCount: number
  }
  
  let { user, notifications, unreadCount }: Props = $props()
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  function getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✕'
      default: return 'ℹ'
    }
  }
  
  function getTypeColor(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }
  
  function markAsRead(id: string) {
    router.put(`/notifications/${id}/read`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success('Marked as read')
    })
  }
  
  function markAllAsRead() {
    router.put('/notifications/read-all', {}, {
      preserveScroll: true,
      onSuccess: () => toast.success('All notifications marked as read')
    })
  }
  
  function deleteNotification(id: string) {
    router.delete(`/notifications/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Notification deleted')
    })
  }
</script>

<AppLayout title="Notifications" {user} path="/notifications" {notifications} {unreadCount}>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <a href="/dashboard" use:inertia class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors mb-4">
        <ArrowLeft class="w-4 h-4" />
        Back to Dashboard
      </a>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Bell class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p class="text-gray-500 dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
            </p>
          </div>
        </div>
        {#if unreadCount > 0}
          <button
            onclick={markAllAsRead}
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <CheckCheck class="w-4 h-4" />
            Mark all as read
          </button>
        {/if}
      </div>
    </div>
    
    <!-- Notifications List -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
      {#if notifications.length === 0}
        <div class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <Bell class="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications yet</h3>
          <p class="text-gray-500 dark:text-slate-400">You'll see your notifications here when they arrive.</p>
        </div>
      {:else}
        <div class="divide-y divide-gray-200 dark:divide-slate-700">
          {#each notifications as notification}
            <div class="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors {notification.read_at ? 'opacity-70' : ''}">
              <div class="flex items-start gap-4">
                <!-- Type Icon -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold {getTypeColor(notification.type)}">
                  {getTypeIcon(notification.type)}
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p class="mt-1 text-sm text-gray-600 dark:text-slate-300">
                        {notification.message}
                      </p>
                      <p class="mt-2 text-xs text-gray-400 dark:text-slate-500">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      {#if !notification.read_at}
                        <button
                          onclick={() => markAsRead(notification.id)}
                          class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check class="w-4 h-4" />
                        </button>
                      {/if}
                      <button
                        onclick={() => deleteNotification(notification.id)}
                        class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</AppLayout>
