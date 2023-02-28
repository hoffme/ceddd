import { AuthInfrastructure } from '../domain/infrastructure';

import { MemoryUserRepository } from './memory/user';
import { MemorySessionRepository } from './memory/session';
import { LocalUUIDService } from './services/uuid';
import { LocalPasswordServices } from './services/password';
import { LocalJWTService } from './services/jwt';

let infra: AuthInfrastructure | null = null;

export const authSetupInfrastructure = async (): Promise<AuthInfrastructure> => {
	if (infra) return infra;

	const userRepository = new MemoryUserRepository();
	const sessionRepository = new MemorySessionRepository();

	const uuidService = new LocalUUIDService();
	const passwordService = new LocalPasswordServices({ salt: 'salt' });
	const jwtSerive = new LocalJWTService({ secret: 'SHHHHHH' });

	infra = {
		repositories: {
			user: userRepository,
			session: sessionRepository
		},
		services: {
			uuid: uuidService,
			password: passwordService,
			jwt: jwtSerive
		}
	};

	return infra;
};
