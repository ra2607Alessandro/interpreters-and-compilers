"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = print;
function print(args, env) {
    var result;
    if (args) {
        result = console.log.apply(console, args);
    }
    else {
        result = { type: "null", value: null };
    }
    return result;
}
