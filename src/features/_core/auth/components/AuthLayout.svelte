<script lang="ts">
  interface Props {
    title: string
    children: import('svelte').Snippet
  }
  
  let { title, children }: Props = $props()
</script>

<svelte:head>
  <title>{title} | EISK App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
        <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        EISK Stack - Elysia + Inertia + Svelte + Kysely
      </p>
    </div>
    
    {@render children()}
  </div>
</div>
