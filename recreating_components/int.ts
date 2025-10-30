import { evaluate } from "./binop";
import { Env } from "./env";
import { Parsing } from "./new_parser";

const parser = new Parsing();
const env = new Env();

const string = "let sum = 2 * ( 9 + 5 )"

const ast = parser.ProduceAST(string)

console.log(JSON.stringify(ast, null, 2))
const evaluation = evaluate(ast , env)

console.log(evaluation)
