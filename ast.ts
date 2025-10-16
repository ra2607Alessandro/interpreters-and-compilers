import { TokenType } from "./lexer";


export type NodeType = "Program" | "NumericLiteral" | "NullLiteral" | "Identifier" | "BinaryExpr" | "VariableDeclare" | "Assignment Expr"

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

export interface AssignmentExpr extends Stat {
    kind: "Assignment Expr",
    assigne: Expr,
    value: Expr

}

export interface VariableDeclare extends Stat {
    kind: "VariableDeclare",
    identifier : string,
    value: any,
    constant : boolean
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
