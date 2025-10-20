"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser2_1 = require("./parser2");
var fs = require("fs");
var program = fs.readFileSync("./test.txt", "utf-8");
var parser = new parser2_1.default();
var ast = parser.produceAST(program);
console.log(JSON.stringify(ast, null, 2));
