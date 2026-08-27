/* eslint-disable */
/* global WebImporter */
/**
 * Parser for marquee. Base: marquee (custom — inferred from source HTML).
 * Source: https://credera.com/en-us (scrolling ticker)
 * Structure (xwalk marquee): 1 column, 1 content row.
 * Fields: text (richtext).
 * Note: the ticker duplicates the same phrase many times in the source markup
 * to fill the scroll track; all instances are preserved to match the source.
 */
export default function parse(element, { document }) {
  const items = Array.from(
    element.querySelectorAll('[class*="TickerText"]'),
  );

  const phrases = items
    .map((item) => item.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Empty-block guard
  if (phrases.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [document.createComment(' field:text ')];
  phrases.forEach((phrase) => {
    const p = document.createElement('p');
    p.textContent = phrase;
    contentCell.push(p);
  });

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'marquee', cells });
  element.replaceWith(block);
}
