import { TokenType } from "./lexer";
import { RuntimeVal } from "./value"

export class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>

    constructor(parentENV ?: Environment){
        this.parent = parentENV,
        this.variables = new Map(),
        this.constants = new Set()
    } 

    public declareVar(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
        if (this.variables.has(varname)) {
            throw `${varname} has already been defined`
        }
        
        this.variables.set(varname, value);

        if (constant === true){
            this.constants.add(varname);
        }
        return value
    }

    public LooksUp(varname: string): RuntimeVal {
        
            const env = this.resolve(varname);
             
            return env.variables.get(varname) as RuntimeVal
        
    }

    public resolve(varname: string ): Environment {
        if (this.variables.has(varname)) 
            {return this}
        
       
        if (this.parent == undefined) 
            {throw `bro, ${varname} doesn't exist`}
        

        return this.parent.resolve(varname)
    }

    public assignVar(varname:string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varname);
     if (env.constants.has(varname)) 
            {throw new Error("Bro, we can't assign a variable to a constant")}
        
        env.variables.set(varname, value);
        return value;
        
    }

}