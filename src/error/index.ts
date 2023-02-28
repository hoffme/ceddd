export class DomainError<C extends string, M> {
	constructor(public readonly code: C, public readonly message: M) {}
}

export type DomainErrorTuple = readonly DomainError<string, string>[];

export type DomainErrorInferMap<T extends DomainErrorTuple> = {
	[K in T[number]['code']]: {
		[N in keyof T]: DomainError<K, string>;
	}[number];
};
