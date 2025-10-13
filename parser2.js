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
        while (this.tokens[0]) {
            return this.tokens[0].type != lexer_1.TokenType.EOF;
        }
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
     *  Also checks the type of expected token and throws if the values dnot match.
     */
    Parser.prototype.expect = function (type, err) {
        var prev = this.tokens.shift();
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
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
    // Handle complex statement types
    Parser.prototype.parse_stmt = function () {
        // skip to parse_expr
        return this.parse_expr();
    };
    // Handle expressions
    Parser.prototype.parse_expr = function () {
        return this.parse_additive_expr();
    };
    // Handle Addition & Subtraction Operations
    Parser.prototype.parse_additive_expr = function () {
        var left = this.parse_multiplicitave_expr();
        while (this.at() &&
            (this.at().value == "+" || this.at().value == "-")) {
            var operator = this.eat().value;
            var right = this.parse_multiplicitave_expr();
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
    Parser.prototype.parse_multiplicitave_expr = function () {
        var left = this.parse_primary_expr();
        while (this.at() &&
            (this.at().value == "/" || this.at().value == "*" || this.at().value == "%")) {
            var operator = this.eat().value;
            var right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left: left,
                right: right,
                operator: operator,
            };
        }
        return left;
    };
    // Orders Of Prescidence
    // AdditiveExpr
    // MultiplicitaveExpr
    // PrimaryExpr
    // Parse Literal Values & Grouping Expressions
    Parser.prototype.parse_primary_expr = function () {
        var tk = this.at().type;
        // Determine which token we are currently at and return literal value
        switch (tk) {
            // User defined values.
            case lexer_1.TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value };
            // Constants and Numeric Constants
            case lexer_1.TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value),
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
                console.error("Unexpected token found during parsing!", this.at());
        }
    };
    return Parser;
}());
exports.default = Parser;
