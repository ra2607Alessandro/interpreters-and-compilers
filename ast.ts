

export type NodeType = "Program" | "NumericLiteral" | "NullLiteral" | "Identifier" | "BinaryExpr"

export interface Stat {
    kind: NodeType
}

export interface Program {
    kind: "Program",
    body: Stat[]
}

export interface Expr extends Stat {}

export interface BinaryExpr extends Stat {
    left: Expr,
    right: Expr,
    operator: string
}

export interface Identifier extends Expr {
    kind: "Identifier"
    symbol: string
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral",
    value: number
}

export interface NullLiteral extends Expr {
    kind: "NullLiteral",
    value: "null"
}
