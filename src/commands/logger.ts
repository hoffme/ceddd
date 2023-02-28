import { Command, CommandTopic } from './command';
import { CommandSchema } from './schema';

export interface CommandLogger<S extends CommandSchema> {
	init<T extends keyof S & CommandTopic>(command: Command<T, S[T]['data']>): void;
	success<T extends keyof S & CommandTopic>(
		command: Command<T, S[T]['data']>,
		result: S[T]['result']
	): void;
	error<T extends keyof S & CommandTopic>(
		command: Command<T, S[T]['data']>,
		error: unknown
	): void;
}
