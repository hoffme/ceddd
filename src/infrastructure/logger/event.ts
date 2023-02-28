import { Event, EventLogger, EventSchema, EventTopic } from '../../events';

import { log } from './log';

export class CLILoggerEvent implements EventLogger<EventSchema> {
	public init<T extends EventTopic>(evt: Event<T, EventSchema[T]['data']>): void {
		log(
			['Gray', new Date().toISOString()],
			['Cyan', 'EVT INI'],
			['Yellow', evt.topic],
			['Gray', evt.id]
		);
	}

	public running<T extends EventTopic>(
		evt: Event<T, EventSchema[T]['data']>,
		handlerId: string
	): void {
		log(
			['Gray', new Date().toISOString()],
			['Cyan', 'EVT RUN'],
			['Yellow', evt.topic],
			['Gray', evt.id],
			['Gray', handlerId]
		);
	}

	public success<T extends EventTopic>(
		evt: Event<T, EventSchema[T]['data']>,
		handlerId: string
	): void {
		const duration = new Date().getTime() - new Date(evt.datetime).getTime();
		log(
			['Gray', new Date().toISOString()],
			['Green', 'EVT SUC'],
			['Yellow', evt.topic],
			['Gray', evt.id],
			['Gray', handlerId],
			['Gray', `${evt.id} ${duration}ms`]
		);
	}

	public error<T extends EventTopic>(
		evt: Event<T, EventSchema[T]['data']>,
		handlerId: string,
		e: unknown
	): void {
		const duration = new Date().getTime() - new Date(evt.datetime).getTime();
		log(
			['Gray', new Date().toISOString()],
			['Red', 'EVT ERR'],
			['Yellow', evt.topic],
			['Gray', evt.id],
			['Gray', handlerId],
			['Gray', `${evt.id} ${duration}ms`]
		);
		console.error(e);
	}

	public finished<T extends EventTopic>(evt: Event<T, EventSchema[T]['data']>): void {
		const duration = new Date().getTime() - new Date(evt.datetime).getTime();
		log(
			['Gray', new Date().toISOString()],
			['Cyan', 'EVT FIN'],
			['Yellow', evt.topic],
			['Gray', evt.id],
			['Gray', `${evt.id} ${duration}ms`]
		);
	}
}
