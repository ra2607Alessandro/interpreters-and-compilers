import { constants } from "buffer";
import { Env } from "./env";
import { Program, Statement, VariableDeclare } from "./new_parser";
import { stat } from "fs";


export type Expr = 
           | {kind: "Number", value: number} 
           | {kind: "BinaryExpression", left: Expr, operator: string, right: Expr}

export type Object = {kind: "Object", properties: [string, any]}


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
            const value = eval_expr( var_dec.value as Expr);
            env.define(var_dec.ident, value);
            return value;} 

    if (stmt.kind == "Object")
    {
        const result = new Map<string, any>()
        const obj = stmt as Object;
        const prop = obj.properties

        for (let i = 0; i < obj.properties.length; i++){
        
        let val : any
        
        if(!(prop[i].value)){
            val = env.lookup(prop[i].key)
            
          }    
        else { 
            val = eval_val(prop[i].value); 
        }
        result.set(prop[i].key, val)
        }
        return result
    }
}

export function eval_val(obj: Object):any {
    if (obj.kind == "Object"){

    }

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





