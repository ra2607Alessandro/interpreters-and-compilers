"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("./environment");
var parser2_1 = require("./parser2");
var interpreter_1 = require("./interpreter");
var fs = require("fs");
var value_1 = require("./value");
var src = fs.readFileSync("./test.txt", "utf-8");
var env = new environment_1.Environment();
env.declareVar("print", (0, value_1.MK_NTV_FUNCTION)(function (args, scope) {
    if (args[0]) {
        console.log(args[0]);
        return { type: args[0].type };
    }
    return { type: "null", value: null };
}), true);
var parser = new parser2_1.default();
var ast = parser.produceAST(src);
var result = (0, interpreter_1.evaluate)(ast, env);
console.log(result);
