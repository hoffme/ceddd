import { Session, SessionFindFilter, SessionRepository } from '../../domain';

import { MemoryRepository } from '../../../shared/infrastructure/memory';

export class MemorySessionRepository
	extends MemoryRepository<Session>
	implements SessionRepository
{
	public async find(params: SessionFindFilter): Promise<Session | null> {
		const dto = this.data[params.id];
		if (!dto) return null;
		return dto;
	}

	public async save(model: Session): Promise<void> {
		this.data[model.id] = model;
	}

	public async remove(model: Session): Promise<boolean> {
		return delete this.data[model.id];
	}
}
