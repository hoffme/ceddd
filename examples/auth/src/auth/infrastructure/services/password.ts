import { pbkdf2Sync } from 'crypto';

import { PasswordService } from '../../domain';

export class LocalPasswordServices implements PasswordService {
	constructor(private readonly config: { salt: string }) {}

	public async encode(password: string): Promise<string> {
		const buffer = pbkdf2Sync(password, this.config.salt, 1000, 64, `sha512`);
		return buffer.toString(`hex`);
	}

	public async verify(password: string, hash: string): Promise<boolean> {
		const actualHash = await this.encode(password);
		return actualHash === hash;
	}
}
