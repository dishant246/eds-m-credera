/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-award. Base: cards (xwalk container).
 * Source: https://credera.com/en-us/about-us (awards & recognition logos).
 * Each award = one row with 2 cells:
 *   cell 1 = field:image (award logo; alt collapses into imageAlt),
 *   cell 2 = field:text (empty — awards are logo-only, but the cell must exist per cards convention).
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Each award logo lives in its own IconContainer
  const icons = Array.from(
    element.querySelectorAll('[class*="IconContainer"] img, img[class*="Icon"]'),
  );

  const cells = [];
  const seen = new Set();

  icons.forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || seen.has(src)) return;
    seen.add(src);

    const image = document.createElement('img');
    image.setAttribute('src', src);
    if (img.getAttribute('alt')) image.setAttribute('alt', img.getAttribute('alt'));
    const imageCell = [document.createComment(' field:image '), image];

    // Text cell has no content for awards, but the cell must be present.
    cells.push([imageCell, '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-award', cells });
  element.replaceWith(block);
}
