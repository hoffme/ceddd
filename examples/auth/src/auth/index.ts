import {
	AuthAccessCommandDefinition,
	AuthAccessCheckCommandDefinition,
	AuthSignInCommandDefinition,
	AuthSignUpEventDef,
	AuthSignOutCommandDefinition,
	AuthSignUpCommandDefinition,
	AuthSignInEventDef,
	AuthSignOutEventDef
} from './domain';

import { AccessCommandResolver } from './resolvers/command/access';
import { AccessCheckCommandResolver } from './resolvers/command/check';

import { SignInCommandResolver } from './resolvers/command/signIn';
import { SignOutCommandResolver } from './resolvers/command/signOut';
import { SignUpCommandResolver } from './resolvers/command/signUp';
import { SignInEventResolver } from './resolvers/event/signIn';

export const Auth = {
	definitions: {
		commands: [
			AuthSignUpCommandDefinition,
			AuthSignInCommandDefinition,
			AuthAccessCommandDefinition,
			AuthAccessCheckCommandDefinition,
			AuthSignOutCommandDefinition
		] as const,
		events: [AuthSignUpEventDef, AuthSignInEventDef, AuthSignOutEventDef] as const
	},
	resolvers: {
		commands: [
			SignUpCommandResolver,
			SignInCommandResolver,
			AccessCommandResolver,
			AccessCheckCommandResolver,
			SignOutCommandResolver
		] as const,
		events: [SignInEventResolver] as const
	}
};
