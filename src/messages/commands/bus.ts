import { JSONValue } from '../../shared/json';

import { Context } from '../../context';

import { CommandTopic } from './command';
import { CommandSchema, CommandZodSchema } from './schema';
import { CommandHandler } from './handler';

export interface CommandDispathParams<T extends CommandTopic, D extends JSONValue> {
	id?: string;
	datetime?: string;
	ctx?: { [K in keyof Context]?: Context[K] };
	topic: T;
	data: D;
}

export interface CommandDispath<S extends CommandSchema> {
	dispath<T extends keyof S & CommandTopic>(
		params: CommandDispathParams<T, S[T]['data']>
	): Promise<S[T]['result']>;
}

export interface CommandRegister<S extends CommandSchema> {
	register<T extends keyof S & CommandTopic>(
		topic: T,
		handler: CommandHandler<T, S[T]['data'], S[T]['result']>
	): Promise<void>;
	unregister<V extends { [K in keyof S]?: S[K] }>(
		topics: (keyof V & CommandTopic)[]
	): Promise<void>;
}

export interface CommandBus<S extends CommandSchema> extends CommandDispath<S>, CommandRegister<S> {
	schema: CommandZodSchema<S>;
}
