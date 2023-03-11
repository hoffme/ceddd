import { ZodSchema, z } from 'zod';

import { JSONValue } from '../../shared/json';

import { CommandTopic } from './command';
import { CommandHandler } from './handler';

export interface CommandSchema {
	[K: CommandTopic]: {
		data: JSONValue;
		result: JSONValue;
	};
}

export type CommandHandlers<S extends CommandSchema> = {
	[K in keyof S & CommandTopic]: CommandHandler<K, S[K]['data'], S[K]['result']>;
};

export type CommandZodSchema<S extends CommandSchema> = {
	[K in keyof S & CommandTopic]: {
		data: ZodSchema<S[K]['data']>;
		result: ZodSchema<S[K]['result']>;
	};
};

export type ZodToCommandSchema<Z extends CommandZodSchema<CommandSchema>> = {
	[K in keyof Z & CommandTopic]: {
		data: z.infer<Z[K]['data']>;
		result: z.infer<Z[K]['result']>;
	};
};
