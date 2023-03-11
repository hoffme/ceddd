import { JSONValue } from '../../shared/json';

import { Event, EventTopic } from './event';

export type EventHandler<T extends EventTopic, D extends JSONValue> = {
	id: string;
	name: string;
	exec: (evt: Event<T, D>) => Promise<void>;
};
