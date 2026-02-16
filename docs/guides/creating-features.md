# Creating Features in EISK Stack

This guide walks you through creating a complete CRUD feature following EISK Stack conventions.

## Overview

In EISK Stack, features are organized using **Vertical Feature Slicing** - all related code lives in one folder.

## Example: Tasks Feature

Let's create a complete "Tasks" feature with:
- List tasks
- Create task
- Edit task
- Delete task
- Mark as complete

### Step 1: Create Folder Structure

```bash
mkdir -p src/features/tasks/pages
touch src/features/tasks/{api.ts,service.ts,repository.ts}
touch src/features/tasks/pages/{Index.svelte,Create.svelte,Edit.svelte}
```

### Step 2: Update Database Schema

Edit `src/features/_core/database/connection.ts`:

```typescript
export interface DatabaseSchema {
  // ... existing tables
  
  tasks: {
    id: string
    title: string
    description: string | null
    completed: number // SQLite doesn't have boolean, use 0/1
    user_id: string
    created_at: string
    updated_at: string
  }
}
```

### Step 3: Create Migration

```bash
bun run db:generate
```

Review the generated SQL in `src/features/_core/database/migrations/XXXX_tasks.sql`:

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

Apply migration:

```bash
bun run db:migrate
```

### Step 4: Repository Layer

Create `src/features/tasks/repository.ts`:

```typescript
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
  user_id: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  completed?: boolean
}

export class TaskRepository {
  async findByUser(userId: string): Promise<Task[]> {
    const rows = await db
      .selectFrom('tasks')
      .where('user_id', '=', userId)
      .selectAll()
      .execute()
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    }))
  }
  
  async findById(id: string): Promise<Task | null> {
    const row = await db
      .selectFrom('tasks')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
    
    if (!row) return null
    
    return {
      ...row,
      completed: Boolean(row.completed)
    }
  }
  
  async create(data: CreateTaskData): Promise<Task> {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    const row = await db
      .insertInto('tasks')
      .values({
        id,
        title: data.title,
        description: data.description || null,
        completed: 0,
        user_id: data.user_id,
        created_at: now,
        updated_at: now
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    
    return {
      ...row,
      completed: Boolean(row.completed)
    }
  }
  
  async update(id: string, data: UpdateTaskData): Promise<Task | null> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.completed !== undefined) updateData.completed = data.completed ? 1 : 0
    
    const row = await db
      .updateTable('tasks')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    
    if (!row) return null
    
    return {
      ...row,
      completed: Boolean(row.completed)
    }
  }
  
  async delete(id: string): Promise<void> {
    await db
      .deleteFrom('tasks')
      .where('id', '=', id)
      .execute()
  }
}
```

### Step 5: Service Layer

Create `src/features/tasks/service.ts`:

```typescript
import { t, type Static } from 'elysia'
import { TaskRepository } from './repository'

export const CreateTaskSchema = t.Object({
  title: t.String({ 
    minLength: 1, 
    maxLength: 255,
    errorMessage: 'Title is required and must be less than 255 characters'
  }),
  description: t.Optional(t.String({ maxLength: 1000 }))
}, { 
  additionalProperties: false 
})

export const UpdateTaskSchema = t.Partial(t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String({ maxLength: 1000 })),
  completed: t.Boolean()
}))

export type CreateTaskPayload = Static<typeof CreateTaskSchema>
export type UpdateTaskPayload = Static<typeof UpdateTaskSchema>

export class TaskService {
  constructor(private repo: TaskRepository = new TaskRepository()) {}
  
  async getUserTasks(userId: string) {
    return this.repo.findByUser(userId)
  }
  
  async getTask(id: string) {
    return this.repo.findById(id)
  }
  
  async createTask(userId: string, payload: CreateTaskPayload) {
    return this.repo.create({
      ...payload,
      user_id: userId
    })
  }
  
  async updateTask(id: string, payload: UpdateTaskPayload) {
    return this.repo.update(id, payload)
  }
  
  async deleteTask(id: string) {
    return this.repo.delete(id)
  }
  
  async toggleComplete(id: string) {
    const task = await this.repo.findById(id)
    if (!task) return null
    
    return this.repo.update(id, { completed: !task.completed })
  }
}
```

