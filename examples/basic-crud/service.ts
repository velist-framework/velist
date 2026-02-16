import { t, type Static } from 'elysia'
import { PostRepository } from './repository'

export const CreatePostSchema = t.Object({
  title: t.String({ 
    minLength: 1, 
    maxLength: 255,
    errorMessage: 'Title is required and must be less than 255 characters'
  }),
  content: t.String({ 
    minLength: 1,
    errorMessage: 'Content is required'
  }),
  published: t.Optional(t.Boolean({ default: false }))
}, { 
  additionalProperties: false 
})

export const UpdatePostSchema = t.Partial(t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  content: t.String({ minLength: 1 }),
  published: t.Boolean()
}))

export type CreatePostPayload = Static<typeof CreatePostSchema>
export type UpdatePostPayload = Static<typeof UpdatePostSchema>

export interface PaginatedPosts {
  data: Array<{
    id: string
    title: string
    content: string
    published: boolean
    user_id: string
    created_at: string
    updated_at: string
  }>
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export class PostService {
  constructor(private repo: PostRepository = new PostRepository()) {}
  
  async getUserPosts(
    userId: string, 
    page: number = 1, 
    perPage: number = 10,
    search?: string
  ): Promise<PaginatedPosts> {
    return this.repo.findByUserPaginated(userId, page, perPage, search)
  }
  
  async getPost(id: string) {
    return this.repo.findById(id)
  }
  
  async createPost(userId: string, payload: CreatePostPayload) {
    return this.repo.create({
      ...payload,
      user_id: userId
    })
  }
  
  async updatePost(id: string, payload: UpdatePostPayload) {
    return this.repo.update(id, payload)
  }
  
  async deletePost(id: string) {
    return this.repo.softDelete(id)
  }
}
