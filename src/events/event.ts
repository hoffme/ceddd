import { JSONValue } from '../shared/json';

import { CTX } from '../ctx';

export type EventTopic = `evt.${string}`;

export interface Event<T extends EventTopic, D extends JSONValue> {
	ctx: CTX;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
