import { z, ZodSchema } from 'zod';

import { JSONValue } from '../shared/json';

import { Command, CommandTopic, CommandHandler } from '../messages/commands';

// Defintion

export class CommandDefinition<T extends CommandTopic, D extends JSONValue, R extends JSONValue> {
	public readonly topic: T;
	public readonly data: ZodSchema<D>;
	public readonly result: ZodSchema<R>;

	constructor(props: { topic: T; data: ZodSchema<D>; result: ZodSchema<R> }) {
		this.topic = props.topic;
		this.data = props.data;
		this.result = props.result;
	}
}

// Infers

export type CommandDefinitionInferTopic<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = D['topic'];

export type CommandDefinitionInferData<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = z.infer<D['data']>;

export type CommandDefinitionInferResult<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = z.infer<D['result']>;

export type CommandDefinitionInferCommand<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = Command<D['topic'], z.infer<D['data']>>;

export type CommandDefinitionInferHandler<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>
> = CommandHandler<D['topic'], z.infer<D['data']>, z.infer<D['result']>>;

// Tuple Constructions

export type CommandDefinitionTuple = readonly CommandDefinition<
	CommandTopic,
	JSONValue,
	JSONValue
>[];

export type CommandDefinitionTupleInferSchema<D extends CommandDefinitionTuple> = {
	[T in CommandDefinitionInferTopic<D[number]>]: {
		[K in keyof D]: CommandDefinitionInferTopic<D[K]> extends T
			? {
					data: CommandDefinitionInferData<D[K]>;
					result: CommandDefinitionInferResult<D[K]>;
			  }
			: never;
	}[number];
};

export type CommandDefinitionTupleInferZodSchema<D extends CommandDefinitionTuple> = {
	[T in CommandDefinitionInferTopic<D[number]>]: {
		[K in keyof D]: CommandDefinitionInferTopic<D[K]> extends T
			? {
					data: D[K]['data'];
					result: D[K]['result'];
			  }
			: never;
	}[number];
};

// Transformers

export const CommandDefinitionTupleToZodSchema = <T extends CommandDefinitionTuple>(
	tuple: T
): CommandDefinitionTupleInferZodSchema<T> => {
	return Object.fromEntries(
		tuple.map((definition) => [
			definition.topic,
			{ data: definition.data, result: definition.result }
		])
	) as CommandDefinitionTupleInferZodSchema<T>;
};
