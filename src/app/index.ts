import { CommandBus, CommandZodSchema, EventBus, EventZodSchema, JoinSchemas } from '../messages';
import { ModuleInferCommandSchema, ModuleInferEventSchema, ModuleTuple } from '../module';

// App

export class App<M extends ModuleTuple> {
	public readonly modules: M;

	constructor(props: { modules: M }) {
		this.modules = props.modules;
	}

	public get schemas() {
		const commands = Object.fromEntries(
			this.modules.flatMap((module) => Object.entries(module.schemas.commands))
		) as CommandZodSchema<InferCommandSchema<M>>;

		const events = Object.fromEntries(
			this.modules.flatMap((module) => Object.entries(module.schemas.events))
		) as EventZodSchema<InferEventSchema<M>>;

		return { commands, events };
	}

	public async init(props: {
		commands: CommandBus<InferCommandSchema<M>>;
		events: EventBus<InferEventSchema<M>>;
	}) {
		for (const module of this.modules) {
			await module.init(props);
		}
	}
}

// Infers

type InferCommandSchema<M extends ModuleTuple> = JoinSchemas<{
	[K in keyof M]: ModuleInferCommandSchema<M[K]>;
}>;

type InferEventSchema<M extends ModuleTuple> = JoinSchemas<{
	[K in keyof M]: ModuleInferEventSchema<M[K]>;
}>;

export type AppInferCommandSchema<A extends App<ModuleTuple>> = InferCommandSchema<A['modules']>;

export type AppInferEventSchema<A extends App<ModuleTuple>> = InferEventSchema<A['modules']>;

export type AppInferCommandZodSchema<A extends App<ModuleTuple>> = CommandZodSchema<
	InferCommandSchema<A['modules']>
>;

export type AppInferEventZodSchema<A extends App<ModuleTuple>> = EventZodSchema<
	InferEventSchema<A['modules']>
>;
