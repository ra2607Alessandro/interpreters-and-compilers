export class Env {
    private parent ?: Env
    private variabs : Map<string, any>

    constructor(parents?: Env){
       this.parent = parents
       this.variabs = new Map()
    }

     define(name: string, value: any) {
        if (this.variabs.has(name)) {
            throw "Name mismatch: A variable as already been defined with that name"
        }
      
            this.variabs.set(name, value)
        
    }

     lookup(name: string):any {
       if (this.variabs.has(name)) {
        return this.variabs.get(name)
       }
       if (this.parent){
        return this.parent.lookup(name)
       }
       else {
       throw new Error ("This variable doesn't exist")
       }
    }

    assign(name: string, value: any):any {
       if (this.variabs.has(name)){
        this.variabs.set(name, value)
        return
       }
       if (this.parent?.lookup(name)){
        this.parent.assign(name, value)
        return;   
    }
       
       throw new Error (`Couldn't find the value ${name}`)
       
    }
    update (name: string, value: any) {
        if(this.variabs.has(name))
        {this.variabs.set(name,value)}
        else {
            this.variabs.set(name, value)
        }
    }
}

const env = new Env();
env.update("a", 20);
env.update("a", 87)
console.log(env.lookup("a"))
