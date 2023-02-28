# CEDDD

Framework to structure a proyect with DDD, testing, types end to end, verification params.

## Entities

### Command/Event

It is a DTO that contains
- **topic** a type of action to be performed
- **id** a unique identifier
- **datetime** creation datetime in utc
- **context** is as authentication, traced of the route, information of the agent who performs the request or IP, etc.
- **data** information necessary to carry out the topic action.

``` typescript
interface CTX extends JSONObject {
	trace: { id: string }[];
	http: null | {
		ip: string;
		userAgent: string;
	};
	auth: null | {
		token: string;
	};
}

type CommandTopic = `cmd.${string}`;

interface Command<T extends CommandTopic, D extends JSONValue> {
	ctx: CTX;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
```

### Command/Event Definition

Define the relationship of a topic with the data and the result that returns the resolution of that command/event. Data and the result is used Zod for type validation.

``` typescript
const SignInCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.signIn',
	schema: {
		data: z.object({
			username: z.string(),
			password: z.string()
		}),
		result: z.object({
			token: z.string(),
			expiredAt: z.string()
		})
	}
});
```

### Command/Event Resolver

It is the implementation of a function that resolves a command/event definition, defining the units you need (other commands/events that it emits and infrastructure as repository to databases, external services, etc.) and the errors you can throw.

```ts
export const SignInCommandResolver = new CommandResolver({
	definition: SignInCommandDefinition,
	errors: [
		new DomainError('email.incorrect', 'correo incorrecto'),
		new DomainError('password.incorrect', 'contraseña incorrecta')
	] as const,
	dependences: {
		commands: [
            		// Array of command defintions to dispath in method
        	] as const,
		events: [
            		// Array of events defintions to emit in method 
        	] as const,
		infra: async () => {
            		// Setup infrastructure of resolver
            		return {}
        	}
	},
	method: async ({ cmd, infra, commands, events, errors }) => {
        	// implement
	}
});
```

## Setup

in file index.ts start a main funcion of applicacion with express example.

```ts
// index.ts

const main = async () => {
	const app = new App({
		infrastructure: async () => {
			// Setup infrastructure of applications, 
			// the return value is passing of all resolvers
		},
		definitions: {
			commands: [SignInCommandDefinition] as const,
			events: [SignInEventDefinition] as const
		},
		resolvers: {
			commands: [SignInCommandResolver] as const,
			events: [
				SignInSendNotificacionByEmail, 
				SignInSendNotificacionBySMS
			] as const
		}
	});

	await app.setup();

	const command = new MemoryCommandBus<AppInferCommandSchema<typeof app>>(app.schemas.commands);
	const event = new MemoryEventBus<AppInferEventSchema<typeof app>>(app.schemas.events);

	await app.initialize({ command, event });

	// you can dispath commands in command
	// EJ: with express

	const app = express();

	app.use(urlencoded({ extended: false }));
	app.use(json());

	app.post('/api/cmd', (req, res) => {
		const command = req.body;

		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		const userAgent = req.headers['user-agent'];

		command
			.dispath({
				ctx: {
					trace: [],
					http: {
						ip: ip?.toString() || '',
						userAgent: userAgent?.toString() || ''
					},
					auth: command.ctx?.auth || null
				},
				topic: command.topic,
				data: command.data
			})
			.then((result) => res.status(200).json(result))
			.catch((error) => {
				res.status(400).json({
					error: {
						code: error?.code || 'internal',
						message: error.message || 'unknown error'
					}
				});
			});
	});

	app.listen('4000', () => {
		console.log(`🚀 Started app in http://localhost:4000`);
	});	
};

main().catch(console.error);
```

