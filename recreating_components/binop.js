"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.eval_stmt = eval_stmt;
exports.eval_val = eval_val;
exports.eval_object = eval_object;
exports.eval_function_dec = eval_function_dec;
exports.eval_function_call = eval_function_call;
exports.eval_expr = eval_expr;
exports.make_NTV_fn = make_NTV_fn;
var env_1 = require("./env");
function evaluate(program, env) {
    var last_result = undefined;
    for (var _i = 0, _a = program.body; _i < _a.length; _i++) {
        var stat_1 = _a[_i];
        last_result = eval_stmt(stat_1, env);
    }
    return last_result;
}
function eval_stmt(stmt, env) {
    if (stmt.kind === "Variable-Declaration") {
        var var_dec = stmt;
        var value = eval_val(var_dec.value, env);
        env.define(var_dec.ident, value);
        return value;
    }
    if (stmt.kind === "Function") {
        var fn = stmt;
        var fn_dec = {
            type: "function",
            ident: fn.ident,
            params: fn.params,
            body: fn.body,
            declarationEnv: env
        };
        env.define(fn.ident, fn_dec);
        return fn_dec;
    }
    if (stmt.kind === "FunctionCall") {
        return eval_function_call(stmt, env);
    }
    if (stmt.kind === "ExpressionStatement") {
        var exprStmt = stmt; // You need the ExpressionStatement type
        return eval_val(exprStmt.expression, env);
    }
    throw new Error("Unknown statement type: ".concat(stmt.kind));
}
function eval_val(value, env) {
    if (value.kind == "Object") {
        return eval_object(value, env);
    }
    return eval_expr(value, env);
}
function eval_object(obj, env) {
    var result = new Map();
    var prop = obj.properties;
    for (var i = 0; i < obj.properties.length; i++) {
        var val = void 0;
        if (!(prop[i].value)) {
            val = env.lookup(prop[i].key);
        }
        else {
            val = eval_val(prop[i].value, env);
        }
        result.set(prop[i].key, val);
    }
    return result;
}
function eval_function_dec(fn, env) {
    var fn_env = new env_1.Env(env);
    return { type: "Function", name: fn.ident, params: fn.params, body: fn.body, declarationEnv: fn_env };
}
function eval_function_call(fn, env) {
    var args = [];
    for (var _i = 0, _a = fn.args; _i < _a.length; _i++) {
        var arg = _a[_i];
        args.push(eval_val(arg, env));
    }
    var func = env.lookup(fn.callee);
    if (func.type === "Native-Function") {
        var ntv_fn = func.call;
        if (ntv_fn.has(args)) {
            return args;
        }
        else {
            return false;
        }
    }
    if (func.type === "function") {
        var exec_env = new env_1.Env(func.declarationENV);
        for (var i = 0; i < func.params.length; i++) {
            exec_env.define(func.params[i], args[i]);
        }
        var last = undefined;
        for (var _b = 0, _c = func.body; _b < _c.length; _b++) {
            var stmt = _c[_b];
            last = eval_stmt(stmt, exec_env);
        }
        return last;
    }
    throw new Error("The type is not acceptable");
}
function eval_expr(expr, env) {
    if (expr.kind == "ExpressionStatement") {
        return eval_expr(expr.expression, env);
    }
    if (expr.kind == "FunctionCall") {
        return eval_stmt(expr, env);
    }
    if (expr.kind === "Number") {
        return expr.value;
    }
    if (expr.kind === "identifier") {
        var ident = expr;
        return env.lookup(ident.value);
    }
    if (expr.kind === "BinaryExpression") {
        var leftval = eval_expr(expr.left, env);
        var rightval = eval_expr(expr.right, env);
        switch (expr.operator) {
            case "+":
                return leftval + rightval;
            case "-":
                return leftval - rightval;
            case "*":
                return leftval * rightval;
            case "/":
                return leftval / rightval;
            default:
                throw "the operator sign ".concat(expr.operator, " is not supported");
        }
    }
    else {
        console.log(expr);
        throw new Error("The Expression is not acceptable");
    }
}
function make_NTV_fn(fn) {
    var set = new Set();
    return { type: "Native-Function", call: set.add(fn) };
}
