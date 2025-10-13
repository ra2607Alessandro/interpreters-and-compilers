"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_ts_1 = require("./lexer.ts");
var Parser = /** @class */ (function () {
    function Parser() {
        this.tokens = [];
    }
    Parser.prototype.not_eof = function () {
        return this.tokens[0].type !== lexer_ts_1.TokenType.EOF;
    };
    Parser.prototype.at = function () {
        return this.tokens[0];
    };
    Parser.prototype.eat = function () {
        var prev = this.tokens.shift();
        return prev;
    };
    Parser.prototype.produceAST = function (sourceCode) {
        var program = {
            kind: "Program",
            body: []
        };
        while (this.not_eof) {
            program.body.push(this.ParseStat());
        }
        return program;
    };
    Parser.prototype.ParseStat = function () {
        return this.parseExpr();
    };
    Parser.prototype.parseExpr = function () {
        return this.parseAddicitiveExpr();
    };
    Parser.prototype.parseAddicitiveExpr = function () {
        var left = this.parseMultiplicativeExpr();
        while (this.at().value == "+" || this.at().value == "-") {
            var operator = this.eat().value;
            var right = this.parseMultiplicativeExpr();
            left = {
                kind: "BinaryExpr",
                left: left,
                right: right,
                operator: operator
            };
        }
    };
    Parser.prototype.parseMultiplicativeExpr = function () {
        var left = this.parseMultiplicativeExpr();
        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            var operator = this.eat().value;
            var right = this.parseMultiplicativeExpr();
            left = {
                kind: "BinaryExpr",
                left: left,
                right: right,
                operator: operator
            };
        }
    };
    Parser.prototype.parsePrimExpr = function () {
        var tk = this.at().type;
        switch (tk) {
            case lexer_ts_1.TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value };
            case lexer_ts_1.TokenType.Number:
                return { kind: "NumericLiteral", value: parseFloat(this.eat().value) };
            case lexer_ts_1.TokenType.Openparen:
                {
                    this.eat();
                    var value = this.parseExpr();
                    this.eat(lexer_ts_1.TokenType.Closeparen, "Unexpected");
                    return value;
                }
            default:
                console.error("Unexpected token found during parsing", this.at());
        }
    };
    Parser.prototype.expect = function (type, err) {
        var prev = this.tokens.shift();
        if (!prev || prev.type == type) {
            console.error("Parser Error: \n", err, prev, "- Expecting:", type);
        }
        return prev;
    };
    return Parser;
}());
exports.default = Parser;
