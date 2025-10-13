"use strict";
//import fs = require('fs');
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
exports.token = token;
exports.tokenize = tokenize;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Equals"] = 2] = "Equals";
    TokenType[TokenType["Openparen"] = 3] = "Openparen";
    TokenType[TokenType["Closeparen"] = 4] = "Closeparen";
    TokenType[TokenType["BinaryOper"] = 5] = "BinaryOper";
    TokenType[TokenType["Let"] = 6] = "Let";
    TokenType[TokenType["EOF"] = 7] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var KEYWORDS = {
    "let": TokenType.Let,
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
    return STR == " " || STR == "\n" || STR == "\t";
}
function tokenize(sourceCode) {
    var tokens = new Array();
    var src = sourceCode.split('');
    while (src.length > 0) {
        if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.Openparen));
        }
        if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.Closeparen));
        }
        if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOper));
        }
        if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals));
        }
        else {
            if (isInt(src[0])) {
                var num = "";
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift();
                }
                ;
                tokens.push(token(num, TokenType.Number));
            }
            if (isAlpha(src[0])) {
                var ident = "";
                while (src.length > 0 && isAlpha(src[0])) {
                    ident += src.shift();
                }
                var reserved = KEYWORDS[ident];
                if (reserved == undefined) {
                    tokens.push(token(ident, TokenType.Identifier));
                }
                else {
                    tokens.push(token(ident, reserved));
                }
            }
            else if (isSkippable(src[0])) {
                src.shift();
            }
            else {
                console.log("Uncategorized character", src[0]);
            }
        }
    }
    return tokens;
}
//const source = fs.readFileSync('./test.txt', 'utf-8') 
//for (const token of tokenize(source)) {
//    console.log(token);
// }
