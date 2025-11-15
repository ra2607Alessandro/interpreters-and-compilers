"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = print;
function print(args, env) {
    if (args) {
        console.log.apply(console, args);
    }
    else {
        return { type: "null", value: null };
    }
}
