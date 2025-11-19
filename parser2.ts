import { error } from "console";
import {
  ExpressionStatement,
  AssignmentExpr,
  BinaryExpr,
  Expr,
  Identifier,
  NullLiteral,
  NumericLiteral,
  ObjectLiteral,
  Program,
  BooleanLiteral,
  Property,
  Stat,
  VariableDeclare,
  CallExpr,
  Member,
  FunctionDeclare,
  IfStatement,
  ElseStamement,
  StringLiteral,
  WhileStatement,
  ForLoop,
  ElifStatement
} from "./ast";

import { Token, TokenType, tokenize } from "./lexer";
import { env } from "process";
import { evaluate } from "./interpreter";
import { FunctionCall } from "./value";

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

  private parse_declaration(): Stat {
        const isCostant = this.at()!.type == TokenType.Const
        this.eat();
        const identifier = this.expect(
          TokenType.Identifier,
          "Bro, you need to put in an identifier man!"
        ).value; 

        this.expect( 
          TokenType.Equals,
          `Bro wtf? put an '=' ${console.log(this.at())}. I'm lowkey tired of you vibe coders`
        )
         return {
          kind: "VariableDeclare", 
          identifier, 
          constant: isCostant,
          value: this.parse_expr()
        } as VariableDeclare

  }


  private parse_fn_declaration(): Stat {
    this.eat();
    const name  = this.expect(TokenType.Identifier, "Function has to have a name declared").value;
    const args = this.parse_args();

    const params : string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier")
       { console.log(arg)
        throw new Error ("Only strings or identifiers are accepted in the parameters of a function")
           }  
        params.push((arg as Identifier).symbol)
    }

    this.expect(TokenType.OpenBrace, "A function needs to be opened with an open brace")

    const body_list = []
    while (this.not_eof() && this.at()!.type !== TokenType.CloseBrace) {
       const body = this.parse_stmt()
       body_list.push(body)
    }

    this.expect(TokenType.CloseBrace, "You need to close the brace man")
    
    return {
      kind: "FunctionDeclare",
      name: name,
      parameters: params,
      body: body_list
 
    } as FunctionDeclare
  }

  // Handle complex statement types
  private parse_stmt(): Stat {
    // skip to parse_expr
    
    const current = this.at()!.type
    switch(current) {
      case TokenType.Let:
        return this.parse_declaration();
      case TokenType.Const:
        return this.parse_declaration();
      case TokenType.Function:
        return this.parse_fn_declaration();
      case TokenType.FOR:
        return this.parse_for_loop()
      case TokenType.IF:
        return this.parse_if_stat()
      case TokenType.ELSE:
        return this.parse_else_stat()
      case TokenType.WHILE:
        return this.parse_while_loop()
      default: 
        return {
          kind: "ExpressionStatement",
          expression: this.parse_expr()
        } as ExpressionStatement
    }
  }

  private parse_while_loop(): WhileStatement{
    this.eat();
    this.expect(TokenType.Openparen, "'(' is expected")
    const cond = this.parse_expr();
    this.expect(TokenType.Closeparen, "')' is expected")
    this.expect(TokenType.OpenBrace, "'{' is expected")
    const body = this.parse_consequence();
    this.expect(TokenType.CloseBrace, "'}' is expected")
    return {kind: "WhileStatement", condition: cond, body: body} as WhileStatement
  }

  private parse_for_loop(): ForLoop {
    this.eat();
    this.expect(TokenType.Openparen, "'(' is expected");
    let init : VariableDeclare | Expr;
    if (this.at()!.type == TokenType.Let || this.at()!.type == TokenType.Const ){
       init = this.parse_declaration()  
    }
    else 
    {
    init = this.parse_expr();}
    this.expect(TokenType.Comma, "',' is expected");
    const cond = this.parse_expr();
    this.expect(TokenType.Comma, "',' is expected");
    const increment = this.parse_expr();
    this.expect(TokenType.Closeparen, "')' is expected");
    this.expect(TokenType.OpenBrace, "'{' is expected");
    const body = this.parse_consequence();
    this.expect(TokenType.CloseBrace, "'}' is expected");
    return {kind: "ForLoop", init: init, condition: cond, increment: increment, body: body} as ForLoop
  }
    
  

  private parse_consequence(): Stat[] {
    let consequence : Stat[] = [];
    while(this.not_eof() && this.at()!.type !== TokenType.CloseBrace){
       consequence.push(this.parse_stmt());
    }
    return consequence
  }
  
  private parse_if_stat(): IfStatement{
    this.eat();
    this.expect(TokenType.Openparen, "Condition has to be contained inside a parenthesis")
    const expr = this.parse_expr();
    this.expect(TokenType.Closeparen, "You need to close the parenthesis bro.")
    this.expect(TokenType.OpenBrace, "Consequence has to contained inside curly brackets")
    const consequence = this.parse_consequence()
    this.expect(TokenType.CloseBrace, "You forgot to close the parenthesis")
    const ELIF = this.at()
    let elif : any = undefined
    if(ELIF?.type == TokenType.ELIF){
      this.eat()
      this.expect(TokenType.Openparen, "Condition has to be contained inside a parenthesis")
      const expr = this.parse_expr()
      this.expect(TokenType.Closeparen, "You need to close the parenthesis bro.")
      this.expect(TokenType.OpenBrace, "Consequence has to contained inside curly brackets")
      const consequence = this.parse_consequence()
      this.expect(TokenType.CloseBrace, "You forgot to close the parenthesis")
      elif = {
        kind: "ElifStatement",
        condition: expr, 
        consequence: consequence} as ElifStatement
    }
    const ELSE =this.at()
    if (ELSE!.type === TokenType.ELSE)
    { 
    const else_stat = this.parse_else_stat()
      return {kind: "IfStatement",
       condition: expr,
       consequence: consequence, 
       elif: elif!,
       else: else_stat} as IfStatement
     }
     else {
    return {
      kind: "IfStatement",
       condition: expr,
       consequence: consequence,
       elif: elif!
       } as IfStatement
      }
  }

  private parse_else_stat():ElseStamement {
    this.eat();
    this.expect(TokenType.OpenBrace, "Open Brace Expected")
    let stmts : Stat[] = [];
    while(this.not_eof() && this.at()!.type !== TokenType.CloseBrace){
      
      stmts.push(this.parse_stmt());
      
    }
    this.expect(TokenType.CloseBrace, "Expects a closed brace")
    return {kind: "ElseStamement", stmt: stmts} as ElseStamement

  }

  public parse_object(): Expr {
    if (this.at()!.type !== TokenType.OpenBrace) {
        return this.parse_additive_expr();
    }
    
    this.eat(); // eat the opening brace
    const properties = new Array<Property>();
    
    while (this.not_eof() && this.at()!.type !== TokenType.CloseBrace) {
        // Get the property key
        const key = this.expect(
            TokenType.Identifier,
            "Expected identifier as object property key"
        ).value;

        // If it's a shorthand property
        if (this.at()!.type === TokenType.Comma) {
            this.eat(); // eat the comma
            properties.push({ key, kind: "Property" } as Property);
            continue;
        }
        
        if (this.at()!.type === TokenType.CloseBrace) {
            properties.push({ key, kind: "Property" } as Property);
            continue;
        }

        // Regular property with value[]
        this.expect(TokenType.Colon, "Expected colon after property key");
        const value = this.parse_expr();
        properties.push({ kind: "Property", key, value });

        if (this.at()!.type !== TokenType.CloseBrace) {
            this.expect(TokenType.Comma, "Expected comma or closing brace after property");
        }
    }

    this.expect(TokenType.CloseBrace, "Expected closing brace");
    return {kind: "ObjectLiteral", properties} as ObjectLiteral;
}
      
 private parse_assignment_expr(): Expr {
    const first = this.parse_comparison_sign()

    if (
    this.at()!.type == TokenType.Equals) {
    this.eat()
    const value = this.parse_assignment_expr()
    return {kind: "Assignment Expr", assigne: first, value: value} as AssignmentExpr
    }


    return first
  }

  // Handle expressions
 private parse_comparison_sign(): Expr {
  const first = this.parse_additive_expr()

  if (
    this.at()!.type == TokenType.EqualsEquals ||
    this.at()!.type == TokenType.GreaterOrEqual ||  
    this.at()!.type == TokenType.NotEquals ||
    this.at()!.type == TokenType.LessThan || 
    this.at()!.type == TokenType.GreaterThan 
  ) 
  { const op = this.eat()
    const val = this.parse_object()
    return {kind: "BinaryExpr", left: first as Expr, right: val, operator: op.value } as BinaryExpr
  }
  return first
 }
       



  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
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
    let left = this.parse_call_member_expr();

    while (this.at()! && (this.at()!.value === "/" || this.at()!.value === "*" || this.at()!.value === "%")
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_call_member_expr(): Expr {
   const expression = this.parse_member_expr();

   if (this.at()!.type == TokenType.Openparen) {
    return this.parse_call_expr(expression)
   }

   return expression
    }

  private parse_call_expr(callee: Expr): Expr {
    let call_expr : Expr = {kind: "CallExpr", calle: callee, arg: this.parse_args() } as CallExpr;

    if (this.at()!.type == TokenType.Openparen) {
    call_expr = this.parse_call_expr(call_expr)
    }

    return call_expr
   
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.Openparen, "You need to open the parenthesis man");
    const args = this.at()!.type == TokenType.Closeparen ? [] : this.parse_list_args()
    this.expect(TokenType.Closeparen, "You need to close the parenthesis")
    return args

  }

  private parse_list_args(): Expr[] {
    const args = [this.parse_assignment_expr()]
    while (this.at()!.type == TokenType.Comma && this.eat()) {
      
      args.push(this.parse_assignment_expr())
    }

    return args


  }

  private parse_member_expr(): Expr {
    let obj = this.parse_primary_expr();

    while (this.at()!.type == TokenType.Dot || this.at()!.type == TokenType.OpenSquare) {
      let operator = this.eat();
      let property : Expr ;
      let isComputed : boolean 
      let object = obj

      if (operator.type == TokenType.Dot) {
        isComputed = false;
        property = this.parse_primary_expr() 
        if (property.kind !== "Identifier") {
          throw new Error ("there has to be an identifier or i won't understand shit!")
        }
      } 
      else {
          isComputed = true;
          property = this.parse_expr()
          this.expect(TokenType.CloseSquare, "Bro... as in like: Close the fucking square bracket")
        }
      
    
      return { 
        kind : "Member", 
        object: object , 
        isComputed: isComputed, 
        property:  property
       } as Member
      }
    return obj 
  
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

      // Add to parser2.ts in the parse_primary_expr() method
      case TokenType.Boolean:
        return {
        kind: "BooleanLiteral",
        value: this.eat().value === "true" || this.eat().value === "false" 
        } as BooleanLiteral;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value!),
        } as NumericLiteral;

      // Strings
      case TokenType.String:
        return {
          kind: "StringLiteral", 
          value: this.eat()!.value
        } as StringLiteral
        
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
        console.log(this.at())
        throw new Error(`Unexpected token found during parsing: ${this.at()?.value}, ${this.eat().value}`);
        
    }
  }
}
