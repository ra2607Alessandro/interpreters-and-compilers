import { constants } from "buffer";
import { Env } from "./env";
import { FunctionDec, Program, Statement, VariableDeclare } from "./new_parser";
import { stat } from "fs";
import { env } from "process";


export type Expr = 
           | {kind: "Number", value: number }
           | {kind: "BinaryExpression", left: Expr, operator: string, right: Expr}

export type Object = {kind: "Object", properties: [string, any]}

export type Function = {type: "Function", name: string, params: string[], body: Statement[], declarationEnv: Env}


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
}

export function eval_val(value: any, env: Env):any {
    if (value.kind == "Object"){
      return eval_object(value as Object,env)
    }
    return eval_expr(value)

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

export function eval_function(fn: Function, env: Env){
    if (!(env.lookup(fn.name))){
        throw new Error ("This function wasn't defined in the environment");
    }
    const exec_env = new Env(fn.declarationEnv);
    
}


export function eval_expr(expr: Expr):number {

    if (expr.kind === "Number"){
        return expr.value
    }
    

    if (expr.kind === "BinaryExpression" )
        {
        const leftval = eval_expr(expr.left);
        const rightval = eval_expr(expr.right); 
        
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
        throw new Error ("The Expression is not acceptable")
    }
}





