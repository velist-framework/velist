<script lang="ts">
  import { useForm, inertia } from '@inertiajs/svelte'
  import { Settings, User, Shield, Moon, Globe, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  import { toast } from '$shared/lib/toast'
  
  interface Props {
    user?: { id: string; email: string; name: string }
    twoFactorEnabled?: boolean
    errors?: {
      current_password?: string
      password?: string
      password_confirmation?: string
      two_factor?: string
    }
    status?: string | null
  }
  
  let { 
    user = { id: '', email: '', name: '' }, 
    twoFactorEnabled = false, 
    errors, 
    status 
  }: Props = $props()
  
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
  })
  
  function toggleDarkMode() {
    darkMode = !darkMode
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('dark-mode', String(darkMode))
  }
  
  // Profile form
  let profileName = $state(user?.name ?? '')
  let profileSaving = $state(false)
  
  async function updateProfile(e: Event) {
    e.preventDefault()
    profileSaving = true
    
    try {
      const response = await fetch('/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName })
      })
      
      if (response.ok) {
        toast.success('Profile updated successfully!')
        // Reload to get fresh data
        window.location.reload()
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      profileSaving = false
    }
  }
  
  // Password form
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  
  let showCurrentPassword = $state(false)
  let showNewPassword = $state(false)
  let showConfirmPassword = $state(false)
  
  function updatePassword(e: Event) {
    e.preventDefault()
    $passwordForm.put('/settings/password', {
      onSuccess: () => {
        $passwordForm.reset()
        toast.success('Password updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update password')
      }
    })
  }
</script>

<AppLayout title="Settings" {user} path="/settings">
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
      
      <!-- Status Message -->
      {#if status}
        <div class="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          {status}
        </div>
      {/if}
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
        <form onsubmit={updateProfile} class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                bind:value={profileName}
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
              />
            </div>
          </div>
          <div class="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              {#if profileSaving}
                <Loader2 class="w-4 h-4 animate-spin" />
                Saving...
              {:else}
                Save Profile
              {/if}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Security Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Shield class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <!-- Change Password Form -->
          <form onsubmit={updatePassword} class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
            
            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
              <div class="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  bind:value={$passwordForm.current_password}
                  class="w-full px-3 py-2 pr-10 rounded-lg border text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onclick={() => showCurrentPassword = !showCurrentPassword}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {#if showCurrentPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              {#if errors?.current_password}
                <p class="mt-1 text-xs text-red-500 dark:text-red-400">{errors.current_password}</p>
              {/if}
            </div>
            
            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
              <div class="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  bind:value={$passwordForm.password}
                  class="w-full px-3 py-2 pr-10 rounded-lg border text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="Enter new password"
                  minlength="8"
                />
                <button
                  type="button"
                  onclick={() => showNewPassword = !showNewPassword}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {#if showNewPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              {#if errors?.password}
                <p class="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p>
              {/if}
            </div>
            
            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <div class="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  bind:value={$passwordForm.password_confirmation}
                  class="w-full px-3 py-2 pr-10 rounded-lg border text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="Confirm new password"
                  minlength="8"
                />
                <button
                  type="button"
                  onclick={() => showConfirmPassword = !showConfirmPassword}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {#if showConfirmPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              {#if errors?.password_confirmation}
                <p class="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password_confirmation}</p>
              {/if}
            </div>
            
            <div class="pt-2">
              <button
                type="submit"
                disabled={$passwordForm.processing}
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {#if $passwordForm.processing}
                  <Loader2 class="w-4 h-4 animate-spin" />
                  Updating...
                {:else}
                  Update Password
                {/if}
              </button>
            </div>
          </form>
          
          <!-- Divider -->
          <div class="border-t border-gray-200 dark:border-slate-700"></div>
          
          <!-- Two-Factor Authentication -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div>
                <p class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Two-Factor Authentication
                  {#if twoFactorEnabled}
                    <CheckCircle class="w-4 h-4 text-emerald-500" />
                  {/if}
                </p>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {twoFactorEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            {#if twoFactorEnabled}
              <form method="POST" action="/settings/2fa" use:inertia={{ method: 'delete' }}>
                <button 
                  type="submit"
                  class="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  Disable
                </button>
              </form>
            {:else}
              <a 
                href="/settings/2fa/setup" 
                class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Enable
              </a>
            {/if}
          </div>
          {#if errors?.two_factor}
            <p class="text-xs text-red-500 dark:text-red-400">{errors.two_factor}</p>
          {/if}
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
            <button
              type="button"
              onclick={toggleDarkMode}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer {darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600'}"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {darkMode ? 'translate-x-6' : 'translate-x-1'}"></span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</AppLayout>
