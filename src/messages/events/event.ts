import { JSONValue } from '../../shared/json';

import { Context } from '../../context';

export type EventTopic = `evt.${string}`;

export interface Event<T extends EventTopic, D extends JSONValue> {
	ctx: Context;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
