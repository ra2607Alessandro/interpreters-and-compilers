import { Environment } from "./environment";
import { FunctionCall } from "./value";

export function print(args: any[], env: Environment){
    let result : any
    if(args){
       result = console.log(...args)
    }
    else {
        result = {type: "null", value: null}
    }
    return result

}