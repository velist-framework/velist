import { db } from '../_core/database/connection'

export interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export class UserRepository {
  async findAll(): Promise<User[]> {
    return db.selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'created_at'])
      .orderBy('created_at', 'desc')
      .execute()
  }

  async findById(id: string): Promise<User | undefined> {
    return db.selectFrom('users')
      .where('id', '=', id)
      .select(['id', 'email', 'name', 'role', 'created_at'])
      .executeTakeFirst()
  }
}
