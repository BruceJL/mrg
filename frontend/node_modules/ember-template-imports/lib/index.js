"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedScriptFileExtension = exports.isStrictMode = exports.DEFAULT_PARSE_TEMPLATES_OPTIONS = exports.parseTemplates = void 0;
var parse_templates_1 = require("./parse-templates");
Object.defineProperty(exports, "parseTemplates", { enumerable: true, get: function () { return parse_templates_1.parseTemplates; } });
Object.defineProperty(exports, "DEFAULT_PARSE_TEMPLATES_OPTIONS", { enumerable: true, get: function () { return parse_templates_1.DEFAULT_PARSE_TEMPLATES_OPTIONS; } });
var util_1 = require("./util");
Object.defineProperty(exports, "isStrictMode", { enumerable: true, get: function () { return util_1.isStrictMode; } });
Object.defineProperty(exports, "isSupportedScriptFileExtension", { enumerable: true, get: function () { return util_1.isSupportedScriptFileExtension; } });
