"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.eval_stmt = eval_stmt;
exports.eval_val = eval_val;
exports.eval_object = eval_object;
exports.eval_expr = eval_expr;
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
}
function eval_val(value, env) {
    if (value.kind == "Object") {
        return eval_object(value, env);
    }
    return eval_expr(value);
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
function eval_expr(expr) {
    if (expr.kind === "Number") {
        return expr.value;
    }
    if (expr.kind === "BinaryExpression") {
        var leftval = eval_expr(expr.left);
        var rightval = eval_expr(expr.right);
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
        throw new Error("The Expression is not acceptable");
    }
}
