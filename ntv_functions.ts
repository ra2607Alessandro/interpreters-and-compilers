import { Environment } from "./environment";
import { FunctionCall } from "./value";

export function print(args: any[], env: Environment){
    if(args){
        console.log(...args)
    }
    else {
        return {type: "null", value: null}
    }

}