import server = require("./davinci-hare/convex/_generated/server")

export type NodeType = "Program" | "NumericLiteral" | "Identifier" | "BinaryExpr"

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
