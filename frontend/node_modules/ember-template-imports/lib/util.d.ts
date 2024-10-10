import type { ImportUtil } from 'babel-import-util';
import type { NodePath } from '@babel/traverse';
import type * as babelTypes from '@babel/types';
import { TemplateMatch } from './parse-templates';
export declare const TEMPLATE_LITERAL_IDENTIFIER = "hbs";
export declare const TEMPLATE_LITERAL_MODULE_SPECIFIER = "ember-template-imports";
export declare function isTemplateLiteral(callExpressionPath: NodePath<babelTypes.CallExpression>): boolean;
export declare const TEMPLATE_TAG_NAME = "template";
export declare const TEMPLATE_TAG_PLACEHOLDER = "__GLIMMER_TEMPLATE";
export declare function isTemplateTag(callExpressionPath: NodePath<babelTypes.CallExpression>): boolean;
export declare function buildPrecompileTemplateCall(t: typeof babelTypes, callExpressionPath: NodePath<babelTypes.CallExpression>, state: {
    importUtil: ImportUtil;
}): babelTypes.CallExpression;
export declare function registerRefs(newPath: string | string[], getRefPaths: (path: string) => NodePath[]): void;
export declare function isSupportedScriptFileExtension(filePath: string): boolean;
export declare function isStrictMode(templateInfo: TemplateMatch): boolean;
