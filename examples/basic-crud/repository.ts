import { db } from '../../src/features/_core/database/connection'
import { uuidv7 } from '../../src/shared/lib/uuid'

export interface Post {
  id: string
  title: string
  content: string
  published: boolean
  user_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreatePostData {
  title: string
  content: string
  published?: boolean
  user_id: string
}

export interface UpdatePostData {
  title?: string
  content?: string
  published?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export class PostRepository {
  async findByUserPaginated(
    userId: string, 
    page: number = 1, 
    perPage: number = 10,
    search?: string
  ): Promise<PaginatedResult<Post>> {
    let query = db
      .selectFrom('posts')
      .where('user_id', '=', userId)
      .where('deleted_at', 'is', null)
    
    if (search) {
      query = query.where('title', 'like', `%${search}%`)
    }
    
    const offset = (page - 1) * perPage
    
    const [data, countResult] = await Promise.all([
      query
        .selectAll()
        .orderBy('created_at', 'desc')
        .limit(perPage)
        .offset(offset)
        .execute(),
      query
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst()
    ])
    
    const total = Number(countResult?.count || 0)
    
    return {
      data: data.map(row => ({
        ...row,
        published: Boolean(row.published)
      })),
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total
      }
    }
  }
  
  async findById(id: string): Promise<Post | null> {
    const row = await db
      .selectFrom('posts')
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .selectAll()
      .executeTakeFirst()
    
    if (!row) return null
    
    return {
      ...row,
      published: Boolean(row.published)
    }
  }
  
  async create(data: CreatePostData): Promise<Post> {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    const row = await db
      .insertInto('posts')
      .values({
        id,
        title: data.title,
        content: data.content,
        published: data.published ? 1 : 0,
        user_id: data.user_id,
        created_at: now,
        updated_at: now,
        deleted_at: null
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    
    return {
      ...row,
      published: Boolean(row.published)
    }
  }
  
  async update(id: string, data: UpdatePostData): Promise<Post | null> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.published !== undefined) updateData.published = data.published ? 1 : 0
    
    const row = await db
      .updateTable('posts')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    
    if (!row) return null
    
    return {
      ...row,
      published: Boolean(row.published)
    }
  }
  
  async softDelete(id: string): Promise<void> {
    await db
      .updateTable('posts')
      .set({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where('id', '=', id)
      .execute()
  }
  
  async restore(id: string): Promise<void> {
    await db
      .updateTable('posts')
      .set({ 
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', id)
      .execute()
  }
}
