import { db, type DatabaseSchema, type Transaction, type User, type NewUser } from '../database/connection'
import { uuidv7 } from '../../../shared/lib/uuid'

export class AuthRepository {
  constructor(private trx?: Transaction) {}
  
  private get db() {
    return this.trx ?? db
  }

  async findById(id: string): Promise<User | undefined> {
    return this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst()
  }

  async create(data: NewUser): Promise<User> {
    const id = uuidv7()
    const { id: _, ...rest } = data as NewUser & { id?: string }
    return this.db
      .insertInto('users')
      .values({
        id,
        ...rest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as NewUser)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async updatePassword(userId: string, hash: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ 
        password_hash: hash,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()
  }

  async deleteSession(token: string): Promise<void> {
    await this.db
      .deleteFrom('sessions')
      .where('id', '=', token)
      .execute()
  }

  // Static method untuk transactions
  static async transaction<T>(callback: (repo: AuthRepository) => Promise<T>): Promise<T> {
    return db.transaction().execute(async (trx) => {
      const repo = new AuthRepository(trx)
      return callback(repo)
    })
  }
}
