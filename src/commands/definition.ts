import { z, ZodSchema } from 'zod';

import { JSONValue } from '../shared/json';

import { Command, CommandTopic } from './command';
import { CommandHandler } from './handler';

export class CommandDefinition<T extends CommandTopic, D extends JSONValue, R extends JSONValue> {
	public readonly topic: T;
	public readonly schema: {
		data: ZodSchema<D>;
		result: ZodSchema<R>;
	};

	constructor(props: { topic: T; schema: { data: ZodSchema<D>; result: ZodSchema<R> } }) {
		this.topic = props.topic;
		this.schema = props.schema;
	}
}

export type CommandDefinitionTuple = readonly CommandDefinition<
	CommandTopic,
	JSONValue,
	JSONValue
>[];

export type CommandDefinitionInferHandler<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = CommandHandler<D['topic'], z.infer<D['schema']['data']>, z.infer<D['schema']['result']>>;

export type CommandDefinitionInferParam<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = Command<D['topic'], z.infer<D['schema']['data']>>;

export type CommandDefinitionInferResult<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = z.infer<D['schema']['result']>;

export type CommandDefinitionTupleInferZodSchema<D extends CommandDefinitionTuple> = {
	[T in D[number]['topic']]: {
		[K in keyof D]: D[K]['topic'] extends T ? D[K]['schema'] : never;
	}[number];
};

export type CommandDefinitionTupleInferSchema<D extends CommandDefinitionTuple> = {
	[T in D[number]['topic']]: {
		[K in keyof D]: D[K]['topic'] extends T
			? {
					data: z.infer<D[K]['schema']['data']>;
					result: z.infer<D[K]['schema']['result']>;
			  }
			: never;
	}[number];
};
