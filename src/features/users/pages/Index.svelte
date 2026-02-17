<script lang="ts">
  import { Users, Mail, Shield, Calendar } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    users: Array<{
      id: string
      email: string
      name: string
      role: string
      created_at: string
    }>
  }
  
  let { user, users }: Props = $props()
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  function getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }
</script>

<AppLayout title="Users" {user}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Users class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p class="text-gray-500 dark:text-slate-400">Manage system users and their roles</p>
        </div>
      </div>
    </div>
    
    <!-- Users Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
            {#each users as u}
              <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <div class="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                        <Mail class="w-3 h-3" />
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium {getRoleBadgeColor(u.role)}">
                    <Shield class="w-3 h-3" />
                    {u.role}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                    <Calendar class="w-4 h-4" />
                    {formatDate(u.created_at)}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        
        {#if users.length === 0}
          <div class="p-8 text-center text-gray-500 dark:text-slate-400">
            No users found
          </div>
        {/if}
      </div>
    </div>
  </div>
</AppLayout>
