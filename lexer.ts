//import fs = require('fs');
export enum TokenType {
    Null,
    Number, 
    Identifier,
    String, 
    Equals,
    EqualsEquals,    // ==
    NotEquals,       // !=
    LessThan,        // <
    GreaterThan,     // >
    LessOrEqual,     // <=
    GreaterOrEqual,  // => 
    Comma,
    Colon,
    Dot, 
    FOR,
    IF,
    ELSE,
    ELIF,
    WHILE,
    Function,
    Openparen, 
    Closeparen, 
    OpenBrace,
    CloseBrace,
    OpenSquare,
    CloseSquare,
    BinaryOper,
    Boolean,
    Let,
    Const,
    EOF
}

export interface Token {
    value: string,
    type: TokenType
}

const KEYWORDS : Record<string, TokenType> = {
    "let" : TokenType.Let,
    "const": TokenType.Const,
    "null" : TokenType.Null,
    "true" : TokenType.Boolean,
    "false" : TokenType.Boolean,
    "fn": TokenType.Function,
    "if": TokenType.IF,
    "for": TokenType.FOR,
    "else": TokenType.ELSE,
    "elif": TokenType.ELIF,
    "while": TokenType.WHILE
}

export function token(value: string, type: TokenType):Token {

    return {value, type};
    
} 

function isAlpha(src: string): boolean{
    if (!src) return false;
    return src.toUpperCase() !== src.toLowerCase();
    
}

function isInt(str: string){
    const c = str.charCodeAt(0);
    const bound = ["0".charCodeAt(0) , "9".charCodeAt(0)];
    return (c >= bound[0]! && c <= bound[1]! )
}

function isSkippable(STR: string) {
    return STR == " " || STR== "\n" || STR == "\t" ||  STR == "\r"
}

export function tokenize(sourceCode: string): Token[]{
    const tokens = new Array<Token>();
    const src = sourceCode.split('');
    

    while ( src.length > 0 ) {
    if (src[0] == "(") {
        tokens.push(token(src.shift()!, TokenType.Openparen));
    }
    else if (src[0] == ")") {
        tokens.push(token(src.shift()!, TokenType.Closeparen));
    }
    else if (src[0] == "}") {
        tokens.push(token(src.shift()!, TokenType.CloseBrace));
    }
    else if (src[0] == "{") {
        tokens.push(token(src.shift()!, TokenType.OpenBrace));
    }
    else if (src[0] == "[") {
       tokens.push(token(src.shift()!, TokenType.OpenSquare))
    }
    else if (src[0] == "]") {
        tokens.push(token(src.shift()!, TokenType.CloseSquare))
    }
    else if (src[0] == ",") {
        tokens.push(token(src.shift()!, TokenType.Comma));
    }
    else if (src[0] == ":") {
        tokens.push(token(src.shift()!, TokenType.Colon));
    }
    else if (src[0] == "=" && src[1] == "=") {
        src.shift(); src.shift()
       tokens.push(token("!=", TokenType.EqualsEquals))
    }
    else if (src[0] == "!" && src[1] == "=") {
        src.shift(); src.shift()
       tokens.push(token("!=", TokenType.NotEquals))
    }
    else if (src[0] == "<") {
       tokens.push(token(src.shift()!, TokenType.LessThan))
    }
    else if (src[0] == ">") {
       tokens.push(token(src.shift()!, TokenType.GreaterThan))
    }
    else if (src[0] == "<" && src[1] == "=") {
        src.shift(); src.shift()
       tokens.push(token("<=", TokenType.LessOrEqual))
    }
    else if (src[0] == "=" && src[1] == ">") {
        src.shift(); src.shift()
       tokens.push(token("=>", TokenType.NotEquals))
    }
    else if (src[0] == ".") {
       tokens.push(token(src.shift()!, TokenType.Dot))
    }
    else if (src[0] == "fn") {
       tokens.push(token(src.shift()!, TokenType.Function)) 
    }
    else if (src[0] == "for") {
        tokens.push(token(src.shift()!, TokenType.FOR))
    }
    else if (src[0] == "if") {
        tokens.push(token(src.shift()!, TokenType.IF))
    }
    else if (src[0] == "else") {
        tokens.push(token(src.shift()!, TokenType.ELSE))
    }
    else if (src[0] == "elif") {
        tokens.push(token(src.shift()!, TokenType.ELIF))
    }
    else if (src[0] == "while") {
        tokens.push(token(src.shift()!, TokenType.WHILE))
    }
    else if (src[0] == "true" || src[0] == "false"){
        tokens.push(token(src.shift()!, TokenType.Boolean))
    }
    else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/"|| src[0]== "%"){
        tokens.push(token(src.shift()!, TokenType.BinaryOper));
    }
    else if (src[0] == "=") {
        tokens.push(token(src.shift()!, TokenType.Equals))
    }
    else if(src[0] == "'" || src[0] == '"'){
        const quoteType = src.shift()!;
        let str= ""
        while (src.length > 0 && src[0] !== quoteType){
            str += src.shift()!
        }
        if (src.length > 0){
            src.shift()!
        }
        tokens.push(token(str, TokenType.String))

    }
    else if (isInt(src[0]!)) {
            let num = "";
            while (src.length > 0 && isInt(src[0]!)) {
                num += src.shift()
            };
            tokens.push(token(num, TokenType.Number));
        }

        else if (isAlpha(src[0]!)) {
            let ident = "";
            while (src.length > 0 && isAlpha(src[0]!)) {
                ident += src.shift()
            }

            const reserved = KEYWORDS[ident];
             if (typeof reserved == "number") {
               tokens.push(token(ident, reserved));
            } else {
            // Unreconized name must mean user defined symbol.
            tokens.push(token(ident, TokenType.Identifier));
        }
        }

        else if (isSkippable(src[0]!)) {
            src.shift();}
            else {
                console.log("Uncategorized character", src[0]);
                src.shift();
                }
            
        }
        tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
        return tokens

} 


//const source = fs.readFileSync('./test.txt', 'utf-8') 
//for (const token of tokenize(source)) {
//    console.log(token);
// }
