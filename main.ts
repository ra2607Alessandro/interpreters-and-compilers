import Parser from "./parser2";
import promptSync = require('prompt-sync');
import { evaluate } from "./interpreter";
import { Environment } from "./environment";
import { NumValue, BooleanVal } from "./value";
const prompt = promptSync();


repl();

function repl() {
  const parser = new Parser();
  const env = new Environment();
  
  env.declareVar("true", {type: "boolean", value: true} as BooleanVal);
  env.declareVar("false", {type: "boolean", value: false} as BooleanVal);
  console.log("\nRepl v0.1");

  // Continue Repl Until User Stops Or Types `exit`
  while (true) {
    const input = prompt("> ");
    // Check for no user input or exit keyword.
    if (!input || input.includes("exit")) {
      break;
    }

    // Produce AST From sourc-code
    const program = parser.produceAST(input);
    
    
    const result = evaluate(program, env);
    console.log(result)

  }
}
