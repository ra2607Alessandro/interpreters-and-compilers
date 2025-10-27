import { constants } from "buffer";

type Expr = 
           | {kind: "Number", value: number} 
           | {kind: "BinaryOp", left: Expr, operator: string, right: Expr}

function evaluate(expr: Expr):number {

    if ( expr.kind === "Number"){
        return expr.value
    }

    if (expr.kind === "BinaryOp" )
        {
        const leftval = evaluate(expr.left);
        const rightval = evaluate(expr.right); 
        
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





const Test : Expr = {
    kind: "BinaryOp",
    left: {kind: "BinaryOp", left: {kind: "Number", value: 5}, operator: "+", right: {kind: "Number", value: 3}},
    operator: "*",
    right: {kind: "Number", value: 2}

}
console.log(evaluate(Test))