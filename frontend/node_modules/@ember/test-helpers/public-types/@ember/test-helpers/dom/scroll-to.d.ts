/**
  Scrolls DOM element or selector to the given coordinates.
  @public
  @param {string|HTMLElement} target the element or selector to trigger scroll on
  @param {Number} x x-coordinate
  @param {Number} y y-coordinate
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Scroll DOM element to specific coordinates
  </caption>

  scrollTo('#my-long-div', 0, 0); // scroll to top
  scrollTo('#my-long-div', 0, 100); // scroll down
*/
export default function scrollTo(target: string | HTMLElement, x: number, y: number): Promise<void>;
//# sourceMappingURL=scroll-to.d.ts.map