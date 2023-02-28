import { z } from 'zod';

// Literal

export const JSONLiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export type JSONLiteral = z.infer<typeof JSONLiteralSchema>;

// Value

export type JSONValue = JSONLiteral | { [key: string]: JSONValue } | JSONValue[];

export const JSONValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
	z.union([JSONLiteralSchema, z.array(JSONValueSchema), z.record(JSONValueSchema)])
);

// Array

export const JSONArraySchema = z.array(JSONValueSchema);

export type JSONArray = z.infer<typeof JSONArraySchema>;

// Object

export const JSONObjectSchema = z.record(JSONValueSchema);

export type JSONObject = z.infer<typeof JSONObjectSchema>;
