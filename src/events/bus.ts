import { JSONValue } from '../shared/json';

import { CTX } from '../ctx';

import { EventTopic } from './event';
import { EventHandler } from './handler';
import { EventSchema } from './schema';

export interface EventEmitterParams<T extends EventTopic, D extends JSONValue> {
	id?: string;
	datetime?: string;
	ctx?: { [K in keyof CTX]?: CTX[K] };
	topic: T;
	data: D;
}

export interface EventEmitter<S extends EventSchema> {
	emit<T extends keyof S & EventTopic>(params: EventEmitterParams<T, S[T]['data']>): void;
	emitSync<T extends keyof S & EventTopic>(
		params: EventEmitterParams<T, S[T]['data']>
	): Promise<void>;
}

export interface EventSubscriber<S extends EventSchema> {
	subcribe<T extends keyof S & EventTopic>(
		topic: T,
		handler: EventHandler<T, S[T]['data']>
	): Promise<void>;
	unsubscribe(id: string): Promise<boolean>;
}

export interface EventBus<S extends EventSchema> extends EventEmitter<S>, EventSubscriber<S> {}
