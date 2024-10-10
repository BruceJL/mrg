declare type Target = string | Element | Document | Window;
export default Target;
export interface HTMLElementContentEditable extends HTMLElement {
    isContentEditable: true;
}
export declare function isElement(target: unknown): target is Element;
export declare function isWindow(target: Target): target is Window;
export declare function isDocument(target: unknown): target is Document;
export declare function isContentEditable(element: Element): element is HTMLElementContentEditable;
//# sourceMappingURL=-target.d.ts.map