import { z, ZodSchema } from 'zod';

import { JSONValue } from '../shared/json';

import { Event, EventTopic } from './event';
import { EventHandler } from './handler';

export class EventDefinition<T extends EventTopic, D extends JSONValue> {
	public readonly topic: T;
	public readonly schema: {
		data: ZodSchema<D>;
	};

	constructor(props: { topic: T; schema: { data: ZodSchema<D> } }) {
		this.topic = props.topic;
		this.schema = props.schema;
	}
}

export type EventDefinitionInferHandler<D extends EventDefinition<EventTopic, JSONValue>> =
	EventHandler<D['topic'], z.infer<D['schema']['data']>>;

export type EventDefinitionInferParam<D extends EventDefinition<EventTopic, JSONValue>> = Event<
	D['topic'],
	z.infer<D['schema']['data']>
>;

export type EventDefinitionTuple = readonly EventDefinition<EventTopic, JSONValue>[];

export type EventDefinitionTupleInferSchema<D extends EventDefinitionTuple> = {
	[K in D[number]['topic']]: {
		[N in keyof D]: D[N]['topic'] extends K ? { data: z.infer<D[N]['schema']['data']> } : never;
	}[number];
};

export type EventDefinitionTupleInferZodSchema<D extends EventDefinitionTuple> = {
	[K in D[number]['topic']]: {
		[N in keyof D]: D[N]['topic'] extends K ? D[N]['schema'] : never;
	}[number];
};
