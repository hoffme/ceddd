import { User, UserFindFilter, UserRepository } from '../../domain';

import { MemoryRepository } from '../../../shared/infrastructure/memory';

export class MemoryUserRepository extends MemoryRepository<User> implements UserRepository {
	public async find(params: UserFindFilter): Promise<User | null> {
		if ('id' in params) {
			return this.data[params.id] || null;
		}

		if ('email' in params) {
			return Object.values(this.data).find((dto) => dto.email === params.email) || null;
		}

		return Object.values(this.data).find((dto) => dto.username === params.username) || null;
	}

	public async save(model: User): Promise<void> {
		this.data[model.id] = model;
	}
}
