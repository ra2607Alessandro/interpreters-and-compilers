export enum AllTokens {
    Open_Paren,
    Close_Paren,
    Number,
    Identifier,
    Equal,
    LET,
    CONST,
    Comma
}

export interface Token {
    value: string,
    token : AllTokens
}

export function makeToken(val: string, tok: AllTokens): Token {
       return {value: val, token: tok}
}

const KORT : Record<string, AllTokens> = {
        "let" : AllTokens.LET,
        "const" : AllTokens.CONST
}

export function IsNumber(src: string) {
      const c = src.charCodeAt(0);
      const bound = ["0".charCodeAt(0), "9".charCodeAt(0)]
      return c >= bound[0] && c <= bound[1] 

}

export function IsAlphanumeric(src: string): boolean {
     
     if (src.toUpperCase() !== src.toLowerCase()) {return true};
     
     return false;
}

export function isSkippable(src: string){
    return src === " " || src === "\n" || src === "\r" || src === "\t" 
}


export function lexer(source_code: string): Token[] {
      const stat = new Array<Token>();
      const src = source_code.split('')

      while (src.length > 0) {

        if (isSkippable(src[0]!)) {
            src.shift();
            continue
        }

        if (src[0]! == "("){
            stat.push(makeToken(src.shift()!, AllTokens.Open_Paren))
        } 
        else if (src[0]! == ")") {
            stat.push(makeToken(src.shift()!, AllTokens.Close_Paren))
        }
        else if (src[0]! == ",") {
            stat.push(makeToken(src.shift()!, AllTokens.Comma))
        }
        else if (src[0]! == "=") {
            stat.push(makeToken(src.shift()!, AllTokens.Equal))
        }
        else 
        if (IsAlphanumeric(src[0]!)) {
                 let ident = "";
                 while (src.length > 0 && (IsAlphanumeric(src[0]) || IsNumber(src[0]))) 
                { ident += src.shift()}

                 const keyword = KORT[ident]
                 if (keyword !== undefined){
                    stat.push(makeToken(ident, keyword)) }
                 else 
                 {    stat.push(makeToken(ident, AllTokens.Identifier)) }
          
        }

        else if (IsNumber(src[0]!)) {
           let num = ""
           while (src.length > 0 && IsNumber(src[0])){
            num += src.shift()
           }

           stat.push(makeToken(num, AllTokens.Number))
       }
       else {
        console.log ("Sorry, the character's token couldn't be recognized. The character:",src[0])
        src.shift()   
    }
      }
      return stat

}

const string = "let continents = 45";
console.log(lexer(string))

