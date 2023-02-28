import { z } from 'zod';

// User

export const UserSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	username: z.string(),
	passwordHash: z.string()
});

export type User = z.infer<typeof UserSchema>;

// Session

export const SessionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	createdAt: z.string(),
	expiredAt: z.string()
});

export type Session = z.infer<typeof SessionSchema>;

// Claims

export const JWTSessionClaimsSchema = z.object({
	type: z.literal('session'),
	expiredAt: z.string(),
	sesionId: z.string()
});

export const JWTAccessClaimsSchema = z.object({
	type: z.literal('access'),
	expiredAt: z.string(),
	sessionId: z.string(),
	userId: z.string()
});

export const JWTClaimsSchema = z.union([JWTSessionClaimsSchema, JWTAccessClaimsSchema]);

export type JWTClaims = z.infer<typeof JWTClaimsSchema>;