### Step 6: API Routes

Create `src/features/tasks/api.ts`:

```typescript
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { TaskService, CreateTaskSchema, UpdateTaskSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const taskApi = new Elysia({ prefix: '/tasks' })
  .use(authApi)
  .auth(true)  // Require authentication
  .use(inertia())
  .derive((ctx) => ({
    taskService: new TaskService(),
    userId: (ctx as any).user?.id as string
  }))
  
  // List all tasks
  .get('/', async (ctx) => {
    const { inertia, taskService, userId } = ctx as typeof ctx & { inertia: Inertia }
    const tasks = await taskService.getUserTasks(userId)
    
    return inertia.render('tasks/Index', { 
      tasks,
      stats: {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length
      }
    })
  })
  
  // Show create form
  .get('/create', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('tasks/Create', { 
      errors: {},
      old: {}
    })
  })
  
  // Store new task
  .post('/', async (ctx) => {
    const { body, taskService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    try {
      await taskService.createTask(userId, body)
      return inertia.redirect('/tasks')
    } catch (error: any) {
      return inertia.render('tasks/Create', { 
        errors: { message: error.message },
        old: body
      })
    }
  }, { body: CreateTaskSchema })
  
  // Show edit form
  .get('/:id/edit', async (ctx) => {
    const { params, taskService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const task = await taskService.getTask(params.id)
    
    if (!task || task.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    return inertia.render('tasks/Edit', { 
      task,
      errors: {}
    })
  })
  
  // Update task
  .put('/:id', async (ctx) => {
    const { params, body, taskService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const task = await taskService.getTask(params.id)
    if (!task || task.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    try {
      await taskService.updateTask(params.id, body)
      return inertia.redirect('/tasks')
    } catch (error: any) {
      return inertia.render('tasks/Edit', { 
        task: { ...task, ...body },
        errors: { message: error.message }
      })
    }
  }, { body: UpdateTaskSchema })
  
  // Toggle complete status
  .patch('/:id/toggle', async (ctx) => {
    const { params, taskService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const task = await taskService.getTask(params.id)
    if (!task || task.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    await taskService.toggleComplete(params.id)
    return inertia.redirect('/tasks')
  })
  
  // Delete task
  .delete('/:id', async (ctx) => {
    const { params, taskService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const task = await taskService.getTask(params.id)
    if (!task || task.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    await taskService.deleteTask(params.id)
    return inertia.redirect('/tasks')
  })
```

### Step 7: Svelte Pages

