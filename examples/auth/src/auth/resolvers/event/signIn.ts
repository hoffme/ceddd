import { EventResolver } from 'ceddd/resolver';

import { AuthSignInEventDef } from '../../domain';
import { authSetupInfrastructure } from '../../infrastructure';

export const SignInEventResolver = new EventResolver({
	name: 'print sign in user session',
	definition: AuthSignInEventDef,
	dependences: {
		commands: [],
		events: [],
		infra: authSetupInfrastructure
	},
	errors: [],
	method: async ({ evt, infra }) => {
		const user = await infra.repositories.user.find({ id: evt.data.userId });

		console.log(
			`New sign in by ${user?.firstName} ${user?.lastName} with session ${evt.data.id}`
		);
	}
});
