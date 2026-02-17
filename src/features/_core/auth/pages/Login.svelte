<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Eye, EyeOff, Mail, ArrowRight, Sparkles, Loader2 } from 'lucide-svelte'
  import { Sun, Moon } from 'lucide-svelte'
  
  interface Props {
    errors: {
      email?: string
      password?: string
    }
    status?: string | null
  }
  
  let { errors, status }: Props = $props()
  
  const form = useForm({
    email: '',
    password: '',
    remember: false
  })
  
  let showPassword = $state(false)
  let darkMode = $state(false)
  
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
  
  function toggleDarkMode() {
    darkMode = !darkMode
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('dark-mode', String(darkMode))
  }
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/auth/login')
  }
  
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
  <div class="max-w-md w-full">
    <!-- Dark Mode Toggle (absolute) -->
    <div class="absolute top-4 right-4">
      <button 
        onclick={toggleDarkMode}
        class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
      >
        {#if darkMode}
          <Sun class="w-5 h-5" />
        {:else}
          <Moon class="w-5 h-5" />
        {/if}
      </button>
    </div>

    <!-- Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
      <!-- Header -->
      <div class="px-8 pt-8 pb-6 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
          <Sparkles class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to continue to your account
        </p>
      </div>
      
      <!-- Status Message -->
      {#if status}
        <div class="mx-8 mb-4">
          <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2" role="alert">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            {status}
          </div>
        </div>
      {/if}
      
      <!-- Form -->
      <form class="px-8 pb-8 space-y-5" onsubmit={submit}>
        <!-- Email -->
        <div class="space-y-1.5">
          <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                {errors.email 
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                  : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'} 
                focus:outline-none focus:ring-4"
              placeholder="you@example.com"
              bind:value={$form.email}
            />
          </div>
          {#if errors.email}
            <p class="text-red-500 dark:text-red-400 text-xs">{errors.email}</p>
          {/if}
        </div>
        
        <!-- Password -->
        <div class="space-y-1.5">
          <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minlength="8"
              class="block w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                {errors.password 
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                  : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'} 
                focus:outline-none focus:ring-4"
              placeholder="••••••••"
              bind:value={$form.password}
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {#if showPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
          {#if errors.password}
            <p class="text-red-500 dark:text-red-400 text-xs">{errors.password}</p>
          {/if}
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-slate-900"
              bind:checked={$form.remember}
            />
            <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              Remember me
            </span>
          </label>

          <a href="/auth/register" class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Create account
          </a>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          disabled={$form.processing}
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {#if $form.processing}
            <Loader2 class="animate-spin h-4 w-4" />
            Signing in...
          {:else}
            Sign in
            <ArrowRight class="h-4 w-4" />
          {/if}
        </button>

        <!-- Divider -->
        <div class="relative py-2">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
          </div>
        </div>

        <!-- Google OAuth Button -->
        <a
          href="/auth/google"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-900 transition-all"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </a>
      </form>
    </div>
    
    <!-- Footer -->
    <p class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
      Protected by industry-standard encryption
    </p>
  </div>
</div>
