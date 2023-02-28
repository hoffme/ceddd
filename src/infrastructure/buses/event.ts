import { v4 as uuidV4 } from 'uuid';

import {
	EventBus,
	EventEmitterParams,
	EventSchema,
	EventZodSchema,
	Event,
	EventTopic,
	EventHandler,
	EventLogger
} from '../../domain/events';

export class MemoryEventBus<S extends EventSchema> implements EventBus<S> {
	private readonly handlers: {
		[T in keyof S & EventTopic]?: {
			[K: string]: EventHandler<T, S[T]['data']>;
		};
	} = {};

	constructor(
		private readonly schema: EventZodSchema<S>,
		private readonly logger?: EventLogger<S>
	) {}

	public async emit<T extends keyof S & EventTopic>(params: EventEmitterParams<T, S[T]['data']>) {
		this.emitSync(params).catch(console.error);
	}

	public async emitSync<T extends keyof S & EventTopic>(
		params: EventEmitterParams<T, S[T]['data']>
	): Promise<void> {
		const id = params.id || uuidV4();

		const event: Event<T, S[T]['data']> = {
			ctx: {
				trace: [{ id }, ...(params.ctx?.trace || [])],
				http: params.ctx?.http || null,
				auth: params.ctx?.auth || null
			},
			id,
			datetime: params.datetime || new Date().toISOString(),
			topic: params.topic,
			data: params.data
		};

		this.logger?.init(event);

		const schema = this.schema[params.topic];
		if (!schema) throw new Error('event topic not found');

		const parse = schema.data.safeParse(params.data);
		if (!parse.success) {
			throw new Error(
				`invalid event data: ${parse.error.issues[0].path} => ${parse.error.issues[0].message}`
			);
		}

		const handlers = this.handlers[params.topic] || {};

		await Promise.all(
			Object.entries(handlers).map(async ([id, handler]) => {
				this.logger?.running(event, id);

				try {
					await handler.exec(event);
					this.logger?.success(event, id);
				} catch (e) {
					this.logger?.error(event, id, e);
					throw e;
				}
			})
		);

		this.logger?.finished(event);
	}

	public async subcribe<T extends keyof S & EventTopic>(
		topic: T,
		handler: EventHandler<T, S[T]['data']>
	): Promise<void> {
		const schema = this.schema[topic];
		if (!schema) throw new Error(`event topic ${topic} not found`);

		const topicHandlers = this.handlers[topic] || {};
		if (topicHandlers[handler.id])
			throw new Error(
				`subscribe handler '${handler.id}' in event topic ${topic} already exist`
			);

		this.handlers[topic] = {
			...topicHandlers,
			[handler.id]: handler
		};
	}

	public async unsubscribe(id: string): Promise<boolean> {
		let deleted = false;

		for (const handlersTopic of Object.values(this.handlers)) {
			if (!handlersTopic[id]) continue;

			deleted = true;
			delete handlersTopic[id];
		}

		return deleted;
	}
}
