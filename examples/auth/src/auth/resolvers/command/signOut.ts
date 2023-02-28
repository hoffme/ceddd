import { DomainError } from 'ceddd/error';
import { CommandResolver } from 'ceddd/resolver';

import { authSetupInfrastructure } from '../../infrastructure';

import { AuthSignOutCommandDefinition, AuthSignOutEventDef } from '../../domain';

export const SignOutCommandResolver = new CommandResolver({
	definition: AuthSignOutCommandDefinition,
	errors: [new DomainError('token.invalid', 'token invalid')] as const,
	dependences: {
		commands: [],
		events: [AuthSignOutEventDef],
		infra: authSetupInfrastructure
	},
	method: async ({ cmd, infra, events, errors }) => {
		const claims = await infra.services.jwt.decode(cmd.data.sessionToken);
		if (claims.type !== 'session') {
			throw errors['token.invalid'];
		}

		const session = await infra.repositories.session.find({ id: claims.sesionId });
		if (!session) return false;

		await infra.repositories.session.remove(session);

		events.emit({
			topic: 'evt.auth.signOut',
			data: session
		});

		return true;
	}
});
