<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Shield, KeyRound, ArrowRight, Loader2 } from 'lucide-svelte'
  import { Sun, Moon } from 'lucide-svelte'
  
  interface Props {
    errors: {
      code?: string
    }
  }
  
  let { errors }: Props = $props()
  
  let darkMode = $state(false)
  let useBackupCode = $state(false)
  
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
  
  // TOTP form
  const totpForm = useForm({
    code: ''
  })
  
  // Backup code form
  const backupForm = useForm({
    code: ''
  })
  
  function submitTotp(e: Event) {
    e.preventDefault()
    $totpForm.post('/auth/2fa')
  }
  
  function submitBackup(e: Event) {
    e.preventDefault()
    $backupForm.post('/auth/2fa/backup')
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
          <Shield class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Two-Factor Authentication
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      
      <!-- Form -->
      <div class="px-8 pb-8">
        {#if !useBackupCode}
          <form class="space-y-5" onsubmit={submitTotp}>
            <div class="space-y-1.5">
              <label for="code" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Authentication Code
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound class="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  required
                  bind:value={$totpForm.code}
                  class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center tracking-[0.5em] font-mono text-lg transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                  placeholder="000000"
                />
              </div>
              {#if errors.code}
                <p class="text-red-500 dark:text-red-400 text-xs text-center">{errors.code}</p>
              {/if}
            </div>
            
            <button
              type="submit"
              disabled={$totpForm.processing || $totpForm.code.length !== 6}
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {#if $totpForm.processing}
                <Loader2 class="animate-spin h-4 w-4" />
                Verifying...
              {:else}
                Verify
                <ArrowRight class="h-4 w-4" />
              {/if}
            </button>
          </form>
        {:else}
          <form class="space-y-5" onsubmit={submitBackup}>
            <div class="space-y-1.5">
              <label for="backup-code" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Backup Code
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound class="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="backup-code"
                  name="code"
                  type="text"
                  required
                  bind:value={$backupForm.code}
                  class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center font-mono transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              {#if errors.code}
                <p class="text-red-500 dark:text-red-400 text-xs text-center">{errors.code}</p>
              {/if}
            </div>
            
            <button
              type="submit"
              disabled={$backupForm.processing}
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {#if $backupForm.processing}
                <Loader2 class="animate-spin h-4 w-4" />
                Verifying...
              {:else}
                Use Backup Code
                <ArrowRight class="h-4 w-4" />
              {/if}
            </button>
          </form>
        {/if}
        
        <!-- Toggle -->
        <div class="mt-6 text-center">
          <button
            type="button"
            onclick={() => useBackupCode = !useBackupCode}
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
          </button>
        </div>
        
        <!-- Help -->
        <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Lost access to your authenticator app?<br>
            <a href="/auth/login" class="text-indigo-600 dark:text-indigo-400 hover:underline">Sign in with a different account</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
