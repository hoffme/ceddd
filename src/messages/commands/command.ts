import { JSONValue } from '../../shared/json';

import { Context } from '../../context';

export type CommandTopic = `cmd.${string}`;

export interface Command<T extends CommandTopic, D extends JSONValue> {
	ctx: Context;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
