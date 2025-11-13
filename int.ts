import { evaluate, make_NTV_fn } from "./recreating_components/binop";
import { Env } from "./recreating_components/env";
import { Parsing, FunctionCall } from "./recreating_components/new_parser";
import fs = require('fs');

const parser = new Parsing();
const env = new Env();
const printFN = (args: any[]) => {
    if(args){
        console.log(...args)
    }
    else {
        return null
    }
}
env.define("print", make_NTV_fn(printFN))
const src = fs.readFileSync("./test.txt", "utf-8")

const ast = parser.ProduceAST(src)

console.log(JSON.stringify(ast, null, 2))
const evaluation = evaluate(ast , env)

console.log(evaluation)
