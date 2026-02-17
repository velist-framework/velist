<script lang="ts">
  import { Settings, User, Bell, Shield, Moon, Globe } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  import { toast } from '$shared/lib/toast'
  
  interface Props {
    user: { id: string; email: string; name: string }
  }
  
  let { user }: Props = $props()
  
  function saveSettings() {
    toast.success('Settings saved successfully!')
  }
</script>

<AppLayout title="Settings" {user}>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Settings class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p class="text-gray-500 dark:text-slate-400">Manage your account and application preferences</p>
        </div>
      </div>
    </div>
    
    <!-- Settings Sections -->
    <div class="space-y-6">
      <!-- Profile Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <User class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                value={user.name}
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Notifications Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Bell class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Receive updates via email</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors cursor-pointer">
              <span class="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Receive browser push notifications</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-slate-600 transition-colors cursor-pointer">
              <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Security Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Shield class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">Add an extra layer of security</p>
            </div>
            <button class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Enable
            </button>
          </div>
        </div>
      </div>
      
      <!-- Preferences Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Globe class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Moon class="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">Toggle dark theme</p>
              </div>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors cursor-pointer">
              <span class="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Save Button -->
      <div class="flex justify-end">
        <button 
          onclick={saveSettings}
          class="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</AppLayout>
