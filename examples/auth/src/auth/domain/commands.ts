import { z } from 'zod';

import { CommandDefinition } from 'ceddd/commands';

// Sign Up

export const AuthSignUpCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.signUp',
	schema: {
		data: z.object({
			firstName: z.string(),
			lastName: z.string(),
			email: z.string(),
			username: z.string(),
			password: z.string()
		}),
		result: z.literal(true)
	}
});

// Sign In

export const AuthSignInCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.signIn',
	schema: {
		data: z.object({
			username: z.string(),
			password: z.string()
		}),
		result: z.object({
			sessionToken: z.string(),
			expiredAt: z.string()
		})
	}
});

// Access

export const AuthAccessCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.access',
	schema: {
		data: z.object({
			sessionToken: z.string()
		}),
		result: z.object({
			accessToken: z.string(),
			expiredAt: z.string()
		})
	}
});

// Access Check

export const AuthAccessCheckCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.access.check',
	schema: {
		data: z.object({
			accessToken: z.string()
		}),
		result: z.object({
			expiredAt: z.string()
		})
	}
});

// Sign Out

export const AuthSignOutCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.signOut',
	schema: {
		data: z.object({
			sessionToken: z.string()
		}),
		result: z.boolean()
	}
});
