/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insight. Base: cards.
 * Source: https://credera.com/en-us (Our take on what's next)
 * Structure (xwalk cards container): each insight card = one row with 2 cells:
 *   cell 1 = image (field:image + collapsed field:imageAlt),
 *   cell 2 = text (field:text: title heading + category + linked "Read on").
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  const cards = Array.from(
    element.querySelectorAll('a[class*="InsightCard"]'),
  );

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const img = card.querySelector('img[class*="CardImage"], [class*="CardImageWrapper"] img');
    const titleEl = card.querySelector('[class*="CardTitle"], h3, h2');
    const categoryEl = card.querySelector('[class*="CardCategory"]');
    const linkLabelEl = card.querySelector('[class*="CardLink"]');

    // Image cell (field:image; alt collapses into imageAlt attribute)
    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const image = document.createElement('img');
      image.setAttribute('src', img.getAttribute('src'));
      if (img.getAttribute('alt')) image.setAttribute('alt', img.getAttribute('alt'));
      imageCell = [document.createComment(' field:image '), image];
    }

    // Text cell
    const textCell = [document.createComment(' field:text ')];
    if (titleEl && titleEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      textCell.push(h3);
    }
    if (categoryEl && categoryEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = categoryEl.textContent.trim();
      textCell.push(p);
    }
    // "Read on" CTA linked to the card href
    const linkLabel = linkLabelEl ? linkLabelEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (href && linkLabel) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = linkLabel;
      p.appendChild(a);
      textCell.push(p);
    }

    if (textCell.length > 1 || Array.isArray(imageCell)) {
      cells.push([imageCell, textCell.length > 1 ? textCell : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insight', cells });
  element.replaceWith(block);
}
