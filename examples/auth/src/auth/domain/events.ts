import { EventDefinition } from 'ceddd/events';

import { SessionSchema, UserSchema } from './models';

// Sign Up

export const AuthSignUpEventDef = new EventDefinition({
	topic: 'evt.auth.signUp',
	schema: {
		data: UserSchema.omit({ passwordHash: true })
	}
});

// Sign In

export const AuthSignInEventDef = new EventDefinition({
	topic: 'evt.auth.signIn',
	schema: {
		data: SessionSchema
	}
});

// Sign Out

export const AuthSignOutEventDef = new EventDefinition({
	topic: 'evt.auth.signOut',
	schema: {
		data: SessionSchema
	}
});
