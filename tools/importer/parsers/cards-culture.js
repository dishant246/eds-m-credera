/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-culture. Base: cards (xwalk container).
 * Source: https://credera.com/en-us/about-us (culture quote carousel).
 * Each culture card = one row with 2 cells:
 *   cell 1 = field:image (person photo),
 *   cell 2 = field:text (quote + author name + author title).
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Each culture card is an ImageDiv wrapper holding a photo + quote button contents.
  // Source renders each card twice (desktop + mobile sliders) — dedupe by photo src.
  const cards = Array.from(element.querySelectorAll('[class*="ImageDiv"]'));

  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    // Real photo lives inside <picture>; the sibling data: URI is a placeholder
    const srcImg = card.querySelector('picture img[src^="http"], picture img');

    // Dedupe: skip cards whose photo we've already emitted (mobile slider clone)
    const dedupeKey = (srcImg && srcImg.getAttribute('src'))
      || (card.querySelector('[class*="AuthorName"]') || {}).textContent
      || '';
    if (dedupeKey && seen.has(dedupeKey)) return;
    if (dedupeKey) seen.add(dedupeKey);

    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const image = document.createElement('img');
      image.setAttribute('src', srcImg.getAttribute('src'));
      if (srcImg.getAttribute('alt')) image.setAttribute('alt', srcImg.getAttribute('alt'));
      imageCell = [document.createComment(' field:image '), image];
    }

    const quoteEl = card.querySelector('[class*="QuoteText"]');
    const nameEl = card.querySelector('[class*="AuthorName"]');
    const titleEl = card.querySelector('[class*="AuthorTitle"]');

    const textCell = [document.createComment(' field:text ')];
    if (quoteEl && quoteEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = quoteEl.textContent.trim();
      textCell.push(p);
    }
    if (nameEl && nameEl.textContent.trim()) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = nameEl.textContent.trim();
      p.appendChild(strong);
      textCell.push(p);
    }
    if (titleEl && titleEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = titleEl.textContent.trim();
      textCell.push(p);
    }

    // Only add the row if we captured content for the card.
    // Both cells always present (image cell may be empty '') per cards convention.
    if (Array.isArray(imageCell) || textCell.length > 1) {
      cells.push([imageCell, textCell.length > 1 ? textCell : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-culture', cells });
  element.replaceWith(block);
}
