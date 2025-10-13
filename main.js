"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser2_1 = require("./parser2");
var promptSync = require("prompt-sync");
var prompt = promptSync();
repl();
function repl() {
    var parser = new parser2_1.default();
    console.log("\nRepl v0.1");
    // Continue Repl Until User Stops Or Types `exit`
    while (true) {
        var input = prompt("> ");
        // Check for no user input or exit keyword.
        if (!input || input.includes("exit")) {
            break;
        }
        // Produce AST From sourc-code
        var program = parser.produceAST(input);
        console.log(program);
    }
}
