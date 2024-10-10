import type { Configuration } from 'webpack';
import { AddonInstance } from '@embroider/shared-internals';
import type { TransformOptions } from '@babel/core';
export declare function reloadDevPackages(): void;
export interface Options {
    exclude?: string[];
    alias?: {
        [fromName: string]: string;
    };
    webpack?: Configuration;
    publicAssetURL?: string;
    earlyBootSet?: (defaultModules: string[]) => string[];
    styleLoaderOptions?: Record<string, unknown>;
    cssLoaderOptions?: Record<string, unknown>;
    miniCssExtractPluginOptions?: Record<string, unknown>;
    forbidEval?: boolean;
    skipBabel?: {
        package: string;
        semverRange?: string;
    }[];
    watchDependencies?: (string | string[])[];
    insertScriptsAt?: string;
    insertStylesAt?: string;
}
export interface DepResolution {
    type: 'package';
    path: string;
    packageName: string;
    packageRoot: string;
}
interface LocalResolution {
    type: 'local';
    local: string;
}
interface URLResolution {
    type: 'url';
    url: string;
}
interface ImpreciseResolution {
    type: 'imprecise';
}
export default class Package {
    name: string;
    root: string;
    private pkgRoot;
    isAddon: boolean;
    private _options;
    private _parent;
    private _hasBabelDetails;
    private _babelMajorVersion?;
    private _babelOptions;
    private _emberCLIBabelExtensions?;
    private autoImportOptions;
    private isDeveloping;
    private pkgGeneration;
    private pkgCache;
    private macrosConfig;
    static lookupParentOf(child: AddonInstance): Package;
    constructor(child: AddonInstance);
    _ensureBabelDetails(): void;
    get babelOptions(): TransformOptions;
    get babelMajorVersion(): number | undefined;
    get isFastBootEnabled(): boolean;
    private buildBabelOptions;
    private get pkg();
    get namespace(): string;
    magicDeps: Map<string, string> | undefined;
    hasDependency(name: string): boolean;
    requestedRange(packageName: string): string | undefined;
    private hasNonDevDependency;
    static categorize(importedPath: string, partial?: boolean): "local" | "url" | "imprecise" | "dep";
    resolve(importedPath: string, fromPath: string): DepResolution | LocalResolution | URLResolution | undefined;
    resolve(importedPath: string, fromPath: string, partial: true): DepResolution | LocalResolution | URLResolution | ImpreciseResolution | undefined;
    private assertAllowedDependency;
    private excludesDependency;
    get webpackConfig(): any;
    get skipBabel(): Options['skipBabel'];
    get aliases(): Record<string, string> | undefined;
    private aliasFor;
    get fileExtensions(): string[];
    publicAssetURL(): string;
    /**
     * The function for defining the early boot set.
     * Used when we begin building entry files for webpack, so that we can query all packages listed
     * in the early boot set to check if they are v2 addons --if they are v2 addons,
     * we remove them from the early boot set, as this feature is for a rare compatibility circumstance that
     * only affects v1 addons consumed by v2 addons.
     */
    get earlyBootSet(): undefined | ((defaults: string[]) => string[]);
    get styleLoaderOptions(): Record<string, unknown> | undefined;
    get cssLoaderOptions(): Record<string, unknown> | undefined;
    get miniCssExtractPluginOptions(): Record<string, unknown> | undefined;
    get forbidsEval(): boolean;
    get insertScriptsAt(): string | undefined;
    get insertStylesAt(): string | undefined;
    get watchedDirectories(): string[] | undefined;
    cleanBabelConfig(): TransformOptions;
    browserslist(): string;
}
export {};
