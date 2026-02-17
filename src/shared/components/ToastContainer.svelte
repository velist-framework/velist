<script lang="ts">
  import { toasts, type ToastType, type ToastItem } from '$shared/lib/toast';
  import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  // Modern toast styles with glassmorphism
  const toastStyles: Record<ToastType, { 
    bg: string; 
    border: string; 
    iconBg: string;
    iconColor: string;
  }> = {
    success: {
      bg: 'bg-emerald-50/95 dark:bg-emerald-950/90',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    error: {
      bg: 'bg-rose-50/95 dark:bg-rose-950/90',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      iconColor: 'text-rose-600 dark:text-rose-400'
    },
    warning: {
      bg: 'bg-amber-50/95 dark:bg-amber-950/90',
      border: 'border-amber-200/80 dark:border-amber-800/60',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    info: {
      bg: 'bg-sky-50/95 dark:bg-sky-950/90',
      border: 'border-sky-200/80 dark:border-sky-800/60',
      iconBg: 'bg-sky-100 dark:bg-sky-900/50',
      iconColor: 'text-sky-600 dark:text-sky-400'
    }
  };

  // Subscribe to store using $state
  let toastList = $state<ToastItem[]>([]);
  
  $effect(() => {
    const unsubscribe = toasts.subscribe((value) => {
      toastList = value;
    });
    return unsubscribe;
  });
</script>

<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none">
  {#each toastList as item (item.id)}
    {@const style = toastStyles[item.type]}
    {@const Icon = icons[item.type]}
    <div
      transition:fly={{ y: 20, duration: 200 }}
      class="pointer-events-auto min-w-[340px] max-w-[90vw] flex items-center gap-4 px-4 py-4 rounded-xl 
             backdrop-blur-sm border shadow-lg shadow-black/5 dark:shadow-black/20
             {style.bg} {style.border}"
    >
      <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center {style.iconBg}">
        <Icon class="w-5 h-5 {style.iconColor}" />
      </div>
      
      <span class="flex-grow text-sm font-medium text-gray-800 dark:text-gray-100">
        {item.message}
      </span>
      
      <button
        onclick={() => toasts.remove(item.id)}
        class="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 
               dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        aria-label="Close"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
