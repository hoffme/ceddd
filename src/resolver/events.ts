import { v4 as uuidV4 } from 'uuid';
import { JSONValue } from '../shared/json';
import { DomainErrorInferSchema, DomainErrorTuple, DomainErrorTupleToSchema } from '../error';
import { Event, CommandBus, EventBus, EventTopic, EventSubscriber } from '../messages';
import {
	CommandDefinitionTuple,
	CommandDefinitionTupleInferSchema,
	EventDefinition,
	EventDefinitionTuple,
	EventDefinitionTupleInferSchema
} from '../definitions';

// props

interface EventResolveMethodProps<
	TOP extends EventTopic,
	DAT extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	evt: Event<TOP, DAT>;
	commands: CommandBus<CommandDefinitionTupleInferSchema<CMD>>;
	events: EventBus<EventDefinitionTupleInferSchema<EVT>>;
	errors: DomainErrorInferSchema<ERR>;
	infra: INF;
}

interface EventResolverProps<
	NAM extends string,
	TOP extends EventTopic,
	DAT extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	name: NAM;
	infrastructure: INF;
	definition: EventDefinition<TOP, DAT>;
	effects: {
		commands: CMD;
		events: EVT;
		errors: ERR;
	};
	method: (props: EventResolveMethodProps<TOP, DAT, ERR, CMD, EVT, INF>) => Promise<void>;
}

// resolver

export class EventResolver<
	NAM extends string,
	TOP extends EventTopic,
	DAT extends JSONValue,
	ERR extends DomainErrorTuple,
	CMD extends CommandDefinitionTuple,
	EVT extends EventDefinitionTuple,
	INF
> {
	// properties

	public readonly id: string;
	public readonly name: NAM;
	public readonly definition: EventDefinition<TOP, DAT>;
	public readonly effects: {
		readonly commands: CMD;
		readonly events: EVT;
		readonly errors: ERR;
	};
	private readonly method: (
		props: EventResolveMethodProps<TOP, DAT, ERR, CMD, EVT, INF>
	) => Promise<void>;

	public deps?: {
		readonly commands: CommandBus<CommandDefinitionTupleInferSchema<CMD>>;
		readonly events: EventBus<EventDefinitionTupleInferSchema<EVT>>;
		readonly infra: INF;
	};

	constructor(props: EventResolverProps<NAM, TOP, DAT, ERR, CMD, EVT, INF>) {
		this.id = uuidV4();
		this.name = props.name;
		this.definition = props.definition;
		this.effects = props.effects;
		this.method = props.method;
	}

	// init

	public async init(
		bus: EventSubscriber<EventDefinitionTupleInferSchema<readonly [EventDefinition<TOP, DAT>]>>
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

		await bus.subscribe(this.definition.topic, {
			id: this.id,
			name: this.name,
			exec: (evt) => this.method({ ...props, evt })
		});
	}
}
