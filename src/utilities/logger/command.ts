import { Command, CommandSchema, CommandLogger } from '../../messages/commands';

import { log } from './log';

export class CLILoggerCommand implements CommandLogger<CommandSchema> {
	public init<T extends keyof CommandSchema>(cmd: Command<T, CommandSchema[T]['data']>): void {
		log(
			['Gray', new Date().toISOString()],
			['Cyan', 'CMD INI'],
			['Yellow', cmd.topic],
			['Gray', cmd.id]
		);
	}

	public success<T extends keyof CommandSchema>(cmd: Command<T, CommandSchema[T]['data']>): void {
		const duration = new Date().getTime() - new Date(cmd.datetime).getTime();
		log(
			['Gray', new Date().toISOString()],
			['Green', 'CMD SUC'],
			['Yellow', cmd.topic],
			['Gray', `${cmd.id} ${duration}ms`]
		);
	}

	public error<T extends keyof CommandSchema>(
		cmd: Command<T, CommandSchema[T]['data']>,
		error: unknown
	): void {
		const duration = new Date().getTime() - new Date(cmd.datetime).getTime();
		log(
			['Gray', new Date().toISOString()],
			['Red', 'CMD ERR'],
			['Yellow', cmd.topic],
			['Gray', `${cmd.id} ${duration}ms`]
		);
		console.error(error);
	}
}
