<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { 
    Database, 
    Clock, 
    HardDrive, 
    Cloud, 
    Play, 
    Trash2, 
    Settings,
    CheckCircle,
    AlertCircle,
    Download,
    RotateCcw
  } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'

  
  interface Backup {
    filename: string
    size: number
    createdAt: string
  }
  
  interface Config {
    enabled: boolean
    intervalMinutes: number
    retentionCount: number
    localPath: string
    s3Enabled: boolean
    s3Path?: string
  }
  
  interface Props {
    user: { id: string; email: string; name: string; role: string }
    backups: Backup[]
    config: Config
    dbSize: number
    lastResult?: {
      success: boolean
      filename: string
      size: number
      s3Uploaded?: boolean
      error?: string
    }
    status?: string
    error?: string
  }
  
  let { user, backups, config, dbSize, lastResult, status, error }: Props = $props()
  
  let showConfig = $state(false)
  let localConfig = $state({ ...config })
  let isBackingUp = $state(false)
  
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  function triggerBackup() {
    isBackingUp = true
    router.post('/backup/now', {}, {
      onFinish: () => isBackingUp = false
    })
  }
  
  function saveConfig() {
    router.post('/backup/config', localConfig)
    showConfig = false
  }
  
  function deleteBackup(filename: string) {
    if (confirm(`Delete backup ${filename}?`)) {
      router.delete(`/backup/${filename}`)
    }
  }
  
  function downloadBackup(filename: string) {
    const link = document.createElement('a')
    link.href = `/storage/backups/${filename}`
    link.download = filename
    link.click()
  }
</script>

<AppLayout title="Database Backup" {user} path="/backup">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Database class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Database Backup</h1>
          <p class="text-gray-500 dark:text-slate-400">Auto-backup with WAL checkpoint and optional S3 upload</p>
        </div>
      </div>
    </div>
    
    <!-- Status Messages -->
    {#if status}
      <div class="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
        <CheckCircle class="w-5 h-5" />
        {status}
      </div>
    {/if}
    
    {#if error}
      <div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle class="w-5 h-5" />
        {error}
      </div>
    {/if}
    
    {#if lastResult}
      {#if lastResult.success}
        <div class="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <CheckCircle class="w-5 h-5" />
            <span class="font-medium">Backup Successful</span>
          </div>
          <p class="text-sm ml-7">
            {lastResult.filename} ({formatBytes(lastResult.size)})
            {#if lastResult.s3Uploaded}
              <span class="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">
                <Cloud class="w-3 h-3" />
                S3
              </span>
            {/if}
          </p>
        </div>
      {:else}
        <div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <AlertCircle class="w-5 h-5" />
            <span class="font-medium">Backup Failed</span>
          </div>
          <p class="text-sm ml-7">{lastResult.error}</p>
        </div>
      {/if}
    {/if}
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Database class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-slate-400">Database Size</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{formatBytes(dbSize)}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <HardDrive class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-slate-400">Local Backups</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{backups.length}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-slate-400">Auto-Backup</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">
              {config.enabled ? `Every ${config.intervalMinutes}m` : 'Off'}
            </p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg {config.s3Enabled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-slate-700'} flex items-center justify-center">
            <Cloud class="w-5 h-5 {config.s3Enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-slate-400">S3 Backup</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">
              {config.s3Enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-8">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Actions</h2>
        <button
          onclick={() => showConfig = !showConfig}
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <Settings class="w-4 h-4" />
          Configure
        </button>
      </div>
      <div class="p-6 flex flex-wrap gap-4">
        <button
          onclick={triggerBackup}
          disabled={isBackingUp}
          class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {#if isBackingUp}
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Backing up...
          {:else}
            <Play class="w-4 h-4" />
            Backup Now
          {/if}
        </button>
      </div>
    </div>
    
    <!-- Config Panel -->
    {#if showConfig}
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-8">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Auto-Backup Interval (minutes)
              </label>
              <input
                type="number"
                bind:value={localConfig.intervalMinutes}
                min="1"
                max="1440"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Retention Count (backups to keep)
              </label>
              <input
                type="number"
                bind:value={localConfig.retentionCount}
                min="1"
                max="100"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={localConfig.enabled}
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700 dark:text-slate-300">Enable auto-backup</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={localConfig.s3Enabled}
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700 dark:text-slate-300">Upload to S3</span>
            </label>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onclick={() => showConfig = false}
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onclick={saveConfig}
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Backup List -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Backup History</h2>
      </div>
      
      {#if backups.length === 0}
        <div class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <Database class="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No backups yet</h3>
          <p class="text-gray-500 dark:text-slate-400">Click "Backup Now" to create your first backup.</p>
        </div>
      {:else}
        <div class="divide-y divide-gray-200 dark:divide-slate-700">
          {#each backups as backup}
            <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Database class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{backup.filename}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    {formatBytes(backup.size)} • {new Date(backup.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  onclick={() => downloadBackup(backup.filename)}
                  class="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download class="w-4 h-4" />
                </button>
                <button
                  onclick={() => deleteBackup(backup.filename)}
                  class="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</AppLayout>
