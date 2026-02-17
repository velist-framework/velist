<script lang="ts">
  import { toasts, type ToastType } from '$shared/lib/toast';
  import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-amber-500 dark:bg-amber-600',
    info: 'bg-blue-500 dark:bg-blue-600'
  };

  // Subscribe to store using $state
  let toastList = $state([] as { id: string; message: string; type: ToastType }[]);
  
  $effect(() => {
    const unsubscribe = toasts.subscribe((value) => {
      toastList = value;
    });
    return unsubscribe;
  });
</script>

<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
  {#each toastList as item (item.id)}
    {@const Icon = icons[item.type]}
    <div
      transition:fly={{ y: 20, duration: 200 }}
      class="pointer-events-auto min-w-[300px] max-w-[90vw] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white {colors[item.type]}"
    >
      <Icon class="w-5 h-5 flex-shrink-0" />
      
      <span class="flex-grow text-sm font-medium">{item.message}</span>
      
      <button
        onclick={() => toasts.remove(item.id)}
        class="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Close"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
