import { Env } from "./env";
import { lexer, Token, AllTokens } from "./new_lexer";

export interface Program {
    kind: "Program",
    body: Statement[]
}

export interface Statement {
    kind: string

}

export interface Expr {
    kind: string,
}

interface NumericLiteral extends Expr {
    kind: "Number",
    value: number
}

interface BinaryExpr extends Expr {
    kind: "BinaryExpression",
    left:  Expr,
    operator: string,
    right: Expr
}


export interface VariableDeclare extends Statement {
    kind: "Variable-Declaration",
    ident: string,
    value: Expr,
    isCostant: boolean
}

export interface Property extends Expr{
    kind: "Property",
    key: string,
    value: any
}

export interface Object extends Expr {
    kind: "Object",
    properties: Property[]
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
        console.log(current)    
        throw new Error("bro, what the fuck? Whenever you start a statement you need to declare a variable with const or let")
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();
    while (this.at() && (this.at().value == "+" || this.at().value == "-")){
        const operator = this.eat()
        const right = this.parse_multiplicative_expr();
        left = {
            kind: "BinaryExpression",
            left: left,
            operator: operator.value,
            right: right
        } as BinaryExpr
    }
    return left
  }
  private parse_multiplicative_expr(): Expr {
     let left = this.parse_primary_expr();
    while (this.at() && (this.at().value == "*" || this.at().value == "/")){
        const operator = this.eat()
        const right = this.parse_primary_expr();
        left = {
            kind: "BinaryExpression",
            left: left,
            operator: operator.value,
            right: right
        } as BinaryExpr
    }
    return left
  }
  private parse_primary_expr(): Expr {
    let obj = this.at()
    if (obj.token == AllTokens.Number){
        this.eat()
        return {kind: "Number", value: parseFloat(obj.value)} as NumericLiteral
    }   
    else if (obj.token == AllTokens.Open_Paren){
        this.eat()
        const expr = this.parse_additive_expr();
        this.expect(AllTokens.Close_Paren, "Expected a closing parenthesis")
        return expr
    }
    else if (obj.token == AllTokens.OpenBrace){
        const object = this.parse_object()
        return object
    }
    throw new Error ("Are you gonna put something in there?")
  }
   
    private parse_object(): Object{
        this.expect(AllTokens.OpenBrace, "OpenBrace Expected")
        while(this.not_complete() && this.at().token !== AllTokens.CloseBrace){
            const key = this.expect(AllTokens.Identifier, "Identifier expected");
            let value : Expr;
            if (this.at().token == AllTokens.Comma || this.eat().token == AllTokens.CloseBrace){
                const env = new Env();
                value = env.lookup(key.value)
            }
            if (this.at().token == AllTokens.Colon){
                value = this.parse_primary_expr()
            }
            value = this.parse_primary_expr();
            this.expect(AllTokens.CloseBrace, "You need to close the brace");
            
           const properties = [{kind: "Property", key: key.value, value: value } as Property];
           return {kind: "Object", properties: properties} as Object;
        }
        throw new Error ("Object wasn't costructed well")
    }

    private parse_var_declaration(){
    const isCostant = this.at().token == AllTokens.CONST 
    this.eat()
    const ident = this.expect(AllTokens.Identifier, `Expected value after variable declaration is an Identifier, not: ${this.at().token}`).value; 
    this.expect(AllTokens.Equal, `Expected token is ' = ' , not: ${this.at().value} `);
    const value = this.parse_additive_expr();
    return {
        kind: "Variable-Declaration",
        isCostant,
        ident,
        value
    } as VariableDeclare

    }
}

