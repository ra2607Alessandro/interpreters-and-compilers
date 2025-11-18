"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MK_RUNTIMEVAL = MK_RUNTIMEVAL;
exports.MK_NTV_FUNCTION = MK_NTV_FUNCTION;
exports.MK_BOOL = MK_BOOL;
exports.MK_NULL = MK_NULL;
function MK_RUNTIMEVAL(b) {
    return { type: "runtime-val", value: b };
}
function MK_NTV_FUNCTION(b) {
    return { type: "native-function", call: b };
}
function MK_BOOL(b) {
    return { type: "boolean", value: b };
}
function MK_NULL() {
    return { type: "null", value: null };
}
