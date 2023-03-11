import { v4 as uuidV4 } from 'uuid';

import {
	CommandHandlers,
	CommandSchema,
	CommandZodSchema,
	CommandBus,
	CommandDispathParams,
	Command,
	CommandTopic,
	CommandHandler,
	CommandLogger
} from '../../messages/commands';

export class MemoryCommandBus<S extends CommandSchema> implements CommandBus<S> {
	private handlers: { [K in keyof CommandHandlers<S>]?: CommandHandlers<S>[K] } = {};

	constructor(
		public readonly schema: CommandZodSchema<S>,
		private readonly logger?: CommandLogger<S>
	) {}

	public async dispath<T extends keyof S & CommandTopic>(
		params: CommandDispathParams<T, S[T]['data']>
	): Promise<S[T]['result']> {
		const id = params.id || uuidV4();

		const cmd: Command<T, S[T]['data']> = {
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

		this.logger?.init(cmd);

		const schema = this.schema[params.topic];
		if (!schema) {
			const error = new Error('command not found');
			this.logger?.error(cmd, error);
			throw error;
		}

		const parse = schema.data.safeParse(params.data);
		if (!parse.success) {
			const error = new Error(
				`invalid command data: ${parse.error.issues[0].path} => ${parse.error.issues[0].message}`
			);
			this.logger?.error(cmd, error);
			throw error;
		}

		const handler = this.handlers[params.topic];
		if (!handler) {
			const error = new Error(`internal error`);
			this.logger?.error(cmd, error);
			throw error;
		}

		try {
			const result = await handler(cmd);
			this.logger?.success(cmd, result);
			return result;
		} catch (e) {
			this.logger?.error(cmd, e);
			throw e;
		}
	}

	public async register<T extends keyof S & CommandTopic>(
		topic: T,
		handler: CommandHandler<T, S[T]['data'], S[T]['result']>
	): Promise<void> {
		this.handlers[topic] = handler;
	}

	public async unregister<V extends S>(topics: (keyof V & CommandTopic)[]): Promise<void> {
		for (const topic of topics) {
			delete this.handlers[topic];
		}
	}
}
