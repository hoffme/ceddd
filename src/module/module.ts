import {
	CommandDefinitionTuple,
	CommandDefinitionTupleInferSchema,
	EventDefinitionTuple,
	EventDefinitionTupleInferSchema
} from '../definitions';
import { CommandBus, CommandZodSchema, EventBus, EventZodSchema, JoinSchemas } from '../messages';
import { CommandResolver, EventResolver } from '../resolver';

// types

type CommandResolverTuple = readonly CommandResolver<any, any, any, any, any, any, any>[];

type EventResolverTuple = readonly EventResolver<any, any, any, any, any, any>[];

// Props

type SetupParams<CRT extends CommandResolverTuple, ERT extends EventResolverTuple> = {
	commands: { [K in keyof CRT]: CRT[K]['definition']['topic'] };
	events: { [K in keyof ERT]: ERT[K]['definition']['topic'] };
};

type SetupResult<CRT extends CommandResolverTuple, ERT extends EventResolverTuple> = {
	commands: {
		[K in CRT[number]['definition']['topic']]: {
			[N in keyof CRT]: CRT[N]['definition']['topic'] extends K
				? Exclude<CRT[N]['deps'], undefined>['infra']
				: never;
		}[number];
	};
	events: {
		[K in ERT[number]['definition']['topic']]: {
			[N in keyof ERT]: ERT[N]['definition']['topic'] extends K
				? Exclude<ERT[N]['deps'], undefined>['infra']
				: never;
		}[number];
	};
};

interface ModuleProps<CRT extends CommandResolverTuple, ERT extends EventResolverTuple> {
	setup: (params: SetupParams<CRT, ERT>) => Promise<SetupResult<CRT, ERT>>;
	resolvers: {
		commands: CRT;
		events: ERT;
	};
}

// Tuple

export type ModuleTuple = readonly Module<CommandResolverTuple, EventResolverTuple>[];

// Module

export class Module<CRT extends CommandResolverTuple, ERT extends EventResolverTuple> {
	public readonly resolvers: {
		readonly commands: CRT;
		readonly events: ERT;
	};
	public readonly schemas: {
		commands: CommandZodSchema<InferCommandSchema<CRT, ERT>>;
		events: EventZodSchema<InferEventSchema<CRT, ERT>>;
	};
	protected readonly setup: (params: SetupParams<CRT, ERT>) => Promise<SetupResult<CRT, ERT>>;

	constructor(props: ModuleProps<CRT, ERT>) {
		this.resolvers = props.resolvers;
		this.setup = props.setup;

		this.schemas = {
			commands: Object.fromEntries(
				[
					...this.resolvers.commands.map((resolver) => resolver.definition),
					...this.resolvers.commands.flatMap((resolver) => resolver.effects.commands),
					...this.resolvers.events.flatMap((resolver) => resolver.effects.commands)
				].map((definition) => [
					definition.topic,
					{ data: definition.data, result: definition.result }
				])
			) as CommandZodSchema<InferCommandSchema<CRT, ERT>>,
			events: Object.fromEntries(
				[
					...this.resolvers.events.map((resolver) => resolver.definition),
					...this.resolvers.events.flatMap((resolver) => resolver.effects.events),
					...this.resolvers.events.flatMap((resolver) => resolver.effects.events)
				].map((definition) => [definition.topic, { data: definition.data }])
			) as EventZodSchema<InferEventSchema<CRT, ERT>>
		};
	}

	public async init(props: {
		commands: CommandBus<InferCommandSchema<CRT, ERT>>;
		events: EventBus<InferEventSchema<CRT, ERT>>;
	}): Promise<void> {
		const resolverTopics = {
			commands: this.resolvers.commands.map((resolver) => resolver.definition.topic),
			events: this.resolvers.events.map((resolver) => resolver.definition.topic)
		} as SetupParams<CRT, ERT>;

		const infrastructure = await this.setup(resolverTopics);

		for (const resolver of this.resolvers.commands) {
			const infra = infrastructure[resolver.definition.topic as keyof typeof infrastructure];

			resolver.deps = {
				infra: infra,
				commands: props.commands,
				events: props.events
			};

			await resolver.init(props.commands);
		}

		for (const resolver of this.resolvers.events) {
			const infra = infrastructure[resolver.definition.topic as keyof typeof infrastructure];

			resolver.deps = {
				infra: infra,
				commands: props.commands,
				events: props.events
			};

			await resolver.init(props.events);
		}
	}
}

// Infers

type InferCommandSchema<
	CRT extends CommandResolverTuple,
	ERT extends EventResolverTuple,
	CS1 = CommandDefinitionTupleInferSchema<{ [K in keyof CRT]: CRT[K]['definition'] }>,
	CS2 = CRT[number]['effects']['commands'] extends CommandDefinitionTuple
		? CRT[number]['effects']['commands'] extends never
			? object
			: JoinSchemas<{
					[K in keyof CRT]: CommandDefinitionTupleInferSchema<
						CRT[K]['effects']['commands']
					>;
			  }>
		: object,
	CS3 = ERT[number]['effects']['commands'] extends CommandDefinitionTuple
		? ERT[number]['effects']['commands'] extends never
			? object
			: JoinSchemas<{
					[K in keyof ERT]: CommandDefinitionTupleInferSchema<
						ERT[K]['effects']['commands']
					>;
			  }>
		: object
> = {
	[K in keyof CS1 | keyof CS2 | keyof CS3]: K extends keyof CS1
		? CS1[K]
		: K extends keyof CS2
		? CS2[K]
		: K extends keyof CS3
		? CS3[K]
		: never;
};

type InferEventSchema<
	CRT extends CommandResolverTuple,
	ERT extends EventResolverTuple,
	CS1 = EventDefinitionTupleInferSchema<{ [K in keyof ERT]: ERT[K]['definition'] }>,
	CS2 = ERT[number]['effects']['events'] extends EventDefinitionTuple
		? ERT[number]['effects']['events'] extends never
			? object
			: JoinSchemas<{
					[K in keyof ERT]: EventDefinitionTupleInferSchema<ERT[K]['effects']['events']>;
			  }>
		: object,
	CS3 = CRT[number]['effects']['events'] extends EventDefinitionTuple
		? CRT[number]['effects']['events'] extends never
			? object
			: JoinSchemas<{
					[K in keyof CRT]: EventDefinitionTupleInferSchema<CRT[K]['effects']['events']>;
			  }>
		: object
> = {
	[K in keyof CS1 | keyof CS2 | keyof CS3]: K extends keyof CS1
		? CS1[K]
		: K extends keyof CS2
		? CS2[K]
		: K extends keyof CS3
		? CS3[K]
		: never;
};

export type ModuleInferCommandSchema<M extends Module<CommandResolverTuple, EventResolverTuple>> =
	InferCommandSchema<M['resolvers']['commands'], M['resolvers']['events']>;

export type ModuleInferEventSchema<M extends Module<CommandResolverTuple, EventResolverTuple>> =
	InferEventSchema<M['resolvers']['commands'], M['resolvers']['events']>;

export type ModuleInferCommandZodSchema<
	M extends Module<CommandResolverTuple, EventResolverTuple>
> = CommandZodSchema<ModuleInferCommandSchema<M>>;

export type ModuleInferEventZodSchema<M extends Module<CommandResolverTuple, EventResolverTuple>> =
	EventZodSchema<ModuleInferEventSchema<M>>;
