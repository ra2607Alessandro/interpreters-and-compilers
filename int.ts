import { evaluate } from "./recreating_components/binop";
import { Env } from "./recreating_components/env";
import { Parsing } from "./recreating_components/new_parser";

const parser = new Parsing();
const env = new Env();

const string = "let sum = 2 + 7 + 3"

const ast = parser.ProduceAST(string)

console.log(JSON.stringify(ast, null, 2))
const evaluation = evaluate(ast , env)

console.log(evaluation)
