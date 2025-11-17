import { Environment } from "./environment";
import Parser from "./parser2"
import { evaluate } from "./interpreter";
import fs = require('fs');
import { Stat, MK_PROGRAM } from "./ast";
import { FunctionCall, MK_NTV_FUNCTION } from "./value";
import {print} from "./ntv_functions"

const src = fs.readFileSync("./programIV.txt", "utf-8")

const env = new Environment();

env.declareVar("print", MK_NTV_FUNCTION(print as FunctionCall),true )
const parser = new Parser(); 
const ast = parser.produceAST(src)
const result = evaluate(ast , env)

console.log(result)


