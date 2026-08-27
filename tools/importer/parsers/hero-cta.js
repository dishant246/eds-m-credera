/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-cta. Base: hero.
 * Source: https://credera.com/en-us (footer CTA banner)
 * Structure (xwalk hero): 1 column, rows = image (optional) + text.
 * Fields: image (reference), imageAlt (collapsed), text (richtext).
 */
export default function parse(element, { document }) {
  const titleEl = element.querySelector('h1, h2, [class*="MainTitle"]');
  const bodyEl = element.querySelector('[class*="BodyText"] p, [class*="BodyText"]');
  const ctaSource = element.querySelector('[class*="ButtonContainer"] a, a[class*="StyledLink"]');

  const titleText = titleEl ? titleEl.textContent.trim() : '';
  const bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, ' ').trim() : '';

  // Empty-block guard
  if (!titleText && !bodyText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [document.createComment(' field:text ')];

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    contentCell.push(h2);
  }

  if (bodyText) {
    const p = document.createElement('p');
    p.textContent = bodyText;
    contentCell.push(p);
  }

  if (ctaSource) {
    const a = document.createElement('a');
    a.setAttribute('href', ctaSource.getAttribute('href') || '#');
    a.textContent = ctaSource.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(a);
    contentCell.push(p);
  }

  const cells = [];
  // Row 2: background image (none) — empty cell, no field hint
  cells.push(['']);
  // Row 3: text content
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-cta', cells });
  element.replaceWith(block);
}
