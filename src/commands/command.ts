import { JSONValue } from '../shared/json';

import { CTX } from '../ctx';

export type CommandTopic = `cmd.${string}`;

export interface Command<T extends CommandTopic, D extends JSONValue> {
	ctx: CTX;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
