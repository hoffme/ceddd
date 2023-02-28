import {
	CommandBus,
	CommandDefinitionTuple,
	CommandDefinitionTupleInferSchema,
	CommandDefinitionTupleInferZodSchema
} from '../commands';
import {
	EventBus,
	EventDefinitionTuple,
	EventDefinitionTupleInferSchema,
	EventDefinitionTupleInferZodSchema
} from '../events';
import { CommandResolver, EventResolver } from '../resolver';

import { AppCommandResolverTuple, AppEventResolverTuple } from './types';

export class App<
	CD extends CommandDefinitionTuple,
	ED extends EventDefinitionTuple,
	CR extends AppCommandResolverTuple<CD, IN>,
	ER extends AppEventResolverTuple<ED, IN>,
	IN
> {
	public readonly definitions: {
		commands: CD;
		events: ED;
	};
	public readonly resolvers: {
		commands: CR;
		events: ER;
	};
	public readonly schemas: {
		commands: CommandDefinitionTupleInferZodSchema<CD>;
		events: EventDefinitionTupleInferZodSchema<ED>;
	};
	private readonly infrastructure: () => Promise<IN>;

	constructor(props: {
		definitions: {
			commands: CD;
			events: ED;
		};
		resolvers: {
			commands: CR;
			events: ER;
		};
		infrastructure: () => Promise<IN>;
	}) {
		this.definitions = props.definitions;
		this.resolvers = props.resolvers;
		this.infrastructure = props.infrastructure;

		this.schemas = {
			commands: Object.fromEntries(
				Object.values(props.definitions.commands).map((def) => {
					return [def.topic, def.schema];
				})
			) as CommandDefinitionTupleInferZodSchema<CD>,
			events: Object.fromEntries(
				Object.values(props.definitions.events).map((def) => {
					return [def.topic, def.schema];
				})
			) as EventDefinitionTupleInferZodSchema<ED>
		};
	}

	public async setup(): Promise<void> {
		const infra = await this.infrastructure();

		for (const resolver of this.resolvers.commands) {
			await resolver.setup(infra);
		}

		for (const resolver of this.resolvers.events) {
			await resolver.setup(infra);
		}
	}

	public async initialize(buses: {
		command: CommandBus<CommandDefinitionTupleInferSchema<CD>>;
		event: EventBus<EventDefinitionTupleInferSchema<ED>>;
	}): Promise<void> {
		CommandResolver.buses = buses;
		EventResolver.buses = buses;

		for (const resolver of this.resolvers.commands) {
			await resolver.initialize(buses.command);
		}

		for (const resolver of this.resolvers.events) {
			await resolver.intialize(buses.event);
		}
	}
}
