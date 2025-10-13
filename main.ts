import Parser from "./parser2";
import promptSync = require('prompt-sync');
const prompt = promptSync();


repl();

function repl() {
  const parser = new Parser();
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
    console.log(program);
  }
}