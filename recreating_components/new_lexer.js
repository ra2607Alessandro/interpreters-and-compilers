"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllTokens = void 0;
exports.makeToken = makeToken;
exports.IsNumber = IsNumber;
exports.IsAlphanumeric = IsAlphanumeric;
exports.isSkippable = isSkippable;
exports.lexer = lexer;
var AllTokens;
(function (AllTokens) {
    AllTokens[AllTokens["Open_Paren"] = 0] = "Open_Paren";
    AllTokens[AllTokens["Close_Paren"] = 1] = "Close_Paren";
    AllTokens[AllTokens["Number"] = 2] = "Number";
    AllTokens[AllTokens["Identifier"] = 3] = "Identifier";
    AllTokens[AllTokens["Equal"] = 4] = "Equal";
    AllTokens[AllTokens["LET"] = 5] = "LET";
    AllTokens[AllTokens["CONST"] = 6] = "CONST";
    AllTokens[AllTokens["BinaryOp"] = 7] = "BinaryOp";
    AllTokens[AllTokens["Comma"] = 8] = "Comma";
    AllTokens[AllTokens["END"] = 9] = "END";
})(AllTokens || (exports.AllTokens = AllTokens = {}));
function makeToken(val, tok) {
    return { value: val, token: tok };
}
var KORT = {
    "let": AllTokens.LET,
    "const": AllTokens.CONST
};
function IsNumber(src) {
    var c = src.charCodeAt(0);
    var bound = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bound[0] && c <= bound[1];
}
function IsAlphanumeric(src) {
    if (src.toUpperCase() !== src.toLowerCase()) {
        return true;
    }
    ;
    return false;
}
function isSkippable(src) {
    return src === " " || src === "\n" || src === "\r" || src === "\t";
}
function lexer(source_code) {
    var stat = new Array();
    var src = source_code.split('');
    while (src.length > 0) {
        if (isSkippable(src[0])) {
            src.shift();
            continue;
        }
        if (src[0] == "(") {
            stat.push(makeToken(src.shift(), AllTokens.Open_Paren));
        }
        else if (src[0] == ")") {
            stat.push(makeToken(src.shift(), AllTokens.Close_Paren));
        }
        else if (src[0] == ",") {
            stat.push(makeToken(src.shift(), AllTokens.Comma));
        }
        else if (src[0] == "=") {
            stat.push(makeToken(src.shift(), AllTokens.Equal));
        }
        else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/") {
            stat.push(makeToken(src.shift(), AllTokens.BinaryOp));
        }
        else if (IsAlphanumeric(src[0])) {
            var ident = "";
            while (src.length > 0 && (IsAlphanumeric(src[0]) || IsNumber(src[0]))) {
                ident += src.shift();
            }
            var keyword = KORT[ident];
            if (keyword !== undefined) {
                stat.push(makeToken(ident, keyword));
            }
            else {
                stat.push(makeToken(ident, AllTokens.Identifier));
            }
        }
        else if (IsNumber(src[0])) {
            var num = "";
            while (src.length > 0 && IsNumber(src[0])) {
                num += src.shift();
            }
            stat.push(makeToken(num, AllTokens.Number));
        }
        else {
            console.log("Sorry, the character's token couldn't be recognized. The character:", src[0]);
            src.shift();
        }
    }
    return stat;
}
