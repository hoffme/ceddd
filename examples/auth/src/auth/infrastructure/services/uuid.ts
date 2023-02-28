import { v4 as uuidV4 } from 'uuid';

import { UUIDService } from '../../domain';

export class LocalUUIDService implements UUIDService {
	public async random(): Promise<string> {
		return uuidV4();
	}
}
