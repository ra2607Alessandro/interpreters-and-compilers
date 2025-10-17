import Parser from "./parser2"
import fs = require('fs');

const program = fs.readFileSync("./test.txt", "utf-8")

const parser = new Parser(); 
const ast = parser.produceAST(program)
console.log(JSON.stringify(ast, null, 2))

