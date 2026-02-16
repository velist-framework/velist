<script lang="ts">
  import { inertia, useForm } from '@inertiajs/svelte'
  import { fade } from 'svelte/transition'
  import AuthLayout from '../components/AuthLayout.svelte'
  
  interface Props {
    errors: {
      email?: string
      name?: string
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
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/auth/register', {
      preserveScroll: true
    })
  }
</script>

<AuthLayout title="Create Account">
  <div class="max-w-md w-full space-y-8" in:fade>
    <form class="mt-8 space-y-6" onsubmit={submit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <!-- Name -->
        <div>
          <label for="name" class="sr-only">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            class:border-red-500={errors.name}
            placeholder="Full Name"
            bind:value={$form.name}
          />
          {#if errors.name}
            <p class="text-red-500 text-xs mt-1">{errors.name}</p>
          {/if}
        </div>
        
        <!-- Email -->
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            class:border-red-500={errors.email}
            placeholder="Email address"
            bind:value={$form.email}
          />
          {#if errors.email}
            <p class="text-red-500 text-xs mt-1">{errors.email}</p>
          {/if}
        </div>
        
        <!-- Password -->
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minlength="8"
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            class:border-red-500={errors.password}
            placeholder="Password (min 8 characters)"
            bind:value={$form.password}
          />
        </div>
        
        <!-- Password Confirmation -->
        <div>
          <label for="password_confirmation" class="sr-only">Confirm Password</label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Confirm Password"
            bind:value={$form.password_confirmation}
          />
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
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          {/if}
          Create Account
        </button>
      </div>
    </form>
    
    <div class="text-center">
      <p class="text-sm text-gray-600">
        Already have an account?
        <a href="/auth/login" use:inertia class="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </a>
      </p>
    </div>
  </div>
</AuthLayout>
