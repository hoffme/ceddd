import { CommandBus, CommandZodSchema, EventBus, EventZodSchema } from '../messages';
import { ModuleInferCommandSchema, ModuleInferEventSchema, ModuleTuple } from '../module';

// Types

type SetupResult<M extends ModuleTuple> = {
	[K in M[number]['name']]: {
		[N in keyof M]: K extends M[N]['name'] ? Parameters<M[N]['init']>[0]['infra'] : never;
	}[number];
};

// App

export class App<M extends ModuleTuple> {
	public readonly modules: M;
	public readonly schemas: {
		commands: CommandZodSchema<InferCommandSchema<M>>;
		events: EventZodSchema<InferEventSchema<M>>;
	};

	private readonly setup: () => Promise<SetupResult<M>>;

	constructor(props: { modules: M; setup: () => Promise<SetupResult<M>> }) {
		this.modules = props.modules;
		this.setup = props.setup;

		this.schemas = {
			commands: Object.fromEntries(
				this.modules.flatMap((module) => Object.entries(module.schemas.commands))
			) as CommandZodSchema<InferCommandSchema<M>>,
			events: Object.fromEntries(
				this.modules.flatMap((module) => Object.entries(module.schemas.events))
			) as EventZodSchema<InferEventSchema<M>>
		};
	}

	public async init(props: {
		commands: CommandBus<InferCommandSchema<M>>;
		events: EventBus<InferEventSchema<M>>;
	}) {
		const infra = await this.setup();

		for (const module of this.modules) {
			const infraModule = infra[module.name as keyof SetupResult<M>];

			await module.init({
				infra: infraModule,
				commands: props.commands,
				events: props.events
			});
		}
	}
}

// Infers

type InferCommandSchema<M extends ModuleTuple> = {
	[K in keyof ModuleInferCommandSchema<M[number]>]: {
		[N in keyof M]: K extends keyof ModuleInferCommandSchema<M[N]>
			? ModuleInferCommandSchema<M[N]>[K]
			: never;
	}[number];
};

type InferEventSchema<M extends ModuleTuple> = {
	[K in keyof ModuleInferEventSchema<M[number]>]: {
		[N in keyof M]: K extends keyof ModuleInferEventSchema<M[N]>
			? ModuleInferEventSchema<M[N]>[K]
			: never;
	}[number];
};

export type AppInferCommandSchema<A extends App<ModuleTuple>> = InferCommandSchema<A['modules']>;

export type AppInferEventSchema<A extends App<ModuleTuple>> = InferEventSchema<A['modules']>;

export type AppInferCommandZodSchema<A extends App<ModuleTuple>> = CommandZodSchema<
	InferCommandSchema<A['modules']>
>;

export type AppInferEventZodSchema<A extends App<ModuleTuple>> = EventZodSchema<
	InferEventSchema<A['modules']>
>;
