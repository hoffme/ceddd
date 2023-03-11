import { JSONObject } from '../shared/json';

export interface Context extends JSONObject {
	trace: { id: string }[];
	http: null | {
		ip: string;
		userAgent: string;
	};
	auth: null | {
		token: string;
	};
}
