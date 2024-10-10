"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _JSUtils_instances, _JSUtils_babel, _JSUtils_state, _JSUtils_template, _JSUtils_locals, _JSUtils_importer, _JSUtils_emitStatement, _JSUtils_parseExpression, _ExpressionContext_importer, _ExpressionContext_target;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSUtils = void 0;
// This exists to give AST plugins a controlled interface for influencing the
// surrounding Javascript scope
class JSUtils {
    constructor(babel, state, template, locals, importer) {
        _JSUtils_instances.add(this);
        _JSUtils_babel.set(this, void 0);
        _JSUtils_state.set(this, void 0);
        _JSUtils_template.set(this, void 0);
        _JSUtils_locals.set(this, void 0);
        _JSUtils_importer.set(this, void 0);
        __classPrivateFieldSet(this, _JSUtils_babel, babel, "f");
        __classPrivateFieldSet(this, _JSUtils_state, state, "f");
        __classPrivateFieldSet(this, _JSUtils_template, template, "f");
        __classPrivateFieldSet(this, _JSUtils_locals, locals, "f");
        __classPrivateFieldSet(this, _JSUtils_importer, importer, "f");
        if (!__classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath) {
            let target;
            for (let statement of __classPrivateFieldGet(this, _JSUtils_state, "f").program.get('body')) {
                if (!statement.isImportDeclaration()) {
                    break;
                }
                target = statement;
            }
            if (target) {
                __classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath = target;
            }
        }
    }
    /**
     * Create a new binding that you can use in your template, initialized with
     * the given Javascript expression.
     *
     * @param { Expression } expression A javascript expression whose value will
     * initialize your new binding. See docs on the Expression type for details.
     * @param target The location within your template where the binding will be
     * used. This matters so we can avoid naming collisions.
     * @param opts.nameHint Optionally, provide a descriptive name for your new
     * binding. We will mangle this name as needed to avoid collisions, but
     * picking a good name here can aid in debugging.
     *
     * @return The name you can use in your template to access the binding.
     */
    bindExpression(expression, target, opts) {
        var _a;
        let name = unusedNameLike((_a = opts === null || opts === void 0 ? void 0 : opts.nameHint) !== null && _a !== void 0 ? _a : 'a', (candidate) => __classPrivateFieldGet(this, _JSUtils_template, "f").scope.hasBinding(candidate) ||
            __classPrivateFieldGet(this, _JSUtils_locals, "f").includes(candidate) ||
            astNodeHasBinding(target, candidate));
        let t = __classPrivateFieldGet(this, _JSUtils_babel, "f").types;
        let declaration = __classPrivateFieldGet(this, _JSUtils_instances, "m", _JSUtils_emitStatement).call(this, t.variableDeclaration('let', [
            t.variableDeclarator(t.identifier(name), __classPrivateFieldGet(this, _JSUtils_instances, "m", _JSUtils_parseExpression).call(this, __classPrivateFieldGet(this, _JSUtils_state, "f").program, expression)),
        ]));
        declaration.scope.registerBinding('module', declaration.get('declarations.0'));
        __classPrivateFieldGet(this, _JSUtils_locals, "f").push(name);
        return name;
    }
    /**
     * Gain access to an imported value within your template.
     *
     * @param moduleSpecifier The path to import from.
     * @param exportedName The named export you wish to access, or "default" for
     * the default export, or "*" for the namespace export.
     * @param target The location within your template where the binding will be
     * used. This matters so we can avoid naming collisions.
     * @param opts.nameHint Optionally, provide a descriptive name for your new
     * binding. We will mangle this name as needed to avoid collisions, but
     * picking a good name here can aid in debugging.
     *
     * @return The name you can use in your template to access the imported value.
     */
    bindImport(moduleSpecifier, exportedName, target, opts) {
        // This will discover or create the local name for accessing the given import.
        let importedIdentifier = __classPrivateFieldGet(this, _JSUtils_importer, "f").import(__classPrivateFieldGet(this, _JSUtils_template, "f"), moduleSpecifier, exportedName, opts === null || opts === void 0 ? void 0 : opts.nameHint);
        // If we're already referencing the imported name from the outer scope and
        // it's not shadowed at our target location in the template, we can reuse
        // the existing import.
        if (__classPrivateFieldGet(this, _JSUtils_locals, "f").includes(importedIdentifier.name) &&
            !astNodeHasBinding(target, importedIdentifier.name)) {
            return importedIdentifier.name;
        }
        let identifier = unusedNameLike(importedIdentifier.name, (candidate) => __classPrivateFieldGet(this, _JSUtils_locals, "f").includes(candidate) || astNodeHasBinding(target, candidate));
        if (identifier !== importedIdentifier.name) {
            // The importedIdentifier that we have in Javascript is not usable within
            // our HBS because it's shadowed by a block param. So we will introduce a
            // second name via a variable declaration.
            //
            // The reason we don't force the import itself to have this name is that
            // we might be re-using an existing import, and we don't want to go
            // rewriting all of its callsites that are unrelated to us.
            let t = __classPrivateFieldGet(this, _JSUtils_babel, "f").types;
            __classPrivateFieldGet(this, _JSUtils_instances, "m", _JSUtils_emitStatement).call(this, t.variableDeclaration('let', [
                t.variableDeclarator(t.identifier(identifier), importedIdentifier),
            ]));
        }
        __classPrivateFieldGet(this, _JSUtils_locals, "f").push(identifier);
        return identifier;
    }
    /**
     * Add an import statement purely for side effect.
     *
     * @param moduleSpecifier the module to import
     */
    importForSideEffect(moduleSpecifier) {
        __classPrivateFieldGet(this, _JSUtils_importer, "f").importForSideEffect(moduleSpecifier);
    }
    /**
     * Emit a javascript expresison for side-effect. This only accepts
     * expressions, not statements, because you should not introduce new bindings.
     * To introduce a binding see bindExpression or bindImport instead.
     *
     * @param { Expression } expression A javascript expression whose value will
     * initialize your new binding. See docs on the Expression type below for
     * details.
     */
    emitExpression(expression) {
        let t = __classPrivateFieldGet(this, _JSUtils_babel, "f").types;
        __classPrivateFieldGet(this, _JSUtils_instances, "m", _JSUtils_emitStatement).call(this, t.expressionStatement(__classPrivateFieldGet(this, _JSUtils_instances, "m", _JSUtils_parseExpression).call(this, __classPrivateFieldGet(this, _JSUtils_state, "f").program, expression)));
    }
}
exports.JSUtils = JSUtils;
_JSUtils_babel = new WeakMap(), _JSUtils_state = new WeakMap(), _JSUtils_template = new WeakMap(), _JSUtils_locals = new WeakMap(), _JSUtils_importer = new WeakMap(), _JSUtils_instances = new WeakSet(), _JSUtils_emitStatement = function _JSUtils_emitStatement(statement) {
    if (__classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath) {
        __classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath = __classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath.insertAfter(statement)[0];
    }
    else {
        __classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath = __classPrivateFieldGet(this, _JSUtils_state, "f").program.unshiftContainer('body', statement)[0];
    }
    return __classPrivateFieldGet(this, _JSUtils_state, "f").lastInsertedPath;
}, _JSUtils_parseExpression = function _JSUtils_parseExpression(target, expression) {
    let expressionString;
    if (typeof expression === 'string') {
        expressionString = expression;
    }
    else {
        expressionString = expression(new ExpressionContext(__classPrivateFieldGet(this, _JSUtils_importer, "f"), target));
    }
    let parsed = __classPrivateFieldGet(this, _JSUtils_babel, "f").parse(expressionString);
    if (!parsed) {
        throw new Error(`JSUtils.bindExpression could not understand the expression: ${expressionString}`);
    }
    let statements = body(parsed);
    if (statements.length !== 1) {
        throw new Error(`JSUtils.bindExpression expected to find exactly one expression but found ${statements.length} in: ${expressionString}`);
    }
    let statement = statements[0];
    if (statement.type !== 'ExpressionStatement') {
        throw new Error(`JSUtils.bindExpression expected to find an expression but found ${statement.type} in: ${expressionString}`);
    }
    return statement.expression;
};
function unusedNameLike(desiredName, isUsed) {
    let candidate = desiredName;
    let counter = 0;
    while (isUsed(candidate)) {
        candidate = `${desiredName}${counter++}`;
    }
    return candidate;
}
function astNodeHasBinding(target, name) {
    var _a;
    let cursor = target;
    while (cursor) {
        let parentNode = (_a = cursor.parent) === null || _a === void 0 ? void 0 : _a.node;
        if ((parentNode === null || parentNode === void 0 ? void 0 : parentNode.type) === 'ElementNode' &&
            parentNode.blockParams.includes(name) &&
            // an ElementNode's block params are valid only within its children
            parentNode.children.includes(cursor.node)) {
            return true;
        }
        if ((parentNode === null || parentNode === void 0 ? void 0 : parentNode.type) === 'Block' &&
            parentNode.blockParams.includes(name) &&
            // a Block's blockParams are valid only within its body
            parentNode.body.includes(cursor.node)) {
            return true;
        }
        cursor = cursor.parent;
    }
    return false;
}
function body(node) {
    if (node.type === 'File') {
        return node.program.body;
    }
    else {
        return node.body;
    }
}
/**
 * Allows you to construct an expression that relies on imported values.
 */
