import { lexer, Token } from "./new_lexer";
import { AllTokens } from "./new_lexer";

interface Program {
    kind: "Program",
    body: Token[]
}

export class Parsing {
    private Tokens : Token[] = []


    private complete() {
        if (this.Tokens[0].token = AllTokens.END){
            return this.Tokens
        }
    }

    private at() {
        return this.Tokens[0]
    }

    private eat() {
        const advance = this.Tokens.shift() as Token;
        return advance
    }

    private expect(token : AllTokens, err_message: string)  {
           const last = this.eat();
           if (last.token !== token)
            throw err_message

    }

    public ProduceAST(source_code: string) {
       let ast : Token[] = []
       while (!this.complete) {
        
        const program = source_code.split('');
        for ( const char in program) {
            ast = lexer(char)
            
        }

       }
       return { kind: "Program", body: ast} as Program
    }

    
        

}