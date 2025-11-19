"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Environment = /** @class */ (function () {
    function Environment(parentENV) {
        this.parent = parentENV,
            this.variables = new Map(),
            this.constants = new Set();
    }
    Environment.prototype.declareVar = function (varname, value, constant) {
        if (this.variables.has(varname)) {
            throw "".concat(varname, " has already been defined");
        }
        this.variables.set(varname, value);
        if (constant === true) {
            this.constants.add(varname);
        }
        return value;
    };
    Environment.prototype.LooksUp = function (varname) {
        var env = this.resolve(varname);
        return env.variables.get(varname);
    };
    Environment.prototype.resolve = function (varname) {
        if (this.variables.has(varname)) {
            return this;
        }
        if (this.parent == undefined) {
            throw "bro, ".concat(varname, " doesn't exist");
        }
        return this.parent.resolve(varname);
    };
    Environment.prototype.assignVar = function (varname, value) {
        var env = this.resolve(varname);
        if (env.constants.has(varname)) {
            throw new Error("Bro, we can't assign a variable to a constant");
        }
        env.variables.set(varname, value);
        return value;
    };
    return Environment;
}());
exports.Environment = Environment;
