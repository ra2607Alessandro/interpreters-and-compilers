import { lexer, Token, AllTokens } from "./new_lexer";

export interface Program {
    kind: "Program",
    body: Statement[]
}

export interface Statement {
    kind: string

}

export interface Expr {
    kind: string
}

interface NumericLiteral extends Expr {
    kind: "NumericLiteral",
    value: number
}

interface BinaryExpr extends Expr {
    kind: "BinaryExpression",
    n1: number,
    operator: string,
    n2: number
}


export interface VariableDeclare extends Statement {
    kind: "Variable-Declaration",
    ident: string,
    value: Expr,
    isCostant: boolean
}

export class Parsing {
    private Tokens : Token[] = []


    private not_complete() {
        return  this.Tokens.length > 0 && this.Tokens[0]!.token !== AllTokens.END
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
        return {kind: "BinaryExpression" , n1: parseFloat(val.value), operator: next.value, n2: parseFloat(second.value) } as BinaryExpr
    }
    else
   {
    return {kind: "NumericLiteral", value: parseFloat(val.value)} as NumericLiteral
   }
  }

    private parse_var_declaration(){
    const isCostant = this.at().token == AllTokens.CONST 
    this.eat()
    const ident = this.expect(AllTokens.Identifier, `Expected value after variable declaration is an Identifier, not: ${this.at().token}`).value; 
    this.expect(AllTokens.Equal, `Expected token is ' = ' , not: ${this.at().value} `);
    const value = this.parse_value()!;
    return {
        kind: "Variable-Declaration",
        isCostant,
        ident,
        value
    } as VariableDeclare


    }
}

