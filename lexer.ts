
//import fs = require('fs');

export enum TokenType {
    Number, 
    Identifier, 
    Equals,
    Openparen, 
    Closeparen, 
    BinaryOper,
    Let,
    EOF
}

export interface Token {
    value: string,
    type: TokenType
}

const KEYWORDS : Record<string, TokenType> = {
    "let" : TokenType.Let,
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
    return STR == " " || STR== "\n" || STR == "\t"
}

export function tokenize(sourceCode: string): Token[]{
    const tokens = new Array<Token>();
    const src = sourceCode.split('');
    

    while ( src.length > 0 ) {
    if (src[0] == "(") {
        tokens.push(token(src.shift()!, TokenType.Openparen));
    }
    if (src[0] == ")") {
        tokens.push(token(src.shift()!, TokenType.Closeparen));
    }
    if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/"|| src[0]== "%"){
        tokens.push(token(src.shift()!, TokenType.BinaryOper));
    }
    if (src[0] == "=") {
        tokens.push(token(src.shift()!, TokenType.Equals))
    }
    else {
        if (isInt(src[0]!)) {
            let num = "";
            while (src.length > 0 && isInt(src[0]!)) {
                num += src.shift()
            };
            tokens.push(token(num, TokenType.Number));
        }

        if (isAlpha(src[0]!)) {
            let ident = "";
            while (src.length > 0 && isAlpha(src[0]!)) {
                ident += src.shift()
            }

            const reserved = KEYWORDS[ident];
            if (reserved == undefined) {
                tokens.push(token(ident, TokenType.Identifier))
            }
            else {
              tokens.push(token(ident, reserved))
            }
        }

        else if (isSkippable(src[0]!)) {
            src.shift();}
            else {
                console.log("Uncategorized character", src[0]);
                }
            }
        }
    
        return tokens

} 


//const source = fs.readFileSync('./test.txt', 'utf-8') 
//for (const token of tokenize(source)) {
//    console.log(token);
// }
