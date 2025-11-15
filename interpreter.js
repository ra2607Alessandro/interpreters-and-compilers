"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
var value_1 = require("./value");
var environment_1 = require("./environment");
function eval_program(program, env) {
    var last_astNode = {
        type: "null", value: null
    };
    for (var _i = 0, _a = program.body; _i < _a.length; _i++) {
        var statement = _a[_i];
        last_astNode = evaluate(statement, env);
    }
    return last_astNode;
}
function eval_numeric_binary_expr(lhs, rhs, operator) {
    var result = 0;
    if (operator == "+") {
        result = lhs.value + rhs.value;
    }
    else if (operator == "-") {
        result = lhs.value - rhs.value;
    }
    else if (operator == "*") {
        result = lhs.value * rhs.value;
    }
    else if (operator == "/") {
        result = lhs.value / rhs.value;
    }
    else {
        result = lhs.value % rhs.value;
    }
    return { value: result, type: "number" };
}
function eval_comparison_sign(lhs, rhs, operator) {
    var end = false;
    if (operator == "==") {
        end = lhs.value == rhs.value;
    }
    else if (operator == "!=") {
        end = lhs.value != rhs.value;
    }
    else if (operator == "=>") {
        end = lhs.value >= rhs.value;
    }
    else if (operator == "<=") {
        end = lhs.value <= rhs.value;
    }
    else if (operator == "<") {
        end = lhs.value < rhs.value;
    }
    else if (operator == ">") {
        end = lhs.value > rhs.value;
    }
    return (0, value_1.MK_BOOL)(end);
}
function eval_binary_expr(binop, env) {
    var lhs = evaluate(binop.left, env);
    var rhs = evaluate(binop.right, env);
    if (lhs.type == "number" && rhs.type == "number") {
        if (binop.operator == "==" || binop.operator == "<" || binop.operator == ">" || binop.operator == "=>" || binop.operator == "<=" || binop.operator == "!=") {
            return eval_comparison_sign(lhs, rhs, binop.operator);
        }
        return eval_numeric_binary_expr(lhs, rhs, binop.operator);
    }
    return { value: null, type: "null" };
}
function evaluate_identifier(ident, env) {
    var val = env.LooksUp(ident.symbol);
    return val;
}
function eval_declar_var(dec, env, constant) {
    var val = dec.value ? evaluate(dec.value, env) : {};
    return env.declareVar(dec.identifier, val, constant);
}
function eval_assignments_expr(node, env) {
    if (node.assigne.kind !== "Identifier") {
        throw "Sorry, the assignment expression has to be an Identifier";
    }
    var varname = node.assigne.symbol;
    return env.assignVar(varname, evaluate(node.value, env));
}
function eval_object(obj, env) {
    var object = { type: "object", properties: new Map() };
    for (var _i = 0, _a = obj.properties; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b.key, value = _b.value;
        var runtimeVal = (value == undefined) ? env.LooksUp(key) : evaluate(value, env);
        object.properties.set(key, runtimeVal);
    }
    return object;
}
function eval_member_expr(obj, env) {
    var object = evaluate(obj.object, env);
    if (object.type !== "object" || !object.properties) {
        throw new Error("the evaluated part ".concat(object, " is not acceptable"));
    }
    var key;
    if (obj.isComputed == true) {
        var propVal = evaluate(obj.property, env);
        if (propVal.type == "string") {
            key = propVal.value;
        }
        else if (propVal.type == "number") {
            key = String(propVal.value);
        }
        else {
            throw ("Computed value is not acceptable, it has to be either a number or a string");
        }
    }
    else if (obj.property) {
        key = obj.property.symbol;
    }
    else {
        throw ("the key has doesn't have any symbol");
    }
    var value = object.properties.get(key);
    if (value !== undefined) {
        return value;
    }
    else {
        throw new Error("Property '".concat(key, "' does not exist on object"));
    }
}
function evaluate_call_expr(call, env) {
    var args = call.arg.map(function (argv) { return evaluate(argv, env); });
    var caller = evaluate(call.calle, env);
    if (caller.type === "native-function") {
        var result = caller.call(args, env);
        return result;
    }
    if (caller.type === "user-function") {
        var func = caller;
        var scope = new environment_1.Environment(func.declarationENV);
        for (var i = 0; i < func.parameters.length; i++) {
            var varname = func.parameters[i];
            scope.declareVar(varname, args[i], false);
        }
        var results = (0, value_1.MK_NULL)();
        for (var _i = 0, _a = func.body; _i < _a.length; _i++) {
            var stat = _a[_i];
            results = evaluate(stat, scope);
        }
        return results;
    }
    throw "Cannot call bro. This value is not a function";
}
function eval_declare_fn(fn, env) {
    var obj = {
        type: "user-function",
        name: fn.name,
        parameters: fn.parameters,
        body: fn.body,
        declarationENV: env
    };
    return env.declareVar(fn.name, obj, true);
}
function evaluate_consequence(stmts, env) {
    var scope = new environment_1.Environment(env);
    var lastResult = (0, value_1.MK_NULL)();
    for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
        var stmt = stmts_1[_i];
        lastResult = evaluate(stmt, scope);
    }
    return lastResult;
}
function eval_if_stmt(stmt, env) {
    var cond = evaluate(stmt.condition, env);
    if (cond.type !== "boolean") {
        throw new Error("The condition of an if statement must be of boolean type");
    }
    var condintion = cond.value;
    if (condintion === true) {
        var alternative = evaluate_consequence(stmt.consequence, env);
        return alternative;
    }
    if (stmt.else) {
        return evaluate_consequence(stmt.else.stmt, env);
    }
    return (0, value_1.MK_NULL)();
}
function eval_for_loop(loop, env) {
    var scope = new environment_1.Environment(env);
    var init;
    if (loop.init.kind == "VariableDeclare") {
        init = eval_declar_var(loop.init, scope);
    }
    else {
        init = evaluate(loop.init, scope);
    }
    while (true) {
        var cond = evaluate(loop.condition, scope);
        if (cond.type !== "boolean") {
            throw new Error("Condition has to be of type boolean");
        }
        var condval = evaluate(loop.condition, scope).value;
        if (condval == true) {
            var body_scope = new environment_1.Environment(scope);
            evaluate_consequence(loop.body, body_scope);
            evaluate(loop.increment, scope);
        }
        else {
            return (0, value_1.MK_NULL)();
        }
    }
}
function eval_while_stmt(stmt, env) {
    while (true) {
        var cond = evaluate(stmt.condition, env);
        if (cond.type !== "boolean") {
            throw new Error("Condition has to be of type boolean");
        }
        var condval = evaluate(stmt.condition, env).value;
        if (condval == false) {
            break;
        }
        evaluate_consequence(stmt.body, env);
    }
    return (0, value_1.MK_NULL)();
}
function evaluate(astNode, env) {
    switch (astNode.kind) {
        case "ExpressionStatement":
            return evaluate(astNode.expression, env);
        case "NumericLiteral":
            return { value: (astNode.value), type: "number", };
        case "Identifier":
            return evaluate_identifier(astNode, env);
        case "NullLiteral":
            return { value: null, type: "null" };
        case "Program":
            return eval_program(astNode, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode, env);
        case "VariableDeclare":
            return eval_declar_var(astNode, env, astNode.constant);
        case "Assignment Expr":
            return eval_assignments_expr(astNode, env);
        case "ObjectLiteral":
            return eval_object(astNode, env);
        case "Member":
            return eval_member_expr(astNode, env);
        case "FunctionDeclare":
            return eval_declare_fn(astNode, env);
        case "CallExpr":
            return evaluate_call_expr(astNode, env);
        case "BooleanLiteral":
            return (0, value_1.MK_BOOL)(astNode.value);
        case "IfStatement":
            return eval_if_stmt(astNode, env);
        case "WhileStatement":
            return eval_while_stmt(astNode, env);
        case "ForLoop":
            return eval_for_loop(astNode, env);
        case "StringLiteral":
            return { type: "string", value: astNode.value };
        default:
            throw new Error("This AST Node has not yet been setup for interpretation, ".concat(astNode).concat(console.log(astNode)));
    }
}
