export const Colors = {
	Reset: '\x1b[0m',
	Black: '\x1b[30m',
	Red: '\x1b[31m',
	Green: '\x1b[32m',
	Yellow: '\x1b[33m',
	Blue: '\x1b[34m',
	Magenta: '\x1b[35m',
	Cyan: '\x1b[36m',
	White: '\x1b[37m',
	Gray: '\x1b[30m'
};

export const log = (...messages: (readonly [keyof typeof Colors, string])[]) => {
	console.log(messages.map((row) => `${Colors[row[0]]}${row[1]}${Colors.Reset}`).join(' '));
};
