/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-partner. Base: cards.
 * Source: https://credera.com/en-us (Partners in Performance)
 * Structure (xwalk cards container): each card = one row with 2 cells:
 *   cell 1 = image (field:image), cell 2 = text (field:text: heading + description + CTA).
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  const cards = Array.from(
    element.querySelectorAll('a[class*="PartnerBlockWrapper"]'),
  );

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const nameEl = card.querySelector('[class*="PartnerName"], h2, h3');
    const descEl = card.querySelector('[class*="PartnerDescription"], p');

    // Image cell: no real image asset in source (arrow icon only) — leave empty.
    const imageCell = '';

    // Text cell
    const textCell = [document.createComment(' field:text ')];
    if (nameEl && nameEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = nameEl.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = nameEl.textContent.trim();
      }
      textCell.push(h3);
    }
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      textCell.push(p);
    }

    // Only push a row if there is text content
    if (textCell.length > 1) {
      cells.push([imageCell, textCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-partner', cells });
  element.replaceWith(block);
}
