"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStrictMode = exports.isSupportedScriptFileExtension = exports.registerRefs = exports.buildPrecompileTemplateCall = exports.isTemplateTag = exports.TEMPLATE_TAG_PLACEHOLDER = exports.TEMPLATE_TAG_NAME = exports.isTemplateLiteral = exports.TEMPLATE_LITERAL_MODULE_SPECIFIER = exports.TEMPLATE_LITERAL_IDENTIFIER = void 0;
const parse_templates_1 = require("./parse-templates");
// import { hbs } from 'ember-template-imports';
// const Greeting = hbs`Hello!`;
exports.TEMPLATE_LITERAL_IDENTIFIER = 'hbs';
exports.TEMPLATE_LITERAL_MODULE_SPECIFIER = 'ember-template-imports';
function isTemplateLiteral(callExpressionPath) {
    const callee = callExpressionPath.get('callee');
    return (callee.isIdentifier() &&
        callee.referencesImport(exports.TEMPLATE_LITERAL_MODULE_SPECIFIER, exports.TEMPLATE_LITERAL_IDENTIFIER));
}
exports.isTemplateLiteral = isTemplateLiteral;
// const Greeting = <template>Hello</template>
exports.TEMPLATE_TAG_NAME = 'template';
exports.TEMPLATE_TAG_PLACEHOLDER = '__GLIMMER_TEMPLATE';
function isTemplateTag(callExpressionPath) {
    const callee = callExpressionPath.get('callee');
    return (!Array.isArray(callee) &&
        callee.isIdentifier() &&
        callee.node.name === exports.TEMPLATE_TAG_PLACEHOLDER);
}
exports.isTemplateTag = isTemplateTag;
function buildPrecompileTemplateCall(t, callExpressionPath, state) {
    const callee = callExpressionPath.get('callee');
    return t.callExpression(state.importUtil.import(callee, '@ember/template-compilation', 'precompileTemplate'), callExpressionPath.node.arguments);
}
exports.buildPrecompileTemplateCall = buildPrecompileTemplateCall;
function registerRefs(newPath, getRefPaths) {
    if (Array.isArray(newPath)) {
        if (newPath.length > 1) {
            throw new Error('registerRefs is only meant to handle single node transformations. Received more than one path node.');
        }
        newPath = newPath[0];
    }
    const refPaths = getRefPaths(newPath);
    for (const ref of refPaths) {
        if (!ref.isIdentifier()) {
            throw new Error('ember-template-imports internal assumption that refPath should of type identifier. Please open an issue.');
        }
        const binding = ref.scope.getBinding(ref.node.name);
        if (binding !== undefined) {
            binding.reference(ref);
        }
    }
}
exports.registerRefs = registerRefs;
const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.gjs', '.gts'];
function isSupportedScriptFileExtension(filePath) {
    return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
exports.isSupportedScriptFileExtension = isSupportedScriptFileExtension;
function isStrictMode(templateInfo) {
    return (((0, parse_templates_1.isTemplateLiteralMatch)(templateInfo) &&
        templateInfo.importIdentifier === exports.TEMPLATE_LITERAL_IDENTIFIER &&
        templateInfo.importPath === exports.TEMPLATE_LITERAL_MODULE_SPECIFIER) ||
        templateInfo.type === 'template-tag');
}
exports.isStrictMode = isStrictMode;
