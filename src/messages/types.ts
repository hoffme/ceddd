/* eslint-disable @typescript-eslint/ban-types */
import { CommandSchema } from './commands';
import { EventSchema } from './events';

export type JoinSchemas<T> = T extends readonly CommandSchema[] | readonly EventSchema[]
	? {
			[K in keyof T[number]]: {
				[N in keyof T]: K extends keyof T[N] ? T[N][K] : never;
			}[number];
	  }
	: {};
