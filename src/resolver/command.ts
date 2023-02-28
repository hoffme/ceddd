import { DomainErrorInferMap, DomainErrorTuple } from '../error';
import {
	CommandBus,
	CommandDefinition,
	CommandDispath,
	CommandDefinitionTupleInferSchema,
	CommandRegister,
	CommandSchema,
	CommandDefinitionTuple,
	CommandTopic,
	CommandDefinitionInferResult,
	CommandDefinitionInferParam
} from '../commands';
import {
	EventBus,
	EventEmitter,
	EventDefinitionTupleInferSchema,
	EventSchema,
	EventDefinitionTuple
} from '../events';
import { JSONValue } from '../shared/json';

export class CommandResolver<
	D extends CommandDefinition<CommandTopic, JSONValue, JSONValue>,
	T extends DomainErrorTuple,
	C extends CommandDefinitionTuple,
	E extends EventDefinitionTuple,
	ID,
	IR
> {
	public static buses: {
		command: CommandBus<CommandSchema>;
		event: EventBus<EventSchema>;
	};

	private infrastructure?: IR;
	private readonly errors: DomainErrorInferMap<T>;

	constructor(
		private readonly props: {
			definition: D;
			dependences: {
				commands: C;
				events: E;
				infra: (params: ID) => Promise<IR>;
			};
			errors: T;
			method: (props: {
				cmd: CommandDefinitionInferParam<D>;
				commands: CommandDispath<CommandDefinitionTupleInferSchema<C>>;
				events: EventEmitter<EventDefinitionTupleInferSchema<E>>;
				infra: IR;
				errors: DomainErrorInferMap<T>;
			}) => Promise<CommandDefinitionInferResult<D>>;
		}
	) {
		this.errors = Object.fromEntries(
			props.errors.map((err) => [err.code, err])
		) as DomainErrorInferMap<T>;
	}

	public async setup(dependences: ID): Promise<void> {
		this.infrastructure = await this.props.dependences.infra(dependences);
	}

	public async initialize(
		register: CommandRegister<CommandDefinitionTupleInferSchema<[D]>>
	): Promise<void> {
		if (!this.infrastructure) {
			throw new Error(`infrastructure of ${this.props.definition.topic} is undefined`);
		}

		const data = {
			commands: CommandResolver.buses.command,
			events: CommandResolver.buses.event,
			infra: this.infrastructure,
			errors: this.errors
		};

		await register.register(this.props.definition.topic, async (cmd) => {
			return await this.props.method({ ...data, cmd });
		});
	}
}
