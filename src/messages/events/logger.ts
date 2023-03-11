import { EventTopic, Event } from './event';
import { EventSchema } from './schema';

export interface EventLogger<S extends EventSchema> {
	init<T extends keyof S & EventTopic>(event: Event<T, S[T]['data']>): void;
	running<T extends keyof S & EventTopic>(event: Event<T, S[T]['data']>, handlerId: string): void;
	success<T extends keyof S & EventTopic>(event: Event<T, S[T]['data']>, handlerId: string): void;
	error<T extends keyof S & EventTopic>(
		event: Event<T, S[T]['data']>,
		handlerId: string,
		e: unknown
	): void;
	finished<T extends keyof S & EventTopic>(event: Event<T, S[T]['data']>): void;
}
