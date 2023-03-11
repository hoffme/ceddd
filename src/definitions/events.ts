import { z, ZodSchema } from 'zod';

import { JSONValue } from '../shared/json';

import { Event, EventTopic, EventHandler } from '../messages/events';

// Defintion

export class EventDefinition<T extends EventTopic, D extends JSONValue> {
	public readonly topic: T;
	public readonly data: ZodSchema<D>;

	constructor(props: { topic: T; data: ZodSchema<D> }) {
		this.topic = props.topic;
		this.data = props.data;
	}
}

// Infers

export type EventDefinitionInferTopic<D extends EventDefinition<EventTopic, JSONValue>> =
	D['topic'];

export type EventDefinitionInferData<D extends EventDefinition<EventTopic, JSONValue>> = z.infer<
	D['data']
>;

export type EventDefinitionInferEvent<D extends EventDefinition<EventTopic, JSONValue>> = Event<
	D['topic'],
	z.infer<D['data']>
>;

export type EventDefinitionInferHandler<D extends EventDefinition<EventTopic, JSONValue>> =
	EventHandler<D['topic'], z.infer<D['data']>>;

// Tuple Constructions

export type EventDefinitionTuple = readonly EventDefinition<EventTopic, JSONValue>[];

export type EventDefinitionTupleInferSchema<D extends EventDefinitionTuple> = {
	[K in D[number]['topic']]: {
		[N in keyof D]: D[N]['topic'] extends K ? { data: z.infer<D[N]['data']> } : never;
	}[number];
};

export type EventDefinitionTupleInferZodSchema<D extends EventDefinitionTuple> = {
	[K in D[number]['topic']]: {
		[N in keyof D]: D[N]['topic'] extends K ? { data: D[N]['data'] } : never;
	}[number];
};

// Transformers

export const EventDefinitionTupleToZodSchema = <T extends EventDefinitionTuple>(
	tuple: T
): EventDefinitionTupleInferZodSchema<T> => {
	return Object.fromEntries(
		tuple.map((definition) => [definition.topic, { data: definition.data }])
	) as EventDefinitionTupleInferZodSchema<T>;
};
