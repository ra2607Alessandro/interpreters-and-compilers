"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
exports.token = token;
exports.tokenize = tokenize;
//import fs = require('fs');
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Null"] = 0] = "Null";
    TokenType[TokenType["Number"] = 1] = "Number";
    TokenType[TokenType["Identifier"] = 2] = "Identifier";
    TokenType[TokenType["String"] = 3] = "String";
    TokenType[TokenType["Equals"] = 4] = "Equals";
    TokenType[TokenType["EqualsEquals"] = 5] = "EqualsEquals";
    TokenType[TokenType["NotEquals"] = 6] = "NotEquals";
    TokenType[TokenType["LessThan"] = 7] = "LessThan";
    TokenType[TokenType["GreaterThan"] = 8] = "GreaterThan";
    TokenType[TokenType["LessOrEqual"] = 9] = "LessOrEqual";
    TokenType[TokenType["GreaterOrEqual"] = 10] = "GreaterOrEqual";
    TokenType[TokenType["Comma"] = 11] = "Comma";
    TokenType[TokenType["Colon"] = 12] = "Colon";
    TokenType[TokenType["Dot"] = 13] = "Dot";
    TokenType[TokenType["FOR"] = 14] = "FOR";
    TokenType[TokenType["IF"] = 15] = "IF";
    TokenType[TokenType["ELSE"] = 16] = "ELSE";
    TokenType[TokenType["WHILE"] = 17] = "WHILE";
    TokenType[TokenType["Function"] = 18] = "Function";
    TokenType[TokenType["Openparen"] = 19] = "Openparen";
    TokenType[TokenType["Closeparen"] = 20] = "Closeparen";
    TokenType[TokenType["OpenBrace"] = 21] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 22] = "CloseBrace";
    TokenType[TokenType["OpenSquare"] = 23] = "OpenSquare";
    TokenType[TokenType["CloseSquare"] = 24] = "CloseSquare";
    TokenType[TokenType["BinaryOper"] = 25] = "BinaryOper";
    TokenType[TokenType["Boolean"] = 26] = "Boolean";
    TokenType[TokenType["Let"] = 27] = "Let";
    TokenType[TokenType["Const"] = 28] = "Const";
    TokenType[TokenType["EOF"] = 29] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var KEYWORDS = {
    "let": TokenType.Let,
    "const": TokenType.Const,
    "null": TokenType.Null,
    "true": TokenType.Boolean,
    "false": TokenType.Boolean,
    "fn": TokenType.Function,
    "if": TokenType.IF,
    "for": TokenType.FOR,
    "else": TokenType.ELSE,
    "while": TokenType.WHILE
};
function token(value, type) {
    return { value: value, type: type };
}
function isAlpha(src) {
    if (!src)
        return false;
    return src.toUpperCase() !== src.toLowerCase();
}
function isInt(str) {
    var c = str.charCodeAt(0);
    var bound = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return (c >= bound[0] && c <= bound[1]);
}
function isSkippable(STR) {
    return STR == " " || STR == "\n" || STR == "\t" || STR == "\r";
}
function tokenize(sourceCode) {
    var tokens = new Array();
    var src = sourceCode.split('');
    while (src.length > 0) {
        if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.Openparen));
        }
        else if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.Closeparen));
        }
        else if (src[0] == "}") {
            tokens.push(token(src.shift(), TokenType.CloseBrace));
        }
        else if (src[0] == "{") {
            tokens.push(token(src.shift(), TokenType.OpenBrace));
        }
        else if (src[0] == "[") {
            tokens.push(token(src.shift(), TokenType.OpenSquare));
        }
        else if (src[0] == "]") {
            tokens.push(token(src.shift(), TokenType.CloseSquare));
        }
        else if (src[0] == ",") {
            tokens.push(token(src.shift(), TokenType.Comma));
        }
        else if (src[0] == ":") {
            tokens.push(token(src.shift(), TokenType.Colon));
        }
        else if (src[0] == "=" && src[1] == "=") {
            src.shift();
            src.shift();
            tokens.push(token("!=", TokenType.EqualsEquals));
        }
        else if (src[0] == "!" && src[1] == "=") {
            src.shift();
            src.shift();
            tokens.push(token("!=", TokenType.NotEquals));
        }
        else if (src[0] == "<") {
            tokens.push(token(src.shift(), TokenType.LessThan));
        }
        else if (src[0] == ">") {
            tokens.push(token(src.shift(), TokenType.GreaterThan));
        }
        else if (src[0] == "<" && src[1] == "=") {
            src.shift();
            src.shift();
            tokens.push(token("<=", TokenType.LessOrEqual));
        }
        else if (src[0] == "=" && src[1] == ">") {
            src.shift();
            src.shift();
            tokens.push(token("=>", TokenType.NotEquals));
        }
        else if (src[0] == ".") {
            tokens.push(token(src.shift(), TokenType.Dot));
        }
        else if (src[0] == "fn") {
            tokens.push(token(src.shift(), TokenType.Function));
        }
        else if (src[0] == "for") {
            tokens.push(token(src.shift(), TokenType.FOR));
        }
        else if (src[0] == "if") {
            tokens.push(token(src.shift(), TokenType.IF));
        }
        else if (src[0] == "else") {
            tokens.push(token(src.shift(), TokenType.ELSE));
        }
        else if (src[0] == "while") {
            tokens.push(token(src.shift(), TokenType.WHILE));
        }
        else if (src[0] == "true" || src[0] == "false") {
            tokens.push(token(src.shift(), TokenType.Boolean));
        }
        else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOper));
        }
        else if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals));
        }
        else if (src[0] == "'" || src[0] == '"') {
            var quoteType = src.shift();
            var str = " ";
            while (src.length > 0 && src[0] !== quoteType) {
                str += src.shift();
            }
            if (src.length > 0) {
                src.shift();
            }
            tokens.push(token(str, TokenType.String));
        }
        else if (isInt(src[0])) {
            var num = "";
            while (src.length > 0 && isInt(src[0])) {
                num += src.shift();
            }
            ;
            tokens.push(token(num, TokenType.Number));
        }
        else if (isAlpha(src[0])) {
            var ident = "";
            while (src.length > 0 && isAlpha(src[0])) {
                ident += src.shift();
            }
            var reserved = KEYWORDS[ident];
            if (typeof reserved == "number") {
                tokens.push(token(ident, reserved));
            }
            else {
                // Unreconized name must mean user defined symbol.
                tokens.push(token(ident, TokenType.Identifier));
            }
        }
        else if (isSkippable(src[0])) {
            src.shift();
        }
        else {
            console.log("Uncategorized character", src[0]);
            src.shift();
        }
    }
    tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
    return tokens;
}
//const source = fs.readFileSync('./test.txt', 'utf-8') 
//for (const token of tokenize(source)) {
//    console.log(token);
// }
