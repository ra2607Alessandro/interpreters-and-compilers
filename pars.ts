import { lexer, Token, AllTokens } from "./recreating_components/new_lexer";

interface Program {
    kind: "Program",
    body: Statement[]
}

interface Statement {
    kind: string

}

interface Expr  { 
    n1: AllTokens.Number,
    operator?: AllTokens.BinaryOp,
    n2: AllTokens.Number
 }


interface VariableDeclare extends Statement {
    kind: "Variable-Declaration",
    ident: string,
    value: Expr,
    isCostant: boolean
}

export class Parsing {
    private Tokens : Token[] = []


    private not_complete() {
        return  this.at()!.token !== AllTokens.END
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
        if (last.token !== token){throw err_message};
        return last
   
    }

    public ProduceAST(source_code: string) {
    this.Tokens = lexer(source_code);
    this.Tokens.push({value: "END", token: AllTokens.END})

    const program = {
        kind: "Program",
        body: []

    } as Program
   
    while (this.not_complete()) {
     program.body.push(this.parse_statements())
    }

    return program
    }

  private parse_statements()  {
     const current = this.at()

        if (current.token == AllTokens.LET || current.token == AllTokens.CONST){
           return this.parse_var_declaration()
        }
     
        throw new Error("bro, what the fuck? Whenever you start a statement you need to declare a variable with const or let")
        

  }

  private parse_value(): Expr {
    const val = this.expect(AllTokens.Number, "The expression has to start with a number")
    const next = this.eat()!
    if ( next.token == AllTokens.BinaryOp && this.not_complete()){
        const second = this.expect(AllTokens.Number, "Expression can only take in a number")
        return { n1: val.token, operator: next.token, n2: second.token  } as Expr
    }
    else
   {
    return {n1: val.token} as Expr}
    
  }

    private parse_var_declaration(){
    const isCostant = this.at().token == AllTokens.CONST 
    this.eat()
    const ident = this.expect(AllTokens.Identifier, `Expected value after variable declaration is an Identifier, not: ${this.at().token}`).value; 
    this.expect(AllTokens.Equal, `Expected token is ' = ' , not: ${this.at().value} `);
    const value = this.parse_value();
    return {
        kind: "Variable-Declaration",
        isCostant,
        ident,
        value
    } as VariableDeclare


    }
}

const parser = new Parsing();
const string = "let continents = 45"
const nor = parser.ProduceAST(string)
console.log(nor)
