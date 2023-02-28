import { App, AppInferCommandSchema, AppInferEventSchema } from 'ceddd/app';
import {
	MemoryCommandBus,
	MemoryEventBus,
	CLILoggerCommand,
	CLILoggerEvent
} from 'ceddd/infrastructure';

import { Auth } from './auth';

import { setupInfrastructure } from './infrastructure';
import { runServer } from './server';

const main = async () => {
	const app = new App({
		infrastructure: setupInfrastructure,
		definitions: {
			commands: [...Auth.definitions.commands] as const,
			events: [...Auth.definitions.events] as const
		},
		resolvers: {
			commands: [...Auth.resolvers.commands] as const,
			events: [...Auth.resolvers.events] as const
		}
	});

	await app.setup();

	const command = new MemoryCommandBus<AppInferCommandSchema<typeof app>>(
		app.schemas.commands,
		new CLILoggerCommand()
	);

	const event = new MemoryEventBus<AppInferEventSchema<typeof app>>(
		app.schemas.events,
		new CLILoggerEvent()
	);

	await app.initialize({ command, event });

	runServer<AppInferCommandSchema<typeof app>>(command);
};

main().catch(console.error);
