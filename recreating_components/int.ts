import { evaluate } from "./binop";
import { Env } from "./env";
import { Parsing } from "./new_parser";

const parser = new Parsing();
const env = new Env();

const string = "let sum = 2 + 7"

const ast = parser.ProduceAST(string)

const evaluation = evaluate(ast , env)



