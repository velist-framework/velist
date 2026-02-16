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

<div class="min-h-screen bg-gray-50">
  <!-- Simple Header -->
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="ml-2 text-xl font-bold text-gray-900">EISK</span>
          </a>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/auth/login" class="text-gray-500 hover:text-gray-700 text-sm font-medium">
            Sign in
          </a>
          <a href="/auth/register" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Get started
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main>
    {@render children()}
  </main>

  <!-- Simple Footer -->
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-gray-500">
        © 2024 EISK Stack. Built with Elysia + Inertia + Svelte + Kysely.
      </p>
    </div>
  </footer>
</div>
