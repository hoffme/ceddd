# CEDDD

Library to structure a proyect with DDD, testing, types end to end, verification params.

## Entities

### Command/Event

It is a DTO that contains
- **topic** a type of action to be performed
- **id** a unique identifier
- **datetime** creation datetime in utc
- **context** is as authentication, traced of the route, information of the agent who performs the request or IP, etc.
- **data** information necessary to carry out the topic action.

``` typescript
// Message Context

interface Context extends JSONObject {
	trace: { id: string }[];
	http: null | {
		ip: string;
		userAgent: string;
	};
	auth: null | {
		token: string;
	};
}

// Command

type CommandTopic = `cmd.${string}`;

interface Command<T extends CommandTopic, D extends JSONValue> {
	ctx: Context;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}

// Event

export type EventTopic = `evt.${string}`;

export interface Event<T extends EventTopic, D extends JSONValue> {
	ctx: Context;
	id: string;
	datetime: string;
	topic: T;
	data: D;
}
```

### Command/Event Definition

Define the relationship of a topic with the data and the result that returns the resolution of that command/event. Data and the result is used Zod for type validation.

``` typescript
// Commands

const SignInCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.signIn',
	data: z.object({
		username: z.string(),
		password: z.string()
	}),
	result: z.object({
		id: z.string(),
		firstName: z.string(),
		lastName: z.string(),
		email: z.string()
	})
});

const CheckBusinessEmailCommandDefinition = new CommandDefinition({
	topic: 'cmd.auth.email.check',
	data: z.object({
		email: z.string()
	}),
	result: z.object({
		isBusiness: z.boolean()
	})
});

// Event

export const AuthSignInEventDefinition = new EventDefinition({
	topic: 'evt.auth.signedIn',
	data: z.object({
		userId: z.string()
	})
});
```

### Command/Event Resolver

It is the implementation of a function that resolves a command/event definition, defining the units you need (other commands/events that it emits and infrastructure as repository to databases, external services, etc.) and the errors you can throw.

```ts
interface SignInInfrastructure {
	repositories: {
		user: {
			findByEmail(email: string): Promise<User | null>
		}
	};
	services: {
		password: {
			check(password: string, hash: string): Promise<{ isSame: boolean }>
		}
	}
}

export const SignInCommandResolver = new CommandResolver({
	// interface with services/repositories requerid
	// this is put with an empty object and "as" 
	// to be able to infer the type of the interface
	infrastructure: {} as SignInInfrastructure,
	// Definition of Command
	definition: SignInCommandDefinition,
	// Different types of effects that the resolver can dispatch/emit/throw
	effects: {
		// Array of command defintions to dispath
		commands: [
			CheckBusinessEmailCommandDefinition
        ] as const,
		// Array of events defintions to emit 
		events: [
			AuthSignInEventDefinition
		] as const,
		// Array of domain errors to throw
		errors: [
			new DomainError('email.incorrect', 'correo incorrecto'),
			new DomainError('password.incorrect', 'contraseña incorrecta')
		] as const,
	},
	// Function with business logic
	method: async ({ cmd, infra, commands, events, errors }) => {
		// Implementation
		const checkEmail = await commands.dispatch({
			topic: 'cmd.auth.email.check',
			data: {
				email: cmd.data.email
			}
		});
		if (!checkEmail.isBusiness) {
			throw errors['email:incorrect'];
		}

		const user = await infra.repositories.user.findByEmail({
			email: cmd.data.email,
		});
		if (!user) {
			throw errors['email:incorrect'];
		}

		const checkPassword = await infra.services.password.check(
			cmd.data.password,
			user.passwordHash
		);
		if (!checkPassword.isSame) {
			throw errors['password:incorrect'];
		}

		events.emit({
			topic: 'evt.auth.signedIn',
			data: {
				userId: user.id
			}
		});

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email
		};
	}
});
```

## Module
To section the resolvers by different modules, for example authentication, profile, mailing, etc., the modules are used, which are a group of resolvers. These modules are the ones that set up the infrastructure for each resolver.

```ts
export const AuthModule = new Module({
	// Setup of Resolvers
	setup: async () => {
		const userRepository = new FileUserRepository();
		const cryptoService = new CrytoService();

		return {
			// infrastructure of commands resolvers
			commands: {
				'cmd.auth.signIn': {
					repositories: {
						user: userRepository
					};
					services: {
						password: cryptoService
					}
				},
				'cmd.auth.email.check': {}
			},
			// infrastructure of event resolvers
			events: {}
		};
	},
	resolvers: {
		commands: [
			SignInCommandResolver, 
			CheckBusinessEmailCommandDefinition
		] as const,
		events: [] as const
	}
});
```

## App
app is a main unique class with all modules of application.

```ts
export const app = new App({
	modules: [AuthModule] as const
});

export type AppCommandSchema = AppInferCommandSchema<typeof app>;

export type AppEventSchema = AppInferEventSchema<typeof app>;
```

## iInitialization

in file index.ts start a main funcion of applicacion with express example.

```ts
// index.ts

const main = async () => {
	// create a implementation of command bus and event bus
	// in ceddd/utils you have MemoryCommandBus and MemoryEventBus examples
	const commands = new MemoryCommandBus<AppCommandSchema>(app.schemas.commands);
	const events = new MemoryEventBus<AppEventSchema>(app.schemas.events);

	// this initialize infrastructure and register al resolvers in buses
	await app.init({ commands, events });

	// you can dispath commands in command or subscribe to events
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

## HTTP Command

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data-raw '{
    "topic": "cmd.auth.signIn",
    "data": {
        "email": "hoffme@business.email",
        "password": "1234"
    }
}'
```