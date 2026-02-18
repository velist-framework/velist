<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Eye, EyeOff, KeyRound, Mail, User, ArrowRight, UserPlus, Loader2, Check, X, Sun, Moon } from 'lucide-svelte'
  
  interface Props {
    errors: {
      email?: string
      password?: string
    }
  }
  
  let { errors }: Props = $props()
  
  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  
  let showPassword = $state(false)
  let showConfirmPassword = $state(false)
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
    $form.post('/auth/register')
  }
  
  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    $form.password = pwd
    $form.password_confirmation = pwd
    showPassword = true
    showConfirmPassword = true
  }
  
  // Password strength calculation
  function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    const levels = [
      { label: 'Too weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-emerald-500' }
    ]
    
    return { score, ...levels[Math.min(score, 4)] }
  }
  
  let strength = $derived(getPasswordStrength($form.password))
  let passwordsMatch = $derived($form.password && $form.password === $form.password_confirmation)
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
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 mb-4">
          <UserPlus class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Create account
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Get started with your free account today
        </p>
      </div>
      
      <!-- Form -->
      <form class="px-8 pb-8 space-y-4" onsubmit={submit}>
        <!-- Name -->
        <div class="space-y-1.5">
          <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User class="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              minlength="2"
              class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm transition-colors focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="John Doe"
              bind:value={$form.name}
            />
          </div>
        </div>
        
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
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                  : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400'} 
                focus:outline-none"
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
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <button
              type="button"
              onclick={generatePassword}
              class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <KeyRound class="w-3 h-3" />
              Generate secure
            </button>
          </div>
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
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                  : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400'} 
                focus:outline-none"
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
          
          <!-- Password Strength -->
          {#if $form.password}
            <div class="space-y-1.5">
              <div class="flex gap-1 h-1">
                {#each Array(5) as _, i}
                  <div class="flex-1 rounded-full transition-colors {i < strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}"></div>
                {/each}
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Strength: <span class="font-medium {strength.color.replace('bg-', 'text-')}">{strength.label}</span>
              </p>
            </div>
          {/if}
          
          {#if errors.password}
            <p class="text-red-500 dark:text-red-400 text-xs">{errors.password}</p>
          {/if}
        </div>
        
        <!-- Confirm Password -->
        <div class="space-y-1.5">
          <label for="password_confirmation" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minlength="8"
              class="block w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                {$form.password_confirmation && !passwordsMatch 
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                  : passwordsMatch
                    ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 dark:focus:border-emerald-400'
                    : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400'} 
                focus:outline-none"
              placeholder="••••••••"
              bind:value={$form.password_confirmation}
            />
            <button
              type="button"
              onclick={() => showConfirmPassword = !showConfirmPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {#if showConfirmPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
          {#if $form.password_confirmation}
            <div class="flex items-center gap-1 text-xs {passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}">
              {#if passwordsMatch}
                <Check class="w-3 h-3" />
                Passwords match
              {:else}
                <X class="w-3 h-3" />
                Passwords don't match
              {/if}
            </div>
          {/if}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          disabled={$form.processing || !passwordsMatch}
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
        >
          {#if $form.processing}
            <Loader2 class="animate-spin h-4 w-4" />
            Creating account...
          {:else}
            Create account
            <ArrowRight class="h-4 w-4" />
          {/if}
        </button>

        <!-- Divider -->
        <div class="relative py-2">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or sign up with</span>
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
          Sign up with Google
        </a>

        <!-- Login Link -->
        <p class="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
          Already have an account?
          <a href="/auth/login" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
            Sign in
          </a>
        </p>
      </form>
    </div>
    
    <!-- Footer -->
    <p class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
      By creating an account, you agree to our Terms and Privacy Policy
    </p>
  </div>
</div>
