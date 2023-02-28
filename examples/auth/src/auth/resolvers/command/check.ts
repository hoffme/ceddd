import { DomainError } from 'ceddd/error';
import { CommandResolver } from 'ceddd/resolver';

import { AuthAccessCheckCommandDefinition } from '../../domain';
import { authSetupInfrastructure } from '../../infrastructure';

export const AccessCheckCommandResolver = new CommandResolver({
	definition: AuthAccessCheckCommandDefinition,
	errors: [new DomainError('token.invalid', 'token invalid')] as const,
	dependences: {
		commands: [],
		events: [],
		infra: authSetupInfrastructure
	},
	method: async ({ cmd, infra, errors }) => {
		const claims = await infra.services.jwt.decode(cmd.data.accessToken);
		if (claims.type !== 'access') {
			throw errors['token.invalid'];
		}

		return { expiredAt: claims.expiredAt };
	}
});