class ExpressionContext {
    constructor(importer, target) {
        _ExpressionContext_importer.set(this, void 0);
        _ExpressionContext_target.set(this, void 0);
        __classPrivateFieldSet(this, _ExpressionContext_importer, importer, "f");
        __classPrivateFieldSet(this, _ExpressionContext_target, target, "f");
    }
    /**
     * Find or create a local binding for the given import.
     *
     * @param moduleSpecifier The path to import from.
     * @param exportedName The named export you wish to access, or "default" for
     * the default export, or "*" for the namespace export.
     * @param nameHint Optionally, provide a descriptive name for your new
     * binding. We will mangle this name as needed to avoid collisions, but
     * picking a good name here can aid in debugging.
  
     * @return the local identifier for the imported value
     */
    import(moduleSpecifier, exportedName, nameHint) {
        return __classPrivateFieldGet(this, _ExpressionContext_importer, "f").import(__classPrivateFieldGet(this, _ExpressionContext_target, "f"), moduleSpecifier, exportedName, nameHint).name;
    }
}
_ExpressionContext_importer = new WeakMap(), _ExpressionContext_target = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqcy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFXQSw2RUFBNkU7QUFDN0UsK0JBQStCO0FBQy9CLE1BQWEsT0FBTztJQU9sQixZQUNFLEtBQW1CLEVBQ25CLEtBQVksRUFDWixRQUFnQyxFQUNoQyxNQUFnQixFQUNoQixRQUFvQjs7UUFYdEIsaUNBQXFCO1FBQ3JCLGlDQUFjO1FBQ2Qsb0NBQWtDO1FBQ2xDLGtDQUFrQjtRQUNsQixvQ0FBc0I7UUFTcEIsdUJBQUEsSUFBSSxrQkFBVSxLQUFLLE1BQUEsQ0FBQztRQUNwQix1QkFBQSxJQUFJLGtCQUFVLEtBQUssTUFBQSxDQUFDO1FBQ3BCLHVCQUFBLElBQUkscUJBQWEsUUFBUSxNQUFBLENBQUM7UUFDMUIsdUJBQUEsSUFBSSxtQkFBVyxNQUFNLE1BQUEsQ0FBQztRQUN0Qix1QkFBQSxJQUFJLHFCQUFhLFFBQVEsTUFBQSxDQUFDO1FBRTFCLElBQUksQ0FBQyx1QkFBQSxJQUFJLHNCQUFPLENBQUMsZ0JBQWdCLEVBQUU7WUFDakMsSUFBSSxNQUF5QyxDQUFDO1lBQzlDLEtBQUssSUFBSSxTQUFTLElBQUksdUJBQUEsSUFBSSxzQkFBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtvQkFDcEMsTUFBTTtpQkFDUDtnQkFDRCxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3BCO1lBQ0QsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsdUJBQUEsSUFBSSxzQkFBTyxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQzthQUN2QztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSCxjQUFjLENBQ1osVUFBc0IsRUFDdEIsTUFBOEIsRUFDOUIsSUFBNEI7O1FBRTVCLElBQUksSUFBSSxHQUFH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QUFvQixFQUFFLFFBQWlCO1FBQ3JFLE9BQU8sdUJBQUEsSUFBSSxtQ0FBVSxDQUFDLE1BQU0sQ0FBQyx1QkFBQSxJQUFJLGlDQUFRLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDM0YsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyB0eXBlcyBhcyB0IH0gZnJvbSAnQGJhYmVsL2NvcmUnO1xuaW1wb3J0IHR5cGUgKiBhcyBCYWJlbCBmcm9tICdAYmFiZWwvY29yZSc7XG5pbXBvcnQgdHlwZSB7IE5vZGVQYXRoIH0gZnJvbSAnQGJhYmVsL3RyYXZlcnNlJztcbmltcG9ydCB0eXBlIHsgQVNUUGx1Z2luQnVpbGRlciwgQVNUUGx1Z2luRW52aXJvbm1lbnQsIEFTVHYxLCBXYWxrZXJQYXRoIH0gZnJvbSAnQGdsaW1tZXIvc3ludGF4JztcbmltcG9ydCB0eXBlIHsgSW1wb3J0VXRpbCB9IGZyb20gJ2JhYmVsLWltcG9ydC11dGlsJztcblxuaW50ZXJmYWNlIFN0YXRlIHtcbiAgcHJvZ3JhbTogTm9kZVBhdGg8QmFiZWwudHlwZXMuUHJvZ3JhbT47XG4gIGxhc3RJbnNlcnRlZFBhdGg6IE5vZGVQYXRoPEJhYmVsLnR5cGVzLlN0YXRlbWVudD4gfCB1bmRlZmluZWQ7XG59XG5cbi8vIFRoaXMgZXhpc3RzIHRvIGdpdmUgQVNUIHBsdWdpbnMgYSBjb250cm9sbGVkIGludGVyZmFjZSBmb3IgaW5mbHVlbmNpbmcgdGhlXG4vLyBzdXJyb3VuZGluZyBKYXZhc2NyaXB0IHNjb3BlXG5leHBvcnQgY2xhc3MgSlNVdGlscyB7XG4gICNiYWJlbDogdHlwZW9mIEJhYmVsO1xuICAjc3RhdGU6IFN0YXRlO1xuICAjdGVtcGxhdGU6IE5vZGVQYXRoPHQuRXhwcmVzc2lvbj47XG4gICNsb2NhbHM6IHN0cmluZ1tdO1xuICAjaW1wb3J0ZXI6IEltcG9ydFV0aWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYmFiZWw6IHR5cGVvZiBCYWJlbCxcbiAgICBzdGF0ZTogU3RhdGUsXG4gICAgdGVtcGxhdGU6IE5vZGVQYXRoPHQuRXhwcmVzc2lvbj4sXG4gICAgbG9jYWxzOiBzdHJpbmdbXSxcbiAgICBpbXBvcnRlcjogSW1wb3J0VXRpbFxuICApIHtcbiAgICB0aGlzLiNiYWJlbCA9IGJhYmVsO1xuICAgIHRoaXMuI3N0YXRlID0gc3RhdGU7XG4gICAgdGhpcy4jdGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLiNsb2NhbHMgPSBsb2NhbHM7XG4gICAgdGhpcy4jaW1wb3J0ZXIgPSBpbXBvcnRlcjtcblxuICAgIGlmICghdGhpcy4jc3RhdGUubGFzdEluc2VydGVkUGF0aCkge1xuICAgICAgbGV0IHRhcmdldDogTm9kZVBhdGg8dC5TdGF0ZW1lbnQ+IHwgdW5kZWZpbmVkO1xuICAgICAgZm9yIChsZXQgc3RhdGVtZW50IG9mIHRoaXMuI3N0YXRlLnByb2dyYW0uZ2V0KCdib2R5JykpIHtcbiAgICAgICAgaWYgKCFzdGF0ZW1lbnQuaXNJbXBvcnREZWNsYXJhdGlvbigpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gc3RhdGVtZW50O1xuICAgICAgfVxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0aGlzLiNzdGF0ZS5sYXN0SW5zZXJ0ZWRQYXRoID0gdGFyZ2V0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYmluZGluZyB0aGF0IHlvdSBjYW4gdXNlIGluIHlvdXIgdGVtcGxhdGUsIGluaXRpYWxpemVkIHdpdGhcbiAgICogdGhlIGdpdmVuIEphdmFzY3JpcHQgZXhwcmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIHsgRXhwcmVzc2lvbiB9IGV4cHJlc3Npb24gQSBqYXZhc2NyaXB0IGV4cHJlc3Npb24gd2hvc2UgdmFsdWUgd2lsbFxuICAgKiBpbml0aWFsaXplIHlvdXIgbmV3IGJpbmRpbmcuIFNlZSBkb2NzIG9uIHRoZSBFeHByZXNzaW9uIHR5cGUgZm9yIGRldGFpbHMuXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIGxvY2F0aW9uIHdpdGhpbiB5b3VyIHRlbXBsYXRlIHdoZXJlIHRoZSBiaW5kaW5nIHdpbGwgYmVcbiAgICogdXNlZC4gVGhpcyBtYXR0ZXJzIHNvIHdlIGNhbiBhdm9pZCBuYW1pbmcgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIG9wdHMubmFtZUhpbnQgT3B0aW9uYWxseSwgcHJvdmlkZSBhIGRlc2NyaXB0aXZlIG5hbWUgZm9yIHlvdXIgbmV3XG4gICAqIGJpbmRpbmcuIFdlIHdpbGwgbWFuZ2xlIHRoaXMgbmFtZSBhcyBuZWVkZWQgdG8gYXZvaWQgY29sbGlzaW9ucywgYnV0XG4gICAqIHBpY2tpbmcgYSBnb29kIG5hbWUgaGVyZSBjYW4gYWlkIGluIGRlYnVnZ2luZy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgbmFtZSB5b3UgY2FuIHVzZSBpbiB5b3VyIHRlbXBsYXRlIHRvIGFjY2VzcyB0aGUgYmluZGluZy5cbiAgICovXG4gIGJpbmRFeHByZXNzaW9uKFxuICAgIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4gICAgdGFyZ2V0OiBXYWxrZXJQYXRoPEFTVHYxLk5vZGU+LFxuICAgIG9wdHM/OiB7IG5hbWVIaW50Pzogc3RyaW5nIH1cbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgbmFtZSA9IHVudXNlZE5hbWVMaWtlKFxuICAgICAgb3B0cz8ubmFtZUhpbnQgPz8gJ2EnLFxuICAgICAgKGNhbmRpZGF0ZSkgPT5cbiAgICAgICAgdGhpcy4jdGVtcGxhdGUuc2NvcGUuaGFzQmluZGluZyhjYW5kaWRhdGUpIHx8XG4gICAgICAgIHRoaXMuI2xvY2Fscy5pbmNsdWRlcyhjYW5kaWRhdGUpIHx8XG4gICAgICAgIGFzdE5vZGVIYXNCaW5kaW5nKHRhcmdldCwgY2FuZGlkYXRlKVxuICAgICk7XG4gICAgbGV0IHQgPSB0aGlzLiNiYWJlbC50eXBlcztcbiAgICBsZXQgZGVjbGFyYXRpb246IE5vZGVQYXRoPHQuVmFyaWFibGVEZWNsYXJhdGlvbj4gPSB0aGlzLiNlbWl0U3RhdGVtZW50KFxuICAgICAgdC52YXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbXG4gICAgICAgIHQudmFyaWFibGVEZWNsYXJhdG9yKFxuICAgICAgICAgIHQuaWRlbnRpZmllcihuYW1lKSxcbiAgICAgICAgICB0aGlzLiNwYXJzZUV4cHJlc3Npb24odGhpcy4jc3RhdGUucHJvZ3JhbSwgZXhwcmVzc2lvbilcbiAgICAgICAgKSxcbiAgICAgIF0pXG4gICAgKTtcbiAgICBkZWNsYXJhdGlvbi5zY29wZS5yZWdpc3RlckJpbmRpbmcoJ21vZHVsZScsIGRlY2xhcmF0aW9uLmdldCgnZGVjbGFyYXRpb25zLjAnKSBhcyBOb2RlUGF0aCk7XG4gICAgdGhpcy4jbG9jYWxzLnB1c2gobmFtZSk7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICAjZW1pdFN0YXRlbWVudDxUIGV4dGVuZHMgdC5TdGF0ZW1lbnQ+KHN0YXRlbWVudDogVCk6IE5vZGVQYXRoPFQ+IHtcbiAgICBpZiAodGhpcy4jc3RhdGUubGFzdEluc2VydGVkUGF0aCkge1xuICAgICAgdGhpcy4jc3RhdGUubGFzdEluc2VydGVkUGF0aCA9IHRoaXMuI3N0YXRlLmxhc3RJbnNlcnRlZFBhdGguaW5zZXJ0QWZ0ZXIoc3RhdGVtZW50KVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jc3RhdGUubGFzdEluc2VydGVkUGF0aCA9IHRoaXMuI3N0YXRlLnByb2dyYW0udW5zaGlmdENvbnRhaW5lcignYm9keScsIHN0YXRlbWVudClbMF07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNzdGF0ZS5sYXN0SW5zZXJ0ZWRQYXRoIGFzIE5vZGVQYXRoPFQ+O1xuICB9XG5cbiAgLyoqXG4gICAqIEdhaW4gYWNjZXNzIHRvIGFuIGltcG9ydGVkIHZhbHVlIHdpdGhpbiB5b3VyIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlU3BlY2lmaWVyIFRoZSBwYXRoIHRvIGltcG9ydCBmcm9tLlxuICAgKiBAcGFyYW0gZXhwb3J0ZWROYW1lIFRoZSBuYW1lZCBleHBvcnQgeW91IHdpc2ggdG8gYWNjZXNzLCBvciBcImRlZmF1bHRcIiBmb3JcbiAgICogdGhlIGRlZmF1bHQgZXhwb3J0LCBvciBcIipcIiBmb3IgdGhlIG5hbWVzcGFjZSBleHBvcnQuXG4gICAqIEBwYXJhbSB0YXJnZXQgVGhlIGxvY2F0aW9uIHdpdGhpbiB5b3VyIHRlbXBsYXRlIHdoZXJlIHRoZSBiaW5kaW5nIHdpbGwgYmVcbiAgICogdXNlZC4gVGhpcyBtYXR0ZXJzIHNvIHdlIGNhbiBhdm9pZCBuYW1pbmcgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIG9wdHMubmFtZUhpbnQgT3B0aW9uYWxseSwgcHJvdmlkZSBhIGRlc2NyaXB0aXZlIG5hbWUgZm9yIHlvdXIgbmV3XG4gICAqIGJpbmRpbmcuIFdlIHdpbGwgbWFuZ2xlIHRoaXMgbmFtZSBhcyBuZWVkZWQgdG8gYXZvaWQgY29sbGlzaW9ucywgYnV0XG4gICAqIHBpY2tpbmcgYSBnb29kIG5hbWUgaGVyZSBjYW4gYWlkIGluIGRlYnVnZ2luZy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgbmFtZSB5b3UgY2FuIHVzZSBpbiB5b3VyIHRlbXBsYXRlIHRvIGFjY2VzcyB0aGUgaW1wb3J0ZWQgdmFsdWUuXG4gICAqL1xuICBiaW5kSW1wb3J0KFxuICAgIG1vZHVsZVNwZWNpZmllcjogc3RyaW5nLFxuICAgIGV4cG9ydGVkTmFtZTogc3RyaW5nLFxuICAgIHRhcmdldDogV2Fsa2VyUGF0aDxBU1R2MS5Ob2RlPixcbiAgICBvcHRzPzogeyBuYW1lSGludD86IHN0cmluZyB9XG4gICk6IHN0cmluZyB7XG4gICAgLy8gVGhpcyB3aWxsIGRpc2NvdmVyIG9yIGNyZWF0ZSB0aGUgbG9jYWwgbmFtZSBmb3IgYWNjZXNzaW5nIHRoZSBnaXZlbiBpbXBvcnQuXG4gICAgbGV0IGltcG9ydGVkSWRlbnRpZmllciA9IHRoaXMuI2ltcG9ydGVyLmltcG9ydChcbiAgICAgIHRoaXMuI3RlbXBsYXRlLFxuICAgICAgbW9kdWxlU3BlY2lmaWVyLFxuICAgICAgZXhwb3J0ZWROYW1lLFxuICAgICAgb3B0cz8ubmFtZUhpbnRcbiAgICApO1xuXG4gICAgLy8gSWYgd2UncmUgYWxyZWFkeSByZWZlcmVuY2luZyB0aGUgaW1wb3J0ZWQgbmFtZSBmcm9tIHRoZSBvdXRlciBzY29wZSBhbmRcbiAgICAvLyBpdCdzIG5vdCBzaGFkb3dlZCBhdCBvdXIgdGFyZ2V0IGxvY2F0aW9uIGluIHRoZSB0ZW1wbGF0ZSwgd2UgY2FuIHJldXNlXG4gICAgLy8gdGhlIGV4aXN0aW5nIGltcG9ydC5cbiAgICBpZiAoXG4gICAgICB0aGlzLiNsb2NhbHMuaW5jbHVkZXMoaW1wb3J0ZWRJZGVudGlmaWVyLm5hbWUpICYmXG4gICAgICAhYXN0Tm9kZUhhc0JpbmRpbmcodGFyZ2V0LCBpbXBvcnRlZElkZW50aWZpZXIubmFtZSlcbiAgICApIHtcbiAgICAgIHJldHVybiBpbXBvcnRlZElkZW50aWZpZXIubmFtZTtcbiAgICB9XG5cbiAgICBsZXQgaWRlbnRpZmllciA9IHVudXNlZE5hbWVMaWtlKFxuICAgICAgaW1wb3J0ZWRJZGVudGlmaWVyLm5hbWUsXG4gICAgICAoY2FuZGlkYXRlKSA9PiB0aGlzLiNsb2NhbHMuaW5jbHVkZXMoY2FuZGlkYXRlKSB8fCBhc3ROb2RlSGFzQmluZGluZyh0YXJnZXQsIGNhbmRpZGF0ZSlcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyICE9PSBpbXBvcnRlZElkZW50aWZpZXIubmFtZSkge1xuICAgICAgLy8gVGhlIGltcG9ydGVkSWRlbnRpZmllciB0aGF0IHdlIGhhdmUgaW4gSmF2YXNjcmlwdCBpcyBub3QgdXNhYmxlIHdpdGhpblxuICAgICAgLy8gb3VyIEhCUyBiZWNhdXNlIGl0J3Mgc2hhZG93ZWQgYnkgYSBibG9jayBwYXJhbS4gU28gd2Ugd2lsbCBpbnRyb2R1Y2UgYVxuICAgICAgLy8gc2Vjb25kIG5hbWUgdmlhIGEgdmFyaWFibGUgZGVjbGFyYXRpb24uXG4gICAgICAvL1xuICAgICAgLy8gVGhlIHJlYXNvbiB3ZSBkb24ndCBmb3JjZSB0aGUgaW1wb3J0IGl0c2VsZiB0byBoYXZlIHRoaXMgbmFtZSBpcyB0aGF0XG4gICAgICAvLyB3ZSBtaWdodCBiZSByZS11c2luZyBhbiBleGlzdGluZyBpbXBvcnQsIGFuZCB3ZSBkb24ndCB3YW50IHRvIGdvXG4gICAgICAvLyByZXdyaXRpbmcgYWxsIG9mIGl0cyBjYWxsc2l0ZXMgdGhhdCBhcmUgdW5yZWxhdGVkIHRvIHVzLlxuICAgICAgbGV0IHQgPSB0aGlzLiNiYWJlbC50eXBlcztcbiAgICAgIHRoaXMuI2VtaXRTdGF0ZW1lbnQoXG4gICAgICAgIHQudmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW1xuICAgICAgICAgIHQudmFyaWFibGVEZWNsYXJhdG9yKHQuaWRlbnRpZmllcihpZGVudGlmaWVyKSwgaW1wb3J0ZWRJZGVudGlmaWVyKSxcbiAgICAgICAgXSlcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuI2xvY2Fscy5wdXNoKGlkZW50aWZpZXIpO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBpbXBvcnQgc3RhdGVtZW50IHB1cmVseSBmb3Igc2lkZSBlZmZlY3QuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVTcGVjaWZpZXIgdGhlIG1vZHVsZSB0byBpbXBvcnRcbiAgICovXG4gIGltcG9ydEZvclNpZGVFZmZlY3QobW9kdWxlU3BlY2lmaWVyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLiNpbXBvcnRlci5pbXBvcnRGb3JTaWRlRWZmZWN0KG1vZHVsZVNwZWNpZmllcik7XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhIGphdmFzY3JpcHQgZXhwcmVzaXNvbiBmb3Igc2lkZS1lZmZlY3QuIFRoaXMgb25seSBhY2NlcHRzXG4gICAqIGV4cHJlc3Npb25zLCBub3Qgc3RhdGVtZW50cywgYmVjYXVzZSB5b3Ugc2hvdWxkIG5vdCBpbnRyb2R1Y2UgbmV3IGJpbmRpbmdzLlxuICAgKiBUbyBpbnRyb2R1Y2UgYSBiaW5kaW5nIHNlZSBiaW5kRXhwcmVzc2lvbiBvciBiaW5kSW1wb3J0IGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7IEV4cHJlc3Npb24gfSBleHByZXNzaW9uIEEgamF2YXNjcmlwdCBleHByZXNzaW9uIHdob3NlIHZhbHVlIHdpbGxcbiAgICogaW5pdGlhbGl6ZSB5b3VyIG5ldyBiaW5kaW5nLiBTZWUgZG9jcyBvbiB0aGUgRXhwcmVzc2lvbiB0eXBlIGJlbG93IGZvclxuICAgKiBkZXRhaWxzLlxuICAgKi9cbiAgZW1pdEV4cHJlc3Npb24oZXhwcmVzc2lvbjogRXhwcmVzc2lvbik6IHZvaWQge1xuICAgIGxldCB0ID0gdGhpcy4jYmFiZWwudHlwZXM7XG4gICAgdGhpcy4jZW1pdFN0YXRlbWVudChcbiAgICAgIHQuZXhwcmVzc2lvblN0YXRlbWVudCh0aGlzLiNwYXJzZUV4cHJlc3Npb24odGhpcy4jc3RhdGUucHJvZ3JhbSwgZXhwcmVzc2lvbikpXG4gICAgKTtcbiAgfVxuXG4gICNwYXJzZUV4cHJlc3Npb24odGFyZ2V0OiBOb2RlUGF0aDx0Lk5vZGU+LCBleHByZXNzaW9uOiBFeHByZXNzaW9uKTogdC5FeHByZXNzaW9uIHtcbiAgICBsZXQgZXhwcmVzc2lvblN0cmluZzogc3RyaW5nO1xuICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGV4cHJlc3Npb25TdHJpbmcgPSBleHByZXNzaW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHByZXNzaW9uU3RyaW5nID0gZXhwcmVzc2lvbihuZXcgRXhwcmVzc2lvbkNvbnRleHQodGhpcy4jaW1wb3J0ZXIsIHRhcmdldCkpO1xuICAgIH1cblxuICAgIGxldCBwYXJzZWQgPSB0aGlzLiNiYWJlbC5wYXJzZShleHByZXNzaW9uU3RyaW5nKTtcbiAgICBpZiAoIXBhcnNlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSlNVdGlscy5iaW5kRXhwcmVzc2lvbiBjb3VsZCBub3QgdW5kZXJzdGFuZCB0aGUgZXhwcmVzc2lvbjogJHtleHByZXNzaW9uU3RyaW5nfWBcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBzdGF0ZW1lbnRzID0gYm9keShwYXJzZWQpO1xuICAgIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSlNVdGlscy5iaW5kRXhwcmVzc2lvbiBleHBlY3RlZCB0byBmaW5kIGV4YWN0bHkgb25lIGV4cHJlc3Npb24gYnV0IGZvdW5kICR7c3RhdGVtZW50cy5sZW5ndGh9IGluOiAke2V4cHJlc3Npb25TdHJpbmd9YFxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IHN0YXRlbWVudCA9IHN0YXRlbWVudHNbMF07XG4gICAgaWYgKHN0YXRlbWVudC50eXBlICE9PSAnRXhwcmVzc2lvblN0YXRlbWVudCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEpTVXRpbHMuYmluZEV4cHJlc3Npb24gZXhwZWN0ZWQgdG8gZmluZCBhbiBleHByZXNzaW9uIGJ1dCBmb3VuZCAke3N0YXRlbWVudC50eXBlfSBpbjogJHtleHByZXNzaW9uU3RyaW5nfWBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZW1lbnQuZXhwcmVzc2lvbjtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnVzZWROYW1lTGlrZShkZXNpcmVkTmFtZTogc3RyaW5nLCBpc1VzZWQ6IChuYW1lOiBzdHJpbmcpID0+IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgY2FuZGlkYXRlID0gZGVzaXJlZE5hbWU7XG4gIGxldCBjb3VudGVyID0gMDtcbiAgd2hpbGUgKGlzVXNlZChjYW5kaWRhdGUpKSB7XG4gICAgY2FuZGlkYXRlID0gYCR7ZGVzaXJlZE5hbWV9JHtjb3VudGVyKyt9YDtcbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlO1xufVxuXG5mdW5jdGlvbiBhc3ROb2RlSGFzQmluZGluZyh0YXJnZXQ6IFdhbGtlclBhdGg8QVNUdjEuTm9kZT4sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBsZXQgY3Vyc29yOiBXYWxrZXJQYXRoPEFTVHYxLk5vZGU+IHwgbnVsbCA9IHRhcmdldDtcbiAgd2hpbGUgKGN1cnNvcikge1xuICAgIGxldCBwYXJlbnROb2RlID0gY3Vyc29yLnBhcmVudD8ubm9kZTtcbiAgICBpZiAoXG4gICAgICBwYXJlbnROb2RlPy50eXBlID09PSAnRWxlbWVudE5vZGUnICYmXG4gICAgICBwYXJlbnROb2RlLmJsb2NrUGFyYW1zLmluY2x1ZGVzKG5hbWUpICYmXG4gICAgICAvLyBhbiBFbGVtZW50Tm9kZSdzIGJsb2NrIHBhcmFtcyBhcmUgdmFsaWQgb25seSB3aXRoaW4gaXRzIGNoaWxkcmVuXG4gICAgICBwYXJlbnROb2RlLmNoaWxkcmVuLmluY2x1ZGVzKGN1cnNvci5ub2RlIGFzIEFTVHYxLlN0YXRlbWVudClcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHBhcmVudE5vZGU/LnR5cGUgPT09ICdCbG9jaycgJiZcbiAgICAgIHBhcmVudE5vZGUuYmxvY2tQYXJhbXMuaW5jbHVkZXMobmFtZSkgJiZcbiAgICAgIC8vIGEgQmxvY2sncyBibG9ja1BhcmFtcyBhcmUgdmFsaWQgb25seSB3aXRoaW4gaXRzIGJvZHlcbiAgICAgIHBhcmVudE5vZGUuYm9keS5pbmNsdWRlcyhjdXJzb3Iubm9kZSBhcyBBU1R2MS5TdGF0ZW1lbnQpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjdXJzb3IgPSBjdXJzb3IucGFyZW50O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUaGlzIGV4dGVuZHMgR2xpbW1lcidzIEFTVFBsdWdpbkVudmlyb25tZW50IHR5cGUgdG8gcHV0IG91ciBqc3V0aWxzIGludG8gbWV0YVxuICovXG5leHBvcnQgdHlwZSBXaXRoSlNVdGlsczxUIGV4dGVuZHMgeyBtZXRhPzogb2JqZWN0IH0+ID0ge1xuICBtZXRhOiBUWydtZXRhJ10gJiB7IGpzdXRpbHM6IEpTVXRpbHMgfTtcbn0gJiBUO1xuXG5leHBvcnQgdHlwZSBFeHRlbmRlZFBsdWdpbkJ1aWxkZXIgPSBBU1RQbHVnaW5CdWlsZGVyPFdpdGhKU1V0aWxzPEFTVFBsdWdpbkVudmlyb25tZW50Pj47XG5cbmZ1bmN0aW9uIGJvZHkobm9kZTogdC5Qcm9ncmFtIHwgdC5GaWxlKSB7XG4gIGlmIChub2RlLnR5cGUgPT09ICdGaWxlJykge1xuICAgIHJldHVybiBub2RlLnByb2dyYW0uYm9keTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbm9kZS5ib2R5O1xuICB9XG59XG5cbi8qKlxuICogQWxsb3dzIHlvdSB0byBjb25zdHJ1Y3QgYW4gZXhwcmVzc2lvbiB0aGF0IHJlbGllcyBvbiBpbXBvcnRlZCB2YWx1ZXMuXG4gKi9cbmNsYXNzIEV4cHJlc3Npb25Db250ZXh0IHtcbiAgI2ltcG9ydGVyOiBJbXBvcnRVdGlsO1xuICAjdGFyZ2V0OiBOb2RlUGF0aDx0Lk5vZGU+O1xuXG4gIGNvbnN0cnVjdG9yKGltcG9ydGVyOiBJbXBvcnRVdGlsLCB0YXJnZXQ6IE5vZGVQYXRoPHQuTm9kZT4pIHtcbiAgICB0aGlzLiNpbXBvcnRlciA9IGltcG9ydGVyO1xuICAgIHRoaXMuI3RhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIG9yIGNyZWF0ZSBhIGxvY2FsIGJpbmRpbmcgZm9yIHRoZSBnaXZlbiBpbXBvcnQuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVTcGVjaWZpZXIgVGhlIHBhdGggdG8gaW1wb3J0IGZyb20uXG4gICAqIEBwYXJhbSBleHBvcnRlZE5hbWUgVGhlIG5hbWVkIGV4cG9ydCB5b3Ugd2lzaCB0byBhY2Nlc3MsIG9yIFwiZGVmYXVsdFwiIGZvclxuICAgKiB0aGUgZGVmYXVsdCBleHBvcnQsIG9yIFwiKlwiIGZvciB0aGUgbmFtZXNwYWNlIGV4cG9ydC5cbiAgICogQHBhcmFtIG5hbWVIaW50IE9wdGlvbmFsbHksIHByb3ZpZGUgYSBkZXNjcmlwdGl2ZSBuYW1lIGZvciB5b3VyIG5ld1xuICAgKiBiaW5kaW5nLiBXZSB3aWxsIG1hbmdsZSB0aGlzIG5hbWUgYXMgbmVlZGVkIHRvIGF2b2lkIGNvbGxpc2lvbnMsIGJ1dFxuICAgKiBwaWNraW5nIGEgZ29vZCBuYW1lIGhlcmUgY2FuIGFpZCBpbiBkZWJ1Z2dpbmcuXG5cbiAgICogQHJldHVybiB0aGUgbG9jYWwgaWRlbnRpZmllciBmb3IgdGhlIGltcG9ydGVkIHZhbHVlXG4gICAqL1xuICBpbXBvcnQobW9kdWxlU3BlY2lmaWVyOiBzdHJpbmcsIGV4cG9ydGVkTmFtZTogc3RyaW5nLCBuYW1lSGludD86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2ltcG9ydGVyLmltcG9ydCh0aGlzLiN0YXJnZXQsIG1vZHVsZVNwZWNpZmllciwgZXhwb3J0ZWROYW1lLCBuYW1lSGludCkubmFtZTtcbiAgfVxufVxuXG4vKipcbiAqIFlvdSBjYW4gcGFzcyBhIEphdmFzY3JpcHQgZXhwcmVzc2lvbiBhcyBhIHN0cmluZyBsaWtlOlxuICpcbiAqICAgXCJuZXcgRGF0ZSgpXCJcbiAqXG4gKiBPciBhcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cmluZzpcbiAqXG4gKiAgICgpID0+IFwibmV3IERhdGUoKVwiXG4gKlxuICogV2hlbiB5b3UgdXNlIGEgZnVuY3Rpb24sIGl0IGNhbiB1c2UgaW1wb3J0ZWQgdmFsdWVzOlxuICpcbiAqICAgKGNvbnRleHQpID0+IGBuZXcgJHtjb250ZXh0LmltcG9ydChcImx1eG9uXCIsIFwiRGF0ZVRpbWVcIil9KClgXG4gKlxuICovXG5leHBvcnQgdHlwZSBFeHByZXNzaW9uID0gc3RyaW5nIHwgKChjb250ZXh0OiBFeHByZXNzaW9uQ29udGV4dCkgPT4gc3RyaW5nKTtcbiJdfQ==