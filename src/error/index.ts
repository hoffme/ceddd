// Error
export class DomainError<C extends string, M> {
	constructor(public readonly code: C, public readonly message: M) {}
}

// Tuple Constructions

export type DomainErrorTuple = readonly DomainError<string, string>[];

export type DomainErrorInferSchema<T extends DomainErrorTuple> = {
	[K in T[number]['code']]: {
		[N in keyof T]: DomainError<K, string>;
	}[number];
};

// Transformers

export const DomainErrorTupleToSchema = <T extends DomainErrorTuple>(
	tuple: T
): DomainErrorInferSchema<T> => {
	return Object.fromEntries(
		tuple.map((error) => [error.code, error])
	) as DomainErrorInferSchema<T>;
};
