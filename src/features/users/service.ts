import { UserRepository, type User } from './repository'

export class UserService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getAll(): Promise<User[]> {
    return this.repo.findAll()
  }

  async getById(id: string): Promise<User | undefined> {
    return this.repo.findById(id)
  }
}
