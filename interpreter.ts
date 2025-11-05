import { ValueType, RuntimeVal, NumValue, NullValue, IdentValue, BooleanVal, ObjectValue, MK_BOOL,MK_NULL, MK_NTV_FUNCTION, FunctionCall, NativeFunction, UserFunction } from "./value";
import { AssignmentExpr, BinaryExpr, BooleanLiteral, CallExpr, Expr, ExpressionStatement, ForLoop, FunctionDeclare, Identifier, IfStatement, NodeType, NumericLiteral, ObjectLiteral, Program, Property, Stat, StringLiteral, VariableDeclare, WhileStatement } from "./ast";
import { Environment } from "./environment";
import { TokenType } from "./lexer";
import { constants } from "buffer";
import { argv } from "process";

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
     
function eval_comparison_sign(lhs: NumValue, rhs: NumValue, operator: string): BooleanVal {
   let end = false;
   if(operator == "=="){
    end = lhs.value == rhs.value
   }
   else if(operator == "!="){
    end = lhs.value != rhs.value
   }
   else if (operator == "=>"){
    end = lhs.value >= rhs.value
   }
   else if(operator == "<="){
    end = lhs.value <= rhs.value
   }
   else if(operator == "<"){
    end = lhs.value < rhs.value
   }
   else if(operator == ">"){
    end = lhs.value > rhs.value
   }

   return MK_BOOL(end)
}

function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type == "number" && rhs.type == "number") {
        if (binop.operator == "==" || binop.operator == "<"|| binop.operator == ">"||binop.operator == "=>"||binop.operator == "<="||binop.operator == "!="){
            return eval_comparison_sign(lhs as NumValue, rhs as NumValue, binop.operator)
        }
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

function evaluate_call_expr(call: CallExpr, env: Environment): RuntimeVal {

    const args  = call.arg.map( (argv) => evaluate(argv, env) )  
    const caller = evaluate(call.calle, env) 
   
    if (caller.type === "native-function") {
        const result = (caller as NativeFunction ).call(args, env)
        return result
    }
    
    if ( caller.type === "user-function") {
        const func = caller as UserFunction;
        const scope = new Environment(func.declarationENV);

        for (let i = 0; i < func.parameters.length ; i++ ) {
          const varname = func.parameters[i];
          scope.declareVar(varname, args[i], false);
        }

        let results : RuntimeVal = MK_NULL();
         for (const stat of func.body) {
           results = evaluate(stat, scope)
        }
        return results
    }
    
    throw "Cannot call bro. This value is not a function"
    
    }

function eval_declare_fn(fn: FunctionDeclare, env: Environment): RuntimeVal {
    const obj = {
    type: "user-function",
    name: fn.name,
    parameters: fn.parameters,
    body: fn.body,
    declarationENV: env
    } as UserFunction

    return  env.declareVar(fn.name, obj , true)
}

function evaluate_consequence(stmts: Stat[], env: Environment): RuntimeVal{
        const scope = new Environment(env);
        let lastResult : RuntimeVal = MK_NULL();

        for (const stmt of stmts){
            lastResult = evaluate(stmt, scope)
        }
        return lastResult
}

function eval_if_stmt(stmt: IfStatement, env: Environment): RuntimeVal {
    const cond = evaluate(stmt.condition, env)
    if (cond.type !== "boolean"){
        throw new Error ("The condition of an if statement must be of boolean type")
    }

    const condintion = (cond as BooleanVal).value
    if (condintion === true) {
        const alternative = evaluate_consequence(stmt.consequence, env)
        return alternative
    }
    
    if (stmt.else) {
        return evaluate_consequence(stmt.else.stmt, env)
    }

    return MK_NULL()
}

function eval_for_loop(loop: ForLoop, env: Environment): RuntimeVal {
       const scope = new Environment(env)
       let init : RuntimeVal
       if (loop.init.kind == "VariableDeclare"){
         init = eval_declar_var(loop.init as VariableDeclare, scope)
       }
       init = evaluate(loop.init, scope)
       const cond = evaluate(loop.condition, scope)
       if (cond.type !== "boolean"){
        throw new Error ("Condition has to be of type boolean")
       }
       const condval = (evaluate(loop.condition, scope) as BooleanVal).value
       while (condval == true){
          evaluate_consequence(loop.body, scope)
          evaluate(loop.increment, scope)
       }
       return MK_NULL()
}

function eval_while_stmt(stmt: WhileStatement, env: Environment): RuntimeVal{
   while (true){
    const cond = evaluate(stmt.condition, env)
    if (cond.type !== "boolean"){
        throw new Error ("Condition has to be of type boolean")
    }
    const condval = (evaluate(stmt.condition, env) as BooleanVal).value
    if (condval == false){
        break
    }
    evaluate_consequence(stmt.body, env)
   }
   return MK_NULL()
}

export function evaluate(astNode: Stat, env: Environment): RuntimeVal {
    switch(astNode.kind) {
        case "ExpressionStatement":
            return evaluate((astNode as ExpressionStatement).expression, env)
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
        case "FunctionDeclare":
            return eval_declare_fn((astNode as FunctionDeclare), env)
        case "CallExpr":
            return evaluate_call_expr(astNode as CallExpr, env);
        case "BooleanLiteral":
            return MK_BOOL((astNode as BooleanLiteral).value);
        case "IfStatement":
            return eval_if_stmt(astNode as IfStatement, env);
        case "WhileStatement":
            return eval_while_stmt(astNode as WhileStatement, env)
        case "ForLoop":
            return eval_for_loop(astNode as ForLoop, env)
        case "StringLiteral":
            return {type: "string", value: (astNode as StringLiteral).value} as RuntimeVal
            default:
            throw new Error(`This AST Node has not yet been setup for interpretation, ${astNode}`)

    }
}