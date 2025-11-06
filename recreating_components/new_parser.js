"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsing = void 0;
var env_1 = require("./env");
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
        console.log(current);
        throw new Error("bro, what the fuck? Whenever you start a statement you need to declare a variable with const or let");
    };
    Parsing.prototype.parse_additive_expr = function () {
        var left = this.parse_multiplicative_expr();
        while (this.at() && (this.at().value == "+" || this.at().value == "-")) {
            var operator = this.eat();
            var right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpression",
                left: left,
                operator: operator.value,
                right: right
            };
        }
        return left;
    };
    Parsing.prototype.parse_multiplicative_expr = function () {
        var left = this.parse_primary_expr();
        while (this.at() && (this.at().value == "*" || this.at().value == "/")) {
            var operator = this.eat();
            var right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpression",
                left: left,
                operator: operator.value,
                right: right
            };
        }
        return left;
    };
    Parsing.prototype.parse_primary_expr = function () {
        var obj = this.at();
        if (obj.token == new_lexer_1.AllTokens.Number) {
            this.eat();
            return { kind: "Number", value: parseFloat(obj.value) };
        }
        else if (obj.token == new_lexer_1.AllTokens.Open_Paren) {
            this.eat();
            var expr = this.parse_additive_expr();
            this.expect(new_lexer_1.AllTokens.Close_Paren, "Expected a closing parenthesis");
            return expr;
        }
        else if (obj.token == new_lexer_1.AllTokens.OpenBrace) {
            var object = this.parse_object();
            return object;
        }
        throw new Error("Are you gonna put something in there?");
    };
    Parsing.prototype.parse_object = function () {
        this.expect(new_lexer_1.AllTokens.OpenBrace, "OpenBrace Expected");
        while (this.not_complete() && this.at().token !== new_lexer_1.AllTokens.CloseBrace) {
            var key = this.expect(new_lexer_1.AllTokens.Identifier, "Identifier expected");
            var value = void 0;
            if (this.at().token == new_lexer_1.AllTokens.Comma || this.eat().token == new_lexer_1.AllTokens.CloseBrace) {
                var env = new env_1.Env();
                value = env.lookup(key.value);
            }
            if (this.at().token == new_lexer_1.AllTokens.Colon) {
                value = this.parse_primary_expr();
            }
            value = this.parse_primary_expr();
            this.expect(new_lexer_1.AllTokens.CloseBrace, "You need to close the brace");
            var properties = [{ kind: "Property", key: key.value, value: value }];
            return { kind: "Object", properties: properties };
        }
        throw new Error("Object wasn't costructed well");
    };
    Parsing.prototype.parse_var_declaration = function () {
        var isCostant = this.at().token == new_lexer_1.AllTokens.CONST;
        this.eat();
        var ident = this.expect(new_lexer_1.AllTokens.Identifier, "Expected value after variable declaration is an Identifier, not: ".concat(this.at().token)).value;
        this.expect(new_lexer_1.AllTokens.Equal, "Expected token is ' = ' , not: ".concat(this.at().value, " "));
        var value = this.parse_additive_expr();
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
