"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
var Env = /** @class */ (function () {
    function Env(parents) {
        this.parent = parents;
        this.variabs = new Map();
    }
    Env.prototype.define = function (name, value) {
        if (this.variabs.has(name)) {
            throw "Name mismatch: A variable as already been defined with that name";
        }
        this.variabs.set(name, value);
    };
    Env.prototype.lookup = function (name) {
        if (this.variabs.has(name)) {
            return this.variabs.get(name);
        }
        if (this.parent) {
            return this.parent.lookup(name);
        }
        else {
            throw new Error("This variable doesn't exist");
        }
    };
    Env.prototype.assign = function (name, value) {
        var _a;
        if (this.variabs.has(name)) {
            this.variabs.set(name, value);
            return;
        }
        if ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.lookup(name)) {
            this.parent.assign(name, value);
            return;
        }
        throw new Error("Couldn't find the value ".concat(name));
    };
    Env.prototype.update = function (name, value) {
        if (this.variabs.has(name)) {
            this.variabs.set(name, value);
        }
        else {
            this.variabs.set(name, value);
        }
    };
    return Env;
}());
exports.Env = Env;
