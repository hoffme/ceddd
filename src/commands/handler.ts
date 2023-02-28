import { JSONValue } from '../shared/json';

import { Command, CommandTopic } from './command';

export type CommandHandler<T extends CommandTopic, D extends JSONValue, R extends JSONValue> = (
	cmd: Command<T, D>
) => Promise<R>;
