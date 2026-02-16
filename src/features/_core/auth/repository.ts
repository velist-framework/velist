import { db, type DatabaseSchema, type User, type NewUser } from '../database/connection'
import { uuidv7 } from '../../../shared/lib/uuid'

export class AuthRepository {
  async findById(id: string): Promise<User | undefined> {
    return db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst()
  }

  async create(data: { email: string; name: string; password_hash: string; role?: string }): Promise<User> {
    const id = uuidv7()
    await db
      .insertInto('users')
      .values({
        id,
        email: data.email,
        name: data.name,
        password_hash: data.password_hash,
        role: data.role || 'user',
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute()
    
    return this.findById(id) as Promise<User>
  }

  async updatePassword(userId: string, hash: string): Promise<void> {
    await db
      .updateTable('users')
      .set({ 
        password_hash: hash,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()
  }

  async deleteSession(token: string): Promise<void> {
    await db
      .deleteFrom('sessions')
      .where('id', '=', token)
      .execute()
  }
}
