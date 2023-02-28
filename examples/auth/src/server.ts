import express, { json, urlencoded } from 'express';
import cors from 'cors';

import { CommandBus, CommandSchema } from 'ceddd/commands';

export const runServer = <T extends CommandSchema>(commandBus: CommandBus<T>) => {
	const app = express();

	app.use(cors({ origin: '*' }));

	app.use(urlencoded({ extended: false }));
	app.use(json());

	app.post('/api/cmd', (req, res) => {
		const command = req.body;

		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		const userAgent = req.headers['user-agent'];

		commandBus
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
			.then((result) => res.status(200).json({ result }))
			.catch((error) => {
				res.status(400).json({
					error: {
						code: error?.code || 'internal',
						message: error.message || 'unknown error'
					}
				});
			});
	});

	const port = '4000';

	app.listen(port, () => {
		console.log(`🚀 Started app in http://localhost:${port}`);
	});
};
