import { DomainError } from 'ceddd/error';
import { CommandResolver } from 'ceddd/resolver';

import { AuthSignInCommandDefinition, AuthSignInEventDef, Session } from '../../domain';
import { authSetupInfrastructure } from '../../infrastructure';

export const SignInCommandResolver = new CommandResolver({
	definition: AuthSignInCommandDefinition,
	errors: [new DomainError('credentials.incorrect', 'username or password incorrect')] as const,
	dependences: {
		commands: [],
		events: [AuthSignInEventDef] as const,
		infra: authSetupInfrastructure
	},
	method: async ({ cmd, infra, events, errors }) => {
		const user = await infra.repositories.user.find({ username: cmd.data.username });
		if (!user) {
			throw errors['credentials.incorrect'];
		}

		const samePassword = await infra.services.password.verify(
			cmd.data.password,
			user.passwordHash
		);
		if (!samePassword) {
			throw errors['credentials.incorrect'];
		}

		const expiredAt = new Date();
		expiredAt.setMonth(expiredAt.getMonth() + 1);

		const session: Session = {
			id: await infra.services.uuid.random(),
			userId: user.id,
			createdAt: new Date().toISOString(),
			expiredAt: expiredAt.toISOString()
		};

		await infra.repositories.session.save(session);

		const token = await infra.services.jwt.encode({
			type: 'session',
			expiredAt: expiredAt.toISOString(),
			sesionId: session.id
		});

		events.emit({
			topic: 'evt.auth.signIn',
			data: session
		});

		return {
			sessionToken: token,
			expiredAt: expiredAt.toISOString()
		};
	}
});
