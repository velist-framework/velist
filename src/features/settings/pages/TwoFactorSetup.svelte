<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Shield, Copy, Check, ArrowLeft, Loader2, AlertTriangle } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  import { toast } from '$shared/lib/toast'
  
  interface Props {
    user: { id: string; email: string; name: string }
    qrCode: string
    secret: string
    backupCodes: string[]
  }
  
  let { user, qrCode, secret, backupCodes }: Props = $props()
  
  let copiedSecret = $state(false)
  let copiedCodes = $state(false)
  let showBackupCodes = $state(false)
  
  const verifyForm = useForm({
    code: ''
  })
  
  function copySecret() {
    navigator.clipboard.writeText(secret)
    copiedSecret = true
    setTimeout(() => copiedSecret = false, 2000)
    toast.success('Secret copied to clipboard')
  }
  
  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    copiedCodes = true
    setTimeout(() => copiedCodes = false, 2000)
    toast.success('Backup codes copied')
  }
  
  function verify(e: Event) {
    e.preventDefault()
    $verifyForm.post('/settings/2fa/verify')
  }
</script>

<AppLayout title="Setup 2FA" {user} path="/settings">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <a href="/settings" class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors mb-4">
        <ArrowLeft class="w-4 h-4" />
        Back to Settings
      </a>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Shield class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setup Two-Factor Authentication</h1>
          <p class="text-gray-500 dark:text-slate-400">Secure your account with an authenticator app</p>
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      <!-- Step 1: Scan QR Code -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Scan QR Code</h2>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 dark:text-slate-300 mb-4">
            Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
          </p>
          
          <div class="flex flex-col items-center gap-4">
            <div class="bg-white p-4 rounded-xl shadow-sm">
              <img src={qrCode} alt="2FA QR Code" class="w-48 h-48" />
            </div>
            
            <!-- Manual Secret -->
            <div class="w-full">
              <p class="text-xs text-gray-500 dark:text-slate-400 mb-2">Can't scan? Enter this code manually:</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 dark:text-slate-300 break-all">
                  {secret}
                </code>
                <button
                  onclick={copySecret}
                  class="p-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Copy secret"
                >
                  {#if copiedSecret}
                    <Check class="w-5 h-5 text-emerald-500" />
                  {:else}
                    <Copy class="w-5 h-5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Step 2: Backup Codes -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Save Backup Codes</h2>
        </div>
        <div class="p-6">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-amber-800 dark:text-amber-300">Important!</p>
                <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Save these backup codes in a safe place. If you lose your phone, you can use these to access your account. Each code can only be used once.
                </p>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 font-mono text-sm text-center">
              {#if showBackupCodes}
                <div class="grid grid-cols-2 gap-2">
                  {#each backupCodes as code}
                    <div class="text-gray-700 dark:text-slate-300">{code}</div>
                  {/each}
                </div>
              {:else}
                <button
                  onclick={() => showBackupCodes = true}
                  class="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Click to reveal backup codes
                </button>
              {/if}
            </div>
            
            {#if showBackupCodes}
              <button
                onclick={copyBackupCodes}
                class="absolute top-2 right-2 p-1.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-600 rounded"
                title="Copy all codes"
              >
                {#if copiedCodes}
                  <Check class="w-4 h-4 text-emerald-500" />
                {:else}
                  <Copy class="w-4 h-4" />
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Step 3: Verify -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Verify</h2>
        </div>
        <div class="p-6">
          <form onsubmit={verify} class="space-y-4">
            <div>
              <label for="totp-code" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Enter 6-digit code from your authenticator app
              </label>
              <input
                id="totp-code"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                bind:value={$verifyForm.code}
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                placeholder="000000"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={$verifyForm.processing || $verifyForm.code.length !== 6}
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              {#if $verifyForm.processing}
                <Loader2 class="w-4 h-4 animate-spin" />
                Verifying...
              {:else}
                Enable 2FA
              {/if}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</AppLayout>
