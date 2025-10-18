import { ValueType, RuntimeVal, NumValue, NullValue, IdentValue, BooleanVal, ObjectValue, MK_BOOL } from "./value";
import { AssignmentExpr, BinaryExpr, BooleanLiteral, Identifier, NodeType, NumericLiteral, ObjectLiteral, Program, Property, Stat, VariableDeclare } from "./ast";
import { Environment } from "./environment";
import { TokenType } from "./lexer";
import { constants } from "buffer";

function eval_program(program: Program, env: Environment):RuntimeVal {
    let last_astNode : RuntimeVal = {
        type: "null", value: null
    } as NullValue

    for ( const statement of program.body) {
        last_astNode = evaluate(statement, env)
    }
    return last_astNode
}

function eval_numeric_binary_expr(lhs: NumValue, rhs: NumValue, operator: string): NumValue {
    let result = 0 
    if (operator == "+") {
        result = lhs.value + rhs.value
    } 
    else if (operator == "-") {
        result = lhs.value - rhs.value
    }
    else if (operator == "*") {
        result = lhs.value * rhs.value
    }
    else if (operator == "/") {
        result = lhs.value / rhs.value
    }
    else { 
        result= lhs.value % rhs.value
    } 

    return {value: result, type: "number"}
}
     
function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(lhs as NumValue,  rhs as NumValue, binop.operator)
    }

    return {value: null, type: "null"} as NullValue
}

function evaluate_identifier(ident: Identifier, env: Environment): RuntimeVal {
        const val = env.LooksUp(ident.symbol);
        return val;
}
function eval_declar_var(dec: VariableDeclare, env: Environment, constant?: boolean  ): RuntimeVal {
    const val = dec.value ? evaluate(dec.value, env) : {} as NullValue ; 
    return env.declareVar(dec.identifier, val, constant!) 
}

function eval_assignments_expr(node: AssignmentExpr, env: Environment, ): RuntimeVal {
    if ( node.assigne.kind !== "Identifier"){
        throw "Sorry, the assignment expression has to be an Identifier"
    }
    const varname = (node.assigne as Identifier).symbol
    return env.assignVar(varname, evaluate(node.value, env))
}

function eval_object(obj: ObjectLiteral, env: Environment): RuntimeVal {

    const object = { type: "object", properties: new Map() } as ObjectValue;
  

    for (const { key, value } of obj.properties){
    
    const runtimeVal = (value == undefined) ? env.LooksUp(key) : evaluate(value, env);      
    object.properties.set(key, runtimeVal)
}
    return object

}

export function evaluate(astNode: Stat, env: Environment): RuntimeVal {
    switch(astNode.kind) {
        case "NumericLiteral":
             return {value: ((astNode as NumericLiteral).value),type: "number",} as NumValue;
        case "Identifier":
             return evaluate_identifier(astNode as Identifier, env);
        case "NullLiteral":
            return {value: null, type: "null"} as NullValue;
        case "Program":
            return eval_program(astNode as Program, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env) ;
        case "VariableDeclare":
            return eval_declar_var(astNode as VariableDeclare, env, (astNode as VariableDeclare).constant);
        case "Assignment Expr":
            return eval_assignments_expr(astNode as AssignmentExpr, env);
        case "ObjectLiteral":
            return eval_object(astNode as ObjectLiteral, env);
        case "BooleanLiteral":
            return MK_BOOL((astNode as BooleanLiteral).value)
            default:
            throw new Error(`This AST Node has not yet been setup for interpretation, ${astNode}`)

    }
}