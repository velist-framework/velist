<script lang="ts">
  import { inertia, useForm } from '@inertiajs/svelte'
  import { fade } from 'svelte/transition'
  import AuthLayout from '../components/AuthLayout.svelte'
  
  // Props dari backend (fully typed via Inertia)
  interface Props {
    errors: {
      email?: string
      password?: string
    }
    status?: string | null
  }
  
  let { errors, status }: Props = $props()
  
  // Form helper dari Inertia
  const form = useForm({
    email: '',
    password: '',
    remember: false
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/auth/login', {
      preserveScroll: true
    })
  }
</script>

<AuthLayout title="Sign In">
  <div class="max-w-md w-full space-y-8" in:fade>
    {#if status}
      <div class="bg-green-50 p-4 rounded-md text-green-800" role="alert">
        {status}
      </div>
    {/if}
    
    <form class="mt-8 space-y-6" onsubmit={submit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            class:border-red-500={errors.email}
            placeholder="Email address"
            bind:value={$form.email}
          />
          {#if errors.email}
            <p class="text-red-500 text-xs mt-1">{errors.email}</p>
          {/if}
        </div>
        
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            class:border-red-500={errors.password}
            placeholder="Password"
            bind:value={$form.password}
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            bind:checked={$form.remember}
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="/auth/forgot-password" use:inertia class="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={$form.processing}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {#if $form.processing}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Loading spinner -->
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          {/if}
          Sign in
        </button>
      </div>
    </form>
    
    <div class="text-center">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a href="/auth/register" use:inertia class="font-medium text-indigo-600 hover:text-indigo-500">
          Register
        </a>
      </p>
    </div>
  </div>
</AuthLayout>
