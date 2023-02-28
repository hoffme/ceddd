import { DTO } from '../../domain/dto';

export abstract class MemoryRepository<T extends DTO> {
	protected readonly data: { [K: string]: T } = {};
}
