<script lang="ts">
  interface Props {
    path: string
  }
  
  let { path }: Props = $props()
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-4">Page not found</p>
    <p class="text-gray-500 mb-8">{path}</p>
    <a href="/" class="text-indigo-600 hover:text-indigo-500 font-medium">
      Go back home
    </a>
  </div>
</div>
