import {
  BinaryExpr,
  Expr,
  Identifier,
  NullLiteral,
  NumericLiteral,
  Program,
  Stat,
} from "./ast";

import { Token, TokenType, tokenize } from "./lexer";

/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
  private tokens: Token[] = [];

  /*
   * Determines if the parsing is complete and the END OF FILE Is reached.
   */
  private not_eof() {
    return this.tokens[0]?.type != TokenType.EOF;
  }

  /**
   * Returns the currently available token
   */
  private at(): Token | undefined {
    return this.tokens[0];
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   */
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   *  Also checks the type of expected token and throws if the values dont match.
   */
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      throw new Error(err);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };
    
    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }
    
    return program;
  }

  // Handle complex statement types
  private parse_stmt(): Stat {
    // skip to parse_expr
    return this.parse_expr();
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_additive_expr();
  }

  // Handle Addition & Subtraction Operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at() &&
      this.at()!.type === TokenType.BinaryOper &&
      (this.at()!.value === "+" || this.at()!.value === "-")) {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Handle Multiplication, Division & Modulo Operations
  private parse_multiplicative_expr(): Expr {
    let left = this.parse_primary_expr();

    while (this.at()! &&
      (this.at()!.value === "/" || this.at()!.value === "*" || this.at()!.value === "%")
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Orders Of Precedence
  // AdditiveExpr
  // MultiplicativeExpr
  // PrimaryExpr

  // Parse Literal Values & Grouping Expressions
  private parse_primary_expr(): Expr {

    const tk = this.at()?.type;

    // Determine which token we are currently at and return literal value
    switch (tk!) {
      // User defined values.
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value! } as Identifier;

      case TokenType.Null:
        this.eat(); // advance past null 
        return { kind: "NullLiteral", value: "null"} as NullLiteral;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value!),
        } as NumericLiteral;

      // Grouping Expressions
      case TokenType.Openparen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.Closeparen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
        ); // closing paren
        return value;
      }

      // Unidentified Tokens and Invalid Code Reached
      default:
        throw new Error(`Unexpected token found during parsing: ${this.at()?.value}`);
        
    }
  }
}
