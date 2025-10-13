import {BinaryExpr, Expr, Identifier, NumericLiteral, Program, Stat} from "./ast.ts"

import { tokenize, Token, TokenType } from "./lexer.ts"

export default class Parser {
    private tokens: Token[] = [];

    private not_eof():boolean {
    return this.tokens[0].type !== TokenType.EOF;
    }

    private at() {
        return this.tokens[0]! as Token
    }

    private eat() {
        
    const prev = this.tokens.shift() as Token;
    return prev!

    }

    public produceAST(sourceCode: string): Program {

        const program: Program = {
            kind: "Program",
            body: []
        };

        while (this.not_eof) {
            program.body.push(this.ParseStat())
        }

        return program
    }

    private ParseStat(): Stat {

        return this.parseExpr();
    }

    private parseExpr(): Expr {

      return this.parseAddicitiveExpr()
 
    }

    private parseAddicitiveExpr() {
        let left = this.parseMultiplicativeExpr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parseMultiplicativeExpr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr
        }
    }

    private parseMultiplicativeExpr() {

        let left = this.parseMultiplicativeExpr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parseMultiplicativeExpr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            }
        }

    }

    private parsePrimExpr(): Expr {
        const tk = this.at().type;

        switch(tk) {

            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value } as Identifier;

            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;

            case TokenType.Openparen: 
            {
                this.eat();
                const value = this.parseExpr();
                this.eat(TokenType.Closeparen, "Unexpected")
                return value
            }

            default:
                console.error("Unexpected token found during parsing", this.at())

        }

        
    } 

    private expect(type: TokenType, err: any ) {

        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type == type) {
            console.error("Parser Error: \n", err, prev, "- Expecting:", type);
        }
        return prev
    }
}

