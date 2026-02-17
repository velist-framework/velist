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
      </form>
    </div>
    
    <!-- Footer -->
    <p class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
      Protected by industry-standard encryption
    </p>
  </div>
</div>
