import { Identifier } from "../ast";
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

export interface FunctionDec extends Statement{
    kind: "Function",
    ident: string,
    params: string[],
    body: Statement[]
}

export interface FunctionCall extends Statement {
    kind: "FunctionCall",
    callee: string,
    args: Expr[]
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

  private parse_statements() {
     const current = this.at()
        if (current.token == AllTokens.LET || current.token == AllTokens.CONST){
           return this.parse_var_declaration()
        }
        if (current.token == AllTokens.FN){
            return this.parse_function()
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
    else if (obj.token == AllTokens.Identifier){
        const fn = this.parse_function_call()
        return fn
    }
    throw new Error ("Are you gonna put something in there?")
  }
   
   private parse_object(): Object{
        this.expect(AllTokens.OpenBrace, "OpenBrace Expected");
        let key : string
        const properties = new Array()
        while(this.not_complete() && this.at().token !== AllTokens.CloseBrace){
            key = this.expect(AllTokens.Identifier, "Identifier expected").value
        
        ;
        const check = this.at();
        switch(check.token){
            case AllTokens.Colon:
                this.eat();
                const val = this.parse_primary_expr()
                properties.push({key, val})
                break
            case AllTokens.Comma:
                this.eat()
                properties.push({key, value: undefined})
                continue
            case AllTokens.CloseBrace:
                properties.push({key, value: undefined})
                break
            default:
                throw new Error ("Token not accepted you bitch")

        }

        if(this.at().token !== AllTokens.CloseBrace && this.at().value){
            this.expect(AllTokens.Comma, "You need to put in a comma")
        }

        if (this.at().token == AllTokens.Comma){
            this.eat()
        }
      }
     
      this.eat()
      return {kind: "Object", properties: properties} as Object
    }


    private parse_function(): FunctionDec{
        this.eat();
        const name = this.expect(AllTokens.Identifier, "The name of a function must be an identifier");
        this.expect(AllTokens.Open_Paren, "You need to insert the parameters of the function. Open '('");
        const params : string[] = []
        while (this.at().token !== AllTokens.Close_Paren){
            if (this.at().token == AllTokens.Identifier){
                const param = this.at().value
                params.push(param)
            }
            if (this.at().token == AllTokens.Comma){
                this.expect(AllTokens.Identifier, "You either put another identifier or you close the params")
            }
        }
        this.expect(AllTokens.OpenBrace, "You need to start the statements body with '{'");
        const body : Statement[] = [];
        while(this.at().token !== AllTokens.CloseBrace){
            const stat = this.parse_statements();
            body.push(stat)

        }
        this.expect(AllTokens.CloseBrace, "'}' is expected");
        return {kind: "Function", ident: name.value, params: params, body: body } as FunctionDec
    }
    

    private parse_function_call():FunctionCall {
        this.eat();
        const name = this.expect(AllTokens.Identifier, "You must add a name to the function").value;
        this.expect(AllTokens.Open_Paren, "'(' is expected")
        const args : Expr[] = [];
        while(this.at()!.token == AllTokens.Close_Paren){
            if(this.at()!.token == AllTokens.Number){
                const arg = {kind: "Number", value: parseFloat(this.at()!.value)} as NumericLiteral
                args.push(arg)
            }
        }
        this.expect(AllTokens.Close_Paren, "')' is expected")
        return {kind:"FunctionCall", callee: name, args: args} as FunctionCall

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

