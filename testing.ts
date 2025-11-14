import { Environment } from "./environment";
import Parser from "./parser2"
import { evaluate } from "./interpreter";
import fs = require('fs');
import { Stat, MK_PROGRAM } from "./ast";
import { MK_NTV_FUNCTION } from "./value";

const src = fs.readFileSync("./programI.txt", "utf-8")

const env = new Environment();
env.declareVar("print", MK_NTV_FUNCTION((args, scope) => {
    if (args[0]) {
       console.log(args[0])
       return {type: args[0].type}
    }
    return {type: "null", value: null}
}), true)
const parser = new Parser(); 
const ast = parser.produceAST(src)
const result = evaluate(ast , env)



console.log(result)


