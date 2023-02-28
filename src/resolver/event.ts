import { v4 as uuidV4 } from 'uuid';

import { DomainErrorInferMap, DomainErrorTuple } from '../error';
import {
	CommandBus,
	CommandDispath,
	CommandDefinitionTupleInferSchema,
	CommandSchema,
	CommandDefinitionTuple
} from '../commands';
import {
	EventBus,
	EventDefinition,
	EventEmitter,
	EventDefinitionTupleInferSchema,
	EventDefinitionInferParam,
	EventSchema,
	EventSubscriber,
	EventDefinitionTuple,
	EventTopic
} from '../events';
import { JSONValue } from '../shared/json';

export class EventResolver<
	D extends EventDefinition<EventTopic, JSONValue>,
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

	private readonly id: string;
	private infrastructure?: IR;
	private readonly errors: DomainErrorInferMap<T>;

	constructor(
		private readonly props: {
			name: string;
			definition: D;
			dependences: {
				commands: C;
				events: E;
				infra: (deps: ID) => Promise<IR>;
			};
			errors: T;
			method: (props: {
				evt: EventDefinitionInferParam<D>;
				commands: CommandDispath<CommandDefinitionTupleInferSchema<C>>;
				events: EventEmitter<EventDefinitionTupleInferSchema<E>>;
				infra: IR;
				errors: DomainErrorInferMap<T>;
			}) => Promise<void>;
		}
	) {
		this.id = uuidV4();
		this.errors = Object.fromEntries(
			props.errors.map((err) => [err.code, err])
		) as DomainErrorInferMap<T>;
	}

	public async setup(dependences: ID): Promise<void> {
		this.infrastructure = await this.props.dependences.infra(dependences);
	}

	public async intialize(
		subscriber: EventSubscriber<EventDefinitionTupleInferSchema<[D]>>
	): Promise<void> {
		if (!this.infrastructure) {
			throw new Error(`infrastructure of ${this.props.definition.topic} is undefined`);
		}

		const data = {
			commands: EventResolver.buses.command,
			events: EventResolver.buses.event,
			infra: this.infrastructure,
			errors: this.errors
		};

		await subscriber.subcribe(this.props.definition.topic, {
			id: this.id,
			name: this.props.name,
			exec: async (evt) => {
				await this.props.method({ ...data, evt });
			}
		});
	}
}
