import { DomainError } from 'ceddd/error';
import { CommandResolver } from 'ceddd/resolver';

import { AuthSignUpCommandDefinition, AuthSignUpEventDef, User } from '../../domain';
import { authSetupInfrastructure } from '../../infrastructure';

export const SignUpCommandResolver = new CommandResolver({
	definition: AuthSignUpCommandDefinition,
	errors: [
		new DomainError('email.exists', 'email already exists'),
		new DomainError('username.exists', 'username already exists')
	] as const,
	dependences: {
		commands: [],
		events: [AuthSignUpEventDef] as const,
		infra: authSetupInfrastructure
	},
	method: async ({ cmd, infra, events, errors }) => {
		const userWithSameEmail = await infra.repositories.user.find({ email: cmd.data.email });
		if (userWithSameEmail) {
			throw errors['email.exists'];
		}

		const userWithSameUsername = await infra.repositories.user.find({
			username: cmd.data.username
		});
		if (userWithSameUsername) {
			throw errors['username.exists'];
		}

		const user: User = {
			id: await infra.services.uuid.random(),
			firstName: cmd.data.firstName,
			lastName: cmd.data.lastName,
			email: cmd.data.email,
			username: cmd.data.username,
			passwordHash: await infra.services.password.encode(cmd.data.password)
		};

		await infra.repositories.user.save(user);

		events.emit({
			topic: 'evt.auth.signUp',
			data: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				username: user.username
			}
		});

		return true;
	}
});
