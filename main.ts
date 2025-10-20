import Parser from "./parser2";
import promptSync = require('prompt-sync');
import { evaluate } from "./interpreter";
import { Environment } from "./environment";
import { NumValue, BooleanVal, MK_NTV_FUNCTION , FunctionCall } from "./value";
const prompt = promptSync();


repl();

function repl() {
  const parser = new Parser();
  const env = new Environment();
   env.declareVar("print", MK_NTV_FUNCTION((args, scope) => {
    console.log(args[0]);
    return {type: "null", value: null}
    

  }), true)

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


