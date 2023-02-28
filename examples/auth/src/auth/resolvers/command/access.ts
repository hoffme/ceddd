import { DomainError } from 'ceddd/error';
import { CommandResolver } from 'ceddd/resolver';

import { authSetupInfrastructure } from '../../infrastructure';

import { AuthAccessCommandDefinition } from '../../domain';

export const AccessCommandResolver = new CommandResolver({
	definition: AuthAccessCommandDefinition,
	errors: [new DomainError('token.invalid', 'token invalid')] as const,
	dependences: {
		commands: [],
		events: [],
		infra: authSetupInfrastructure
	},
	method: async ({ cmd, infra, errors }) => {
		const claims = await infra.services.jwt.decode(cmd.data.sessionToken);
		if (claims.type !== 'session') {
			throw errors['token.invalid'];
		}

		const session = await infra.repositories.session.find({ id: claims.sesionId });
		if (!session) {
			throw errors['token.invalid'];
		}

		const expiredAt = new Date();
		expiredAt.setMinutes(expiredAt.getMinutes() + 10);

		const token = await infra.services.jwt.encode({
			type: 'access',
			expiredAt: expiredAt.toISOString(),
			sessionId: session.id,
			userId: session.userId
		});

		return {
			accessToken: token,
			expiredAt: expiredAt.toISOString()
		};
	}
});
