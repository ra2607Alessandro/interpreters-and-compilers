import { constants } from "buffer";
import { Env } from "./env";
import { FunctionCall, FunctionDec, Program, Statement, VariableDeclare, Identifier, ExpressionStatement } from "./new_parser";
import { stat } from "fs";
import { env } from "process";



export type Expr = 
           | {kind: "Number", value: number }
           | {kind: "BinaryExpression", left: Expr, operator: string, right: Expr}
           | {kind: "ExpressionStatement", expression: Expr}
           | {kind: "identifier", value: string}

export type Object = {kind: "Object", properties: [string, any]}

export type Function = 
                       | {type: "Function", name: string, params: string[], body: Statement[], declarationEnv: Env}
                       | {type: "Native-Function", call: (args: any[]) => any}

export function evaluate(program: Program, env: Env): any {
    let last_result  = undefined ;

    for ( const stat of program.body){
    last_result = eval_stmt(stat, env)
    
    }
    return last_result
}

export function eval_stmt(stmt: Statement, env: Env):any {

    if (stmt.kind === "Variable-Declaration" )
    {
            const var_dec = stmt as VariableDeclare;
            const value = eval_val( var_dec.value as Expr, env);
            env.define(var_dec.ident, value);
            return value
    } 
    if (stmt.kind === "Function")
    {
        const fn = stmt as FunctionDec;
        const fn_dec = {
            type: "function",
            ident: fn.ident,
            params: fn.params,
            body: fn.body,
            declarationEnv: env
        } 
        env.define(fn.ident, fn_dec)
        return fn_dec
    }
    if (stmt.kind === "FunctionCall"){
       return eval_function_call(stmt as FunctionCall, env)
    }
    if (stmt.kind === "ExpressionStatement") {
        const exprStmt = stmt as any; // You need the ExpressionStatement type
        return eval_val(exprStmt.expression, env);
    }
    
    throw new Error(`Unknown statement type: ${stmt.kind}`);

}

export function eval_val(value: any, env: Env):any {
    if (value.kind == "Object"){
      return eval_object(value as Object,env)
    }
    return eval_expr(value, env)

}
export function eval_object(obj: Object, env: Env): Map<string,any>{
    const result = new Map<string, any>()
        
        const prop = obj.properties

        for (let i = 0; i < obj.properties.length; i++){
        
        let val : any
        
        if(!(prop[i].value)){
            val = env.lookup(prop[i].key)
            
          }    
        else { 
            val = eval_val(prop[i].value, env); 
        }
        result.set(prop[i].key, val)
        }
        return result
} 
export function eval_function_dec(fn: FunctionDec, env: Env): Function {
    const fn_env = new Env(env);
    return  {type: "Function", name: fn.ident, params: fn.params, body: fn.body, declarationEnv: fn_env} as Function;
}

export function eval_function_call(fn: FunctionCall, env: Env): any{
    
    const args  : any[] = [];
    for (const arg of fn.args){
        args.push(eval_val(arg, env))
    } 
    const func = env.lookup(fn.callee)
    if (func.type === "Native-Function") {
        const ntv_fn = func.call
        return ntv_fn(args)
    }
    if (func.type === "function" ){
    const exec_env = new Env(func.declarationENV)
    for (let i = 0; i < func.params.length; i++){
        exec_env.define(func.params[i], args[i]);
    }
    let last : any = undefined;
    for (const stmt of func.body){
        last = eval_stmt(stmt, exec_env)
    }
    return last
    } 
    
    throw new Error("The type is not acceptable")
}


export function eval_expr(expr: any, env: Env):number {

   if ( expr.kind=="ExpressionStatement" ){
    return eval_expr(expr.expression, env)
   }
   if (expr.kind == "FunctionCall"){
    return eval_stmt(expr, env)
   }

    if (expr.kind === "Number"){
        return expr.value
    }
    
    if (expr.kind === "identifier") {
        const ident = expr as any
       return env.lookup(ident.value)
    }

    if (expr.kind === "BinaryExpression" )
        {
        const leftval = eval_expr(expr.left, env);
        const rightval = eval_expr(expr.right,env); 
        
        switch(expr.operator){
            case "+":
                return leftval + rightval;
            case "-":
                return leftval - rightval;
            case "*":
                return leftval * rightval;
            case "/":
                return leftval / rightval;
            default:
                throw `the operator sign ${expr.operator} is not supported`

        } 
    }

    else {
        console.log(expr)
        throw new Error ("The Expression is not acceptable")
    }
}

export function make_NTV_fn(fn: (args: any[]) => any): Function {
    
    return {type:"Native-Function", call: fn } as Function;         
}



