import { ZodSchema, z } from 'zod';

import { JSONValue } from '../../shared/json';

import { EventTopic } from './event';
import { EventHandler } from './handler';

export interface EventSchema {
	[K: EventTopic]: {
		data: JSONValue;
	};
}

export type EventHandlers<S extends EventSchema> = {
	[K in keyof S & EventTopic]: EventHandler<K, S[K]['data']>;
};

export type EventZodSchema<S extends EventSchema> = {
	[K in keyof S & EventTopic]: {
		data: ZodSchema<S[K]['data']>;
	};
};

export type ZodToEventSchema<Z extends EventZodSchema<EventSchema>> = {
	[K in keyof Z & EventTopic]: {
		data: z.infer<Z[K]['data']>;
	};
};
