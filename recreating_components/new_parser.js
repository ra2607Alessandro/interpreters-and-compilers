"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsing = void 0;
var new_lexer_1 = require("./new_lexer");
var Parsing = /** @class */ (function () {
    function Parsing() {
        this.Tokens = [];
    }
    Parsing.prototype.not_complete = function () {
        return this.Tokens.length > 0 && this.Tokens[0].token !== new_lexer_1.AllTokens.END;
    };
    Parsing.prototype.at = function () {
        return this.Tokens[0];
    };
    Parsing.prototype.eat = function () {
        var advance = this.Tokens.shift();
        return advance;
    };
    Parsing.prototype.expect = function (token, err_message) {
        var last = this.eat();
        if (last.token !== token) {
            throw err_message;
        }
        ;
        return last;
    };
    Parsing.prototype.ProduceAST = function (source_code) {
        this.Tokens = (0, new_lexer_1.lexer)(source_code);
        this.Tokens.push({ value: "END", token: new_lexer_1.AllTokens.END });
        var program = {
            kind: "Program",
            body: []
        };
        while (this.not_complete()) {
            program.body.push(this.parse_statements());
        }
        return program;
    };
    Parsing.prototype.parse_statements = function () {
        var current = this.at();
        if (current.token == new_lexer_1.AllTokens.LET || current.token == new_lexer_1.AllTokens.CONST) {
            return this.parse_var_declaration();
        }
        throw new Error("bro, what the fuck? Whenever you start a statement you need to declare a variable with const or let");
    };
    Parsing.prototype.parse_value = function () {
        var val = this.expect(new_lexer_1.AllTokens.Number, "The expression has to start with a number");
        var next = this.eat();
        if (next.token == new_lexer_1.AllTokens.BinaryOp && this.not_complete()) {
            var second = this.expect(new_lexer_1.AllTokens.Number, "Expression can only take in a number");
            return { kind: "BinaryExpression", n1: { kind: "Number", value: parseFloat(val.value) }, operator: next.value, n2: { kind: "Number", value: parseFloat(second.value) } };
        }
        else {
            return { kind: "Number", value: parseFloat(val.value) };
        }
    };
    Parsing.prototype.parse_var_declaration = function () {
        var isCostant = this.at().token == new_lexer_1.AllTokens.CONST;
        this.eat();
        var ident = this.expect(new_lexer_1.AllTokens.Identifier, "Expected value after variable declaration is an Identifier, not: ".concat(this.at().token)).value;
        this.expect(new_lexer_1.AllTokens.Equal, "Expected token is ' = ' , not: ".concat(this.at().value, " "));
        var value = this.parse_value();
        return {
            kind: "Variable-Declaration",
            isCostant: isCostant,
            ident: ident,
            value: value
        };
    };
    return Parsing;
}());
exports.Parsing = Parsing;
