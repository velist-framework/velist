import { Elysia } from 'elysia'
import { authApi } from '../../src/features/_core/auth/api'
import { PostService, CreatePostSchema, UpdatePostSchema } from './service'
import { inertia, type Inertia } from '../../src/inertia/plugin'

export const postApi = new Elysia({ prefix: '/posts' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive((ctx) => ({
    postService: new PostService(),
    userId: (ctx as any).user?.id as string
  }))
  
  // List with pagination and search
  .get('/', async (ctx) => {
    const { query, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const page = Number(query?.page) || 1
    const search = query?.search as string
    
    const result = await postService.getUserPosts(userId, page, 10, search)
    
    return inertia.render('posts/Index', {
      posts: result.data,
      pagination: result.meta,
      filters: { search }
    })
  })
  
  // Show single post
  .get('/:id', async (ctx) => {
    const { params, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const post = await postService.getPost(params.id)
    
    if (!post || post.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    return inertia.render('posts/Show', { post })
  })
  
  // Create form
  .get('/create', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('posts/Create', { errors: {}, old: {} })
  })
  
  // Store
  .post('/', async (ctx) => {
    const { body, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    try {
      await postService.createPost(userId, body)
      return inertia.redirect('/posts')
    } catch (error: any) {
      return inertia.render('posts/Create', {
        errors: { message: error.message },
        old: body
      })
    }
  }, { body: CreatePostSchema })
  
  // Edit form
  .get('/:id/edit', async (ctx) => {
    const { params, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const post = await postService.getPost(params.id)
    if (!post || post.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    return inertia.render('posts/Edit', { post, errors: {} })
  })
  
  // Update
  .put('/:id', async (ctx) => {
    const { params, body, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const post = await postService.getPost(params.id)
    if (!post || post.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    try {
      await postService.updatePost(params.id, body)
      return inertia.redirect('/posts')
    } catch (error: any) {
      return inertia.render('posts/Edit', {
        post: { ...post, ...body },
        errors: { message: error.message }
      })
    }
  }, { body: UpdatePostSchema })
  
  // Soft delete
  .delete('/:id', async (ctx) => {
    const { params, postService, userId, inertia } = ctx as typeof ctx & { inertia: Inertia }
    
    const post = await postService.getPost(params.id)
    if (!post || post.user_id !== userId) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    
    await postService.deletePost(params.id)
    return inertia.redirect('/posts')
  })
