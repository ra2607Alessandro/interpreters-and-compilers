import fs = require('fs');
import PromptSync from 'prompt-sync';
class Lox {
    static main(args: string[]): void {

        if (args.length > 1) {
            console.log("Usage: jlox [script]");
            process.exit(64);
            
        }
        else if (args.length === 1) {
            this.runFile(args[0]);
        }
        else {
            this.runPrompt()
        }

   }
   private static runFile(path: string):void {

    const bytes = fs.readFileSync(path, "utf-8");
    this.run(bytes)

   }

   private static runPrompt():void {
    const prompt = require("prompt-sync");

    while(true) {
        const line = prompt("> ");
        

        if (line === null) {
            break;
        }
        this.run(line)
    }
   }

   private static run(source: string):void {

      const scanner = new Scanner(source);
      const tokens : Token[] = scanner.scanTokens();

      for (const token in tokens) {
        console.log(token)
      }

   }
}
