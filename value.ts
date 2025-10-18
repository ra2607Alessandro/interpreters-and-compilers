

export type ValueType = "null" | "number" | "string" | "boolean" | "object";


export interface RuntimeVal {
    type: ValueType,
    
}

export interface NullValue extends RuntimeVal {
    type: "null",
    value: null
}

export interface BooleanVal extends RuntimeVal {
    type: "boolean"
    value: true | false
}

export interface NumValue extends RuntimeVal {
    type: "number",
    value: number
}

export interface IdentValue extends RuntimeVal {
    type: "string",
    value: string
}

export interface ObjectValue extends RuntimeVal {
    type: "object",
    properties: Map<string, RuntimeVal>;
}

export function MK_BOOL(b: boolean): BooleanVal {
    return {type: "boolean", value: b};
}