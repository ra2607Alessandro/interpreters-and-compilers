import { Token, TokenType } from "./lexer";
import { FunctionCall } from "./value";


export type NodeType = "ForLoop"|"WhileStatement" |"StringLiteral" |"ElseStamement" |"IfStatement" | "ExpressionStatement" | "Program" | "NumericLiteral" | "NullLiteral" | "BooleanLiteral" | "Identifier" | "FunctionDeclare" |"BinaryExpr" | "VariableDeclare" | "Assignment Expr" | "Property" | "ObjectLiteral" | "CallExpr" | "Member";

export interface Stat {
    kind: NodeType
}

export interface ExpressionStatement {
    kind: "ExpressionStatement";
    expression: Expr;
}

export interface Program {
    kind: "Program",
    body: Stat[]
}

export interface IfStatement {
    kind: "IfStatement",
    condition: Expr,
    consequence: Stat[],
    else?: ElseStamement

}

export interface ForLoop {
    kind: "ForLoop",
    init: VariableDeclare | Expr,
    condition: BooleanLiteral,
    increment: Expr,
    body: Stat[]
}
export interface WhileStatement {
    kind: "WhileStatement",
    condition: Expr,
    body: Stat[]
}

export interface ElseStamement {
    kind: "ElseStamement",
    stmt: Stat[]
}
export interface Expr extends Stat {}

export interface BinaryExpr extends Stat {
    left: Expr,
    right: Expr,
    operator: string
}

export interface FunctionDeclare extends Stat {
    kind: "FunctionDeclare",
    name: string,
    parameters: string[],
    body: Stat[]
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

export interface StringLiteral extends Expr {
    kind: "StringLiteral",
    value: string
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral",
    value: number
}

export interface NullLiteral extends Expr {
    kind: "NullLiteral",
    value: "null"
}

export interface BooleanLiteral extends Expr {
    kind: "BooleanLiteral",
    value: boolean

} 

export interface Property extends Expr {
    kind: "Property",
    key: string,
    value?: Expr
}

export interface ObjectLiteral extends Expr {
     kind: "ObjectLiteral",
     properties: Property[]
}

export interface CallExpr extends Expr {
    kind: "CallExpr",
    calle: Expr,
    arg: Expr[]
}

export interface Member extends Expr {
     kind: "Member",
     object: Expr,
     isComputed: boolean,
     property: Expr
}


export function MK_PROGRAM(b: any): Program {
    return { kind: "Program",
    body: b } 

} 
