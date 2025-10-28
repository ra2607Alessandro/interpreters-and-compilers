import { constants } from "buffer";
import { Env } from "./env";
import { Program, Statement, VariableDeclare } from "./new_parser";


export type Expr = 
           | {kind: "Number", value: number} 
           | {kind: "BinaryOp", left: Expr, operator: string, right: Expr}



export function evaluate(program: Program, env: Env): any {
    return eval_stmt(program, env)
}

export function eval_stmt(stmt: Statement, env: Env):any {
    if (stmt.kind=="Variable-Declare")
        {   const var_dec = stmt as VariableDeclare
            return eval_expr(var_dec.value, env)} 
}


export function eval_expr(expr: Expr, env: Env):number {

    if ( expr.kind === "Number"){
        return expr.value
    }

    if (expr.kind === "BinaryOp" )
        {
        const leftval = eval_expr(expr.left, env);
        const rightval = eval_expr(expr.right, env); 
        
        switch(expr.operator){
            case "+":
                return leftval + rightval;
            case "-":
                return leftval - rightval;
            case "*":
                return leftval * rightval;
            case "/":
                return leftval * rightval;
            default:
                throw `the operator sign ${expr.operator} is not supported`

        }
    }

    else {
        throw new Error ("The Expression is not acceptable")
    }
}





