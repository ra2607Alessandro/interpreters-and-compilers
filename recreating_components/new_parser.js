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
        if (current.token == new_lexer_1.AllTokens.FN) {
            return this.parse_function();
        }
        return {
            kind: "ExpressionStatement",
            expression: this.parse_additive_expr()
        };
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
        else if (obj.token == new_lexer_1.AllTokens.Identifier) {
            var name_1 = this.eat().value;
            if (this.at().token == new_lexer_1.AllTokens.Open_Paren) {
                var fn = this.parse_function_call(name_1);
                return fn;
            }
            return { kind: "identifier", value: obj.value };
        }
        throw new Error("Are you gonna put something in there?");
    };
    Parsing.prototype.parse_object = function () {
        this.expect(new_lexer_1.AllTokens.OpenBrace, "OpenBrace Expected");
        var key;
        var properties = new Array();
        while (this.not_complete() && this.at().token !== new_lexer_1.AllTokens.CloseBrace) {
            key = this.expect(new_lexer_1.AllTokens.Identifier, "Identifier expected").value;
            var check = this.at();
            switch (check.token) {
                case new_lexer_1.AllTokens.Colon:
                    this.eat();
                    var val = this.parse_primary_expr();
                    properties.push({ key: key, val: val });
                    break;
                case new_lexer_1.AllTokens.Comma:
                    this.eat();
                    properties.push({ key: key, value: undefined });
                    continue;
                case new_lexer_1.AllTokens.CloseBrace:
                    properties.push({ key: key, value: undefined });
                    break;
                default:
                    throw new Error("Token not accepted you bitch");
            }
            if (this.at().token !== new_lexer_1.AllTokens.CloseBrace && this.at().value) {
                this.expect(new_lexer_1.AllTokens.Comma, "You need to put in a comma");
            }
            if (this.at().token == new_lexer_1.AllTokens.Comma) {
                this.eat();
            }
        }
        this.eat();
        return { kind: "Object", properties: properties };
    };
    Parsing.prototype.parse_function = function () {
        this.eat();
        var name = this.expect(new_lexer_1.AllTokens.Identifier, "The name of a function must be an identifier");
        this.expect(new_lexer_1.AllTokens.Open_Paren, "You need to insert the parameters of the function. Open '('");
        var params = [];
        while (this.at().token !== new_lexer_1.AllTokens.Close_Paren) {
            if (this.at().token == new_lexer_1.AllTokens.Identifier) {
                var param = this.at().value;
                params.push(param);
                this.eat();
            }
            if (this.at().token == new_lexer_1.AllTokens.Comma) {
                this.expect(new_lexer_1.AllTokens.Identifier, "You either put another identifier or you close the params");
            }
        }
        this.expect(new_lexer_1.AllTokens.Close_Paren, "'(' expected");
        this.expect(new_lexer_1.AllTokens.OpenBrace, "You need to start the statements body with '{'");
        var body = [];
        while (this.at().token !== new_lexer_1.AllTokens.CloseBrace) {
            var stat = this.parse_statements();
            body.push(stat);
        }
        this.expect(new_lexer_1.AllTokens.CloseBrace, "'}' is expected");
        return { kind: "Function", ident: name.value, params: params, body: body };
    };
    Parsing.prototype.parse_function_call = function (n) {
        this.expect(new_lexer_1.AllTokens.Open_Paren, "'(' is expected");
        var args = [];
        while (this.at().token !== new_lexer_1.AllTokens.Close_Paren) {
            args.push(this.parse_additive_expr());
            if (this.at().token == new_lexer_1.AllTokens.Comma) {
                this.eat();
            }
            else if (this.at().token == new_lexer_1.AllTokens.CloseBrace) {
                break;
            }
            else {
                console.log(this.at());
                throw new Error("Bro, literally just no !");
            }
        }
        this.expect(new_lexer_1.AllTokens.Close_Paren, "')' is expected");
        return { kind: "FunctionCall", callee: n, args: args };
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
