import { z } from 'zod';

import { JWTClaims, Session, User } from './models';

// Infrastructure

export interface AuthInfrastructure {
	repositories: {
		user: UserRepository;
		session: SessionRepository;
	};
	services: {
		uuid: UUIDService;
		password: PasswordService;
		jwt: JWTService;
	};
}

// Repositories

export const UserFindFilterSchema = z.union([
	z.object({ id: z.string() }),
	z.object({ username: z.string() }),
	z.object({ email: z.string() })
]);

export type UserFindFilter = z.infer<typeof UserFindFilterSchema>;

export interface UserRepository {
	find(filter: UserFindFilter): Promise<User | null>;
	save(model: User): Promise<void>;
}

export const SessionFindFilterSchema = z.object({ id: z.string() });

export type SessionFindFilter = z.infer<typeof SessionFindFilterSchema>;

export interface SessionRepository {
	find(filter: SessionFindFilter): Promise<Session | null>;
	save(model: Session): Promise<void>;
	remove(model: Session): Promise<boolean>;
}

// Services

export interface UUIDService {
	random(): Promise<string>;
}

export interface PasswordService {
	encode(password: string): Promise<string>;
	verify(password: string, hash: string): Promise<boolean>;
}

export interface JWTService {
	encode(claims: JWTClaims): Promise<string>;
	decode(token: string): Promise<JWTClaims>;
}
