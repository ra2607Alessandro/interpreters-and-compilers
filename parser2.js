"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_1 = require("./lexer");
/**
 * Frontend for producing a valid AST from sourcode
 */
var Parser = /** @class */ (function () {
    function Parser() {
        this.tokens = [];
    }
    /*
     * Determines if the parsing is complete and the END OF FILE Is reached.
     */
    Parser.prototype.not_eof = function () {
        var _a;
        return ((_a = this.tokens[0]) === null || _a === void 0 ? void 0 : _a.type) != lexer_1.TokenType.EOF;
    };
    /**
     * Returns the currently available token
     */
    Parser.prototype.at = function () {
        return this.tokens[0];
    };
    /**
     * Returns the previous token and then advances the tokens array to the next value.
     */
    Parser.prototype.eat = function () {
        var prev = this.tokens.shift();
        return prev;
    };
    /**
     * Returns the previous token and then advances the tokens array to the next value.
     *  Also checks the type of expected token and throws if the values dont match.
     */
    Parser.prototype.expect = function (type, err) {
        var prev = this.tokens.shift();
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            throw new Error(err);
        }
        return prev;
    };
    Parser.prototype.produceAST = function (sourceCode) {
        this.tokens = (0, lexer_1.tokenize)(sourceCode);
        var program = {
            kind: "Program",
            body: [],
        };
        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }
        return program;
    };
    Parser.prototype.parse_declaration = function () {
        var isCostant = this.at().type == lexer_1.TokenType.Const;
        this.eat();
        var identifier = this.expect(lexer_1.TokenType.Identifier, "Bro, you need to put in an identifier man!").value;
        this.expect(lexer_1.TokenType.Equals, "Bro wtf? put an '='. I'm lowkey tired of you vibe coders");
        return {
            kind: "VariableDeclare",
            identifier: identifier,
            constant: isCostant,
            value: this.parse_expr()
        };
    };
    Parser.prototype.parse_fn_declaration = function () {
        var fn = this.eat();
        var name = this.expect(lexer_1.TokenType.Identifier, "Function has to have a name declared").value;
        var args = this.parse_args();
        var params = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (arg.kind !== "Identifier") {
                console.log(arg);
                throw new Error("Only strings or identifiers are accepted in the parameters of a function");
            }
            params.push(arg.symbol);
        }
        this.expect(lexer_1.TokenType.OpenBrace, "A function needs to be opened with an open brace");
        var body_list = [];
        while (this.not_eof() && this.at().type !== lexer_1.TokenType.CloseBrace) {
            var body = this.parse_stmt();
            body_list.push(body);
        }
        this.expect(lexer_1.TokenType.CloseBrace, "You need to close the brace man");
        return {
            kind: "FunctionDeclare",
            name: name,
            parameters: params,
            body: body_list
        };
    };
    // Handle complex statement types
    Parser.prototype.parse_stmt = function () {
        // skip to parse_expr
        var current = this.at().type;
        switch (current) {
            case lexer_1.TokenType.Let:
                return this.parse_declaration();
            case lexer_1.TokenType.Const:
                return this.parse_declaration();
            case lexer_1.TokenType.Function:
                return this.parse_fn_declaration();
            case lexer_1.TokenType.FOR:
                return this.parse_for_loop();
            case lexer_1.TokenType.IF:
                return this.parse_if_stat();
            case lexer_1.TokenType.ELSE:
                return this.parse_else_stat();
            case lexer_1.TokenType.WHILE:
                return this.parse_while_loop();
            default:
                return {
                    kind: "ExpressionStatement",
                    expression: this.parse_expr()
                };
        }
    };
    Parser.prototype.parse_while_loop = function () {
        this.eat();
        this.expect(lexer_1.TokenType.Openparen, " '(' is expected");
        var cond = this.parse_expr();
        this.expect(lexer_1.TokenType.Closeparen, " ')' is expected");
        this.expect(lexer_1.TokenType.OpenBrace, "'{' is expected");
        var body = this.parse_consequence();
        this.expect(lexer_1.TokenType.CloseBrace, "'}' is expected");
        return { kind: "WhileStatement", condition: cond, body: body };
    };
    Parser.prototype.parse_for_loop = function () {
        this.eat();
        this.expect(lexer_1.TokenType.Openparen, "'(' is expected");
        var init;
        if (this.at().type == lexer_1.TokenType.Let || this.at().type == lexer_1.TokenType.Const) {
            init = this.parse_declaration();
        }
        else {
            init = this.parse_expr();
        }
        this.expect(lexer_1.TokenType.Comma, "',' is expected");
        var condition = this.parse_expr();
        this.expect(lexer_1.TokenType.Closeparen, "',' is expected");
        var increment = this.parse_expr();
        this.expect(lexer_1.TokenType.Closeparen, "')' is expected");
        this.expect(lexer_1.TokenType.OpenBrace, "'{' is expected");
        var body = this.parse_consequence();
        this.expect(lexer_1.TokenType.CloseBrace, "'}' is expected");
        return { init: init, condition: condition, increment: increment, body: body };
    };
    Parser.prototype.parse_consequence = function () {
        var consequence = [];
        while (this.not_eof() && this.at().type !== lexer_1.TokenType.CloseBrace) {
            consequence.push(this.parse_stmt());
        }
        return consequence;
    };
    Parser.prototype.parse_if_stat = function () {
        this.eat();
        this.expect(lexer_1.TokenType.Openparen, "Condiotion has to be contained inside a parenthesis");
        var expr = this.parse_expr();
        this.expect(lexer_1.TokenType.Closeparen, "You need to close the parenthesis bro.");
        this.expect(lexer_1.TokenType.OpenBrace, "Consequence has to contained inside curly brackets");
        var consequence = this.parse_consequence();
        this.expect(lexer_1.TokenType.CloseBrace, "You forgot to close the parenthesis");
        var ELSE = this.at();
        if (ELSE.type === lexer_1.TokenType.ELSE) {
            var else_stat = this.parse_else_stat();
            return { kind: "IfStatement",
                condition: expr,
                consequence: consequence, else: else_stat };
        }
        else {
            return {
                kind: "IfStatement",
                condition: expr,
                consequence: consequence
            };
        }
    };
    Parser.prototype.parse_else_stat = function () {
        this.eat();
        this.expect(lexer_1.TokenType.OpenBrace, "Open Brace Expected");
        var stmts = [];
        while (this.not_eof() && this.at().type !== lexer_1.TokenType.CloseBrace) {
            stmts.push(this.parse_stmt());
        }
        this.expect(lexer_1.TokenType.CloseBrace, "Expects a closed brace");
        return { kind: "ElseStamement", stmt: stmts };
    };
    Parser.prototype.parse_object = function () {
        if (this.at().type !== lexer_1.TokenType.OpenBrace) {
            return this.parse_additive_expr();
        }
        this.eat(); // eat the opening brace
        var properties = new Array();
        while (this.not_eof() && this.at().type !== lexer_1.TokenType.CloseBrace) {
            // Get the property key
            var key = this.expect(lexer_1.TokenType.Identifier, "Expected identifier as object property key").value;
            // If it's a shorthand property
            if (this.at().type === lexer_1.TokenType.Comma) {
                this.eat(); // eat the comma
                properties.push({ key: key, kind: "Property" });
                continue;
            }
            if (this.at().type === lexer_1.TokenType.CloseBrace) {
                properties.push({ key: key, kind: "Property" });
                continue;
            }
            // Regular property with value[]
            this.expect(lexer_1.TokenType.Colon, "Expected colon after property key");
            var value = this.parse_expr();
            properties.push({ kind: "Property", key: key, value: value });
            if (this.at().type !== lexer_1.TokenType.CloseBrace) {
                this.expect(lexer_1.TokenType.Comma, "Expected comma or closing brace after property");
            }
        }
        this.expect(lexer_1.TokenType.CloseBrace, "Expected closing brace");
        return { kind: "ObjectLiteral", properties: properties };
    };
    Parser.prototype.parse_assignment_expr = function () {
        var first = this.parse_comparison_sign();
        if (this.at().type == lexer_1.TokenType.Equals) {
            this.eat();
            var value = this.parse_assignment_expr();
            return { kind: "Assignment Expr", assigne: first, value: value };
        }
        return first;
    };
    // Handle expressions
    Parser.prototype.parse_comparison_sign = function () {
        var first = this.parse_object();
        if (this.at().type == lexer_1.TokenType.EqualsEquals ||
            this.at().type == lexer_1.TokenType.GreaterOrEqual ||
            this.at().type == lexer_1.TokenType.NotEquals ||
            this.at().type == lexer_1.TokenType.LessThan ||
            this.at().type == lexer_1.TokenType.GreaterThan) {
            var op = this.eat();
            var val = this.parse_object();
            return { kind: "BinaryExpr", left: first, right: val, operator: op.value };
        }
        return first;
    };
    // Handle expressions
    Parser.prototype.parse_expr = function () {
        return this.parse_assignment_expr();
    };
    // Handle Addition & Subtraction Operations
    Parser.prototype.parse_additive_expr = function () {
        var left = this.parse_multiplicative_expr();
        while (this.at() &&
            this.at().type === lexer_1.TokenType.BinaryOper &&
            (this.at().value === "+" || this.at().value === "-")) {
            var operator = this.eat().value;
            var right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left: left,
                right: right,
                operator: operator,
            };
        }
        return left;
    };
    // Handle Multiplication, Division & Modulo Operations
    Parser.prototype.parse_multiplicative_expr = function () {
        var left = this.parse_call_member_expr();
        while (this.at() && (this.at().value === "/" || this.at().value === "*" || this.at().value === "%")) {
            var operator = this.eat().value;
            var right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left: left,
                right: right,
                operator: operator,
            };
        }
        return left;
    };
    Parser.prototype.parse_call_member_expr = function () {
        var expression = this.parse_member_expr();
        if (this.at().type == lexer_1.TokenType.Openparen) {
            return this.parse_call_expr(expression);
        }
        return expression;
    };
    Parser.prototype.parse_call_expr = function (callee) {
        var call_expr = { kind: "CallExpr", calle: callee, arg: this.parse_args() };
        if (this.at().type == lexer_1.TokenType.Openparen) {
            call_expr = this.parse_call_expr(call_expr);
        }
        return call_expr;
    };
    Parser.prototype.parse_args = function () {
        this.expect(lexer_1.TokenType.Openparen, "You need to open the parenthesis man");
        var args = this.at().type == lexer_1.TokenType.Closeparen ? [] : this.parse_list_args();
        this.expect(lexer_1.TokenType.Closeparen, "You need to close the parenthesis");
        return args;
    };
    Parser.prototype.parse_list_args = function () {
        var args = [this.parse_assignment_expr()];
        while (this.at().type == lexer_1.TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr());
        }
        return args;
    };
    Parser.prototype.parse_member_expr = function () {
        var obj = this.parse_primary_expr();
        while (this.at().type == lexer_1.TokenType.Dot || this.at().type == lexer_1.TokenType.OpenSquare) {
            var operator = this.eat();
            var property = void 0;
            var isComputed = void 0;
            if (operator.type == lexer_1.TokenType.Dot) {
                isComputed = false;
                property = this.parse_primary_expr();
                if (property.kind !== "Identifier") {
                    throw new Error("there has to be an identifier or i won't understand shit!");
                }
            }
            else {
                isComputed = true;
                property = this.parse_expr();
                this.expect(lexer_1.TokenType.CloseSquare, "Bro... as in like: Close the fucking square bracket");
            }
            obj = { kind: "Member", isComputed: isComputed, property: property };
        }
        return obj;
    };
    // Orders Of Precedence
    // AdditiveExpr
    // MultiplicativeExpr
    // PrimaryExpr
    // Parse Literal Values & Grouping Expressions
    Parser.prototype.parse_primary_expr = function () {
        var _a, _b;
        var tk = (_a = this.at()) === null || _a === void 0 ? void 0 : _a.type;
        // Determine which token we are currently at and return literal value
        switch (tk) {
            // User defined values.
            case lexer_1.TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value };
            case lexer_1.TokenType.Null:
                this.eat(); // advance past null 
                return { kind: "NullLiteral", value: "null" };
            // Add to parser2.ts in the parse_primary_expr() method
            case lexer_1.TokenType.Boolean:
                return {
                    kind: "BooleanLiteral",
                    value: this.eat().value === "true" || this.eat().value === "false"
                };
            // Constants and Numeric Constants
            case lexer_1.TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value),
                };
            // Strings
            case lexer_1.TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: this.eat().value
                };
            // Grouping Expressions
            case lexer_1.TokenType.Openparen: {
                this.eat(); // eat the opening paren
                var value = this.parse_expr();
                this.expect(lexer_1.TokenType.Closeparen, "Unexpected token found inside parenthesised expression. Expected closing parenthesis."); // closing paren
                return value;
            }
            // Unidentified Tokens and Invalid Code Reached
            default:
                console.log(this.at());
                throw new Error("Unexpected token found during parsing: ".concat((_b = this.at()) === null || _b === void 0 ? void 0 : _b.value));
        }
    };
    return Parser;
}());
exports.default = Parser;
