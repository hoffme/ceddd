import { JSONValue } from '../shared/json';
import { DomainErrorInferSchema, DomainErrorTuple, DomainErrorTupleToSchema } from '../error';
import { Command, CommandBus, CommandRegister, CommandTopic, EventBus } from '../messages';
import {
	CommandDefinition,
	CommandDefinitionTuple,
	CommandDefinitionTupleInferSchema,
	EventDefinitionTuple,
	EventDefinitionTupleInferSchema
} from '../definitions';

// props

interface CommandResolveMethodProps<
	TOP extends CommandTopic,
	DAT extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	cmd: Command<TOP, DAT>;
	commands: CommandBus<CommandDefinitionTupleInferSchema<CMD>>;
	events: EventBus<EventDefinitionTupleInferSchema<EVT>>;
	errors: DomainErrorInferSchema<ERR>;
	infra: INF;
}

interface CommandResolverProps<
	TOP extends CommandTopic,
	DAT extends JSONValue,
	RES extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	infrastructure: INF;
	definition: CommandDefinition<TOP, DAT, RES>;
	effects: {
		commands: CMD;
		events: EVT;
		errors: ERR;
	};
	method: (props: CommandResolveMethodProps<TOP, DAT, ERR, CMD, EVT, INF>) => Promise<RES>;
}

// resolver

export class CommandResolver<
	TOP extends CommandTopic,
	DAT extends JSONValue,
	RES extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	// properties

	public readonly definition: CommandDefinition<TOP, DAT, RES>;
	public readonly effects: {
		readonly commands: CMD;
		readonly events: EVT;
		readonly errors: ERR;
	};
	private readonly method: (
		props: CommandResolveMethodProps<TOP, DAT, ERR, CMD, EVT, INF>
	) => Promise<RES>;

	public deps?: {
		readonly commands: CommandBus<CommandDefinitionTupleInferSchema<CMD>>;
		readonly events: EventBus<EventDefinitionTupleInferSchema<EVT>>;
		readonly infra: INF;
	};

	constructor(props: CommandResolverProps<TOP, DAT, RES, ERR, CMD, EVT, INF>) {
		this.definition = props.definition;
		this.effects = props.effects;
		this.method = props.method;
	}

	// init

	public async init(
		bus: CommandRegister<CommandDefinitionTupleInferSchema<[CommandDefinition<TOP, DAT, RES>]>>
	) {
		if (!this.deps) {
			throw new Error(`resolver of ${this.definition.topic} not loaded dependences`);
		}

		const props = {
			commands: this.deps?.commands,
			events: this.deps?.events,
			infra: this.deps?.infra,
			errors: DomainErrorTupleToSchema(this.effects.errors)
		};

		await bus.register(this.definition.topic, (cmd) => this.method({ ...props, cmd }));
	}
}