**Index.svelte:**

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Plus, Pencil, Trash, Check, X } from 'lucide-svelte'
  
  interface Task {
    id: string
    title: string
    description: string | null
    completed: boolean
    created_at: string
  }
  
  interface Props {
    tasks: Task[]
    stats: {
      total: number
      completed: number
      pending: number
    }
  }
  
  let { tasks, stats }: Props = $props()
  
  const deleteForm = useForm({})
  const toggleForm = useForm({})
  
  function deleteTask(id: string) {
    if (confirm('Delete this task?')) {
      $deleteForm.delete(`/tasks/${id}`)
    }
  }
  
  function toggleTask(id: string) {
    $toggleForm.patch(`/tasks/${id}/toggle`)
  }
  
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString()
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
      <p class="text-slate-500 dark:text-slate-400">
        {stats.completed} of {stats.total} completed
      </p>
    </div>
    <a href="/tasks/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
      <Plus class="w-4 h-4" />
      New Task
    </a>
  </div>
  
  <!-- Stats -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
      <p class="text-sm text-slate-500 dark:text-slate-400">Total</p>
      <p class="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
    </div>
    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
      <p class="text-sm text-slate-500 dark:text-slate-400">Pending</p>
      <p class="text-2xl font-bold text-yellow-600">{stats.pending}</p>
    </div>
    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
      <p class="text-sm text-slate-500 dark:text-slate-400">Completed</p>
      <p class="text-2xl font-bold text-green-600">{stats.completed}</p>
    </div>
  </div>
  
  <!-- Tasks List -->
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
    {#each tasks as task}
      <div class="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 last:border-0" class:opacity-60={task.completed}>
        <button 
          onclick={() => toggleTask(task.id)}
          class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          class:border-indigo-600={task.completed}
          class:bg-indigo-600={task.completed}
          class:border-slate-300={!task.completed}
          class:dark:border-slate-600={!task.completed}
        >
          {#if task.completed}
            <Check class="w-4 h-4 text-white" />
          {/if}
        </button>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-slate-900 dark:text-white" class:line-through={task.completed}>
            {task.title}
          </h3>
          {#if task.description}
            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{task.description}</p>
          {/if}
          <p class="text-xs text-slate-400 mt-1">Created {formatDate(task.created_at)}</p>
        </div>
        
        <div class="flex gap-2">
          <a href="/tasks/{task.id}/edit" class="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
            <Pencil class="w-4 h-4" />
          </a>
          <button onclick={() => deleteTask(task.id)} class="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
            <Trash class="w-4 h-4" />
          </button>
        </div>
      </div>
    {/each}
    
    {#if tasks.length === 0}
      <div class="p-8 text-center text-slate-500 dark:text-slate-400">
        <p class="mb-4">No tasks yet. Create your first task!</p>
        <a href="/tasks/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus class="w-4 h-4" />
          Create Task
        </a>
      </div>
    {/if}
  </div>
</div>
```

**Create.svelte:**

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { ArrowLeft } from 'lucide-svelte'
  
  interface Props {
    errors: Record<string, string>
    old: { title?: string; description?: string }
  }
  
  let { errors, old }: Props = $props()
  
  const form = useForm({
    title: old.title || '',
    description: old.description || ''
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/tasks')
  }
</script>

<div class="p-6 max-w-2xl mx-auto">
  <div class="flex items-center gap-4 mb-6">
    <a href="/tasks" class="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
      <ArrowLeft class="w-5 h-5" />
    </a>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Create Task</h1>
  </div>
  
  <form onsubmit={submit} class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Title *
      </label>
      <input 
        type="text" 
        bind:value={$form.title}
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        class:border-red-500={errors.title}
        required
      />
      {#if errors.title}
        <p class="mt-1 text-sm text-red-600">{errors.title}</p>
      {/if}
    </div>
    
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Description
      </label>
      <textarea 
        bind:value={$form.description}
        rows="4"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        class:border-red-500={errors.description}
      ></textarea>
      {#if errors.description}
        <p class="mt-1 text-sm text-red-600">{errors.description}</p>
      {/if}
    </div>
    
    {#if errors.message}
      <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
        {errors.message}
      </div>
    {/if}
    
    <div class="flex justify-end gap-3 pt-4">
      <a href="/tasks" class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900">
        Cancel
      </a>
      <button 
        type="submit" 
        disabled={$form.processing}
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {$form.processing ? 'Creating...' : 'Create Task'}
      </button>
    </div>
  </form>
</div>
```

### Step 8: Mount and Test

Edit `src/bootstrap.ts`:

```typescript
import { taskApi } from './features/tasks/api'

// ... existing routes
app.use(taskApi)
```

Test your feature:

```bash
# Restart dev server
bun run dev

# Login at http://localhost:3000/auth/login
# Navigate to http://localhost:3000/tasks
```

## Best Practices

1. **Always validate ownership** - Check `user_id` matches current user
2. **Use transactions** for multi-step operations
3. **Return proper HTTP codes** - 404 for not found, 403 for unauthorized
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Use TypeBox for validation** - Gets both runtime validation and TypeScript types

## Next Steps

- Add [E2E tests](../guides/testing.md) for your feature
- Learn about [file uploads](./file-upload.md)
- Implement [real-time updates](./realtime.md)
