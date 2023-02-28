import { sign, verify } from 'jsonwebtoken';

import { JWTClaims, JWTClaimsSchema, JWTService } from '../../domain';

export class LocalJWTService implements JWTService {
	constructor(private readonly config: { secret: string }) {}

	public async encode(claims: JWTClaims): Promise<string> {
		JWTClaimsSchema.parse(claims);

		return sign(claims, this.config.secret);
	}

	public async decode(token: string): Promise<JWTClaims> {
		const data = verify(token, this.config.secret);
		return JWTClaimsSchema.parse(data);
	}
}
