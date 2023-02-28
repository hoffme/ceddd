import { CommandDefinitionTuple, CommandDefinitionTupleInferSchema } from '../commands';
import { DomainErrorTuple } from '../error';
import { EventDefinitionTuple, EventDefinitionTupleInferSchema } from '../events';
import { CommandResolver, EventResolver } from '../resolver';

import { App } from './app';

export type AppCommandResolverTuple<D extends CommandDefinitionTuple, ID> = {
	[K in keyof D]: CommandResolver<
		D[K],
		DomainErrorTuple,
		CommandDefinitionTuple,
		EventDefinitionTuple,
		ID,
		any
	>;
};

export type AppEventResolverTuple<D extends EventDefinitionTuple, ID> = readonly {
	[K in keyof D]: EventResolver<
		D[K],
		DomainErrorTuple,
		CommandDefinitionTuple,
		EventDefinitionTuple,
		ID,
		any
	>;
}[keyof D][];

export type AppInferCommandSchema<
	A extends App<CD, ED, CR, ER, I>,
	CD extends CommandDefinitionTuple = A['definitions']['commands'],
	ED extends EventDefinitionTuple = A['definitions']['events'],
	CR extends AppCommandResolverTuple<CD, I> = A['resolvers']['commands'],
	ER extends AppEventResolverTuple<ED, I> = A['resolvers']['events'],
	I = any
> = CommandDefinitionTupleInferSchema<CD>;

export type AppInferEventSchema<
	A extends App<CD, ED, CR, ER, I>,
	CD extends CommandDefinitionTuple = A['definitions']['commands'],
	ED extends EventDefinitionTuple = A['definitions']['events'],
	CR extends AppCommandResolverTuple<CD, I> = A['resolvers']['commands'],
	ER extends AppEventResolverTuple<ED, I> = A['resolvers']['events'],
	I = any
> = EventDefinitionTupleInferSchema<ED>;
