/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-office. Base: cards (xwalk container).
 * Source: https://credera.com/en-us/about-us (office locations carousel).
 * Each office card = one row with 2 cells:
 *   cell 1 = field:image (office illustration; alt collapses into imageAlt),
 *   cell 2 = field:text (office name heading + address + optional phone + "View Office" CTA).
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('[class*="OfficeCardContainer"]'));

  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    // Real illustration lives inside <picture>; sibling data: URI is a placeholder
    const srcImg = card.querySelector('picture img[src^="http"], picture img');

    const titleEl = card.querySelector('[class*="OfficeTitle"]');
    const dedupeKey = (srcImg && srcImg.getAttribute('src'))
      || (titleEl && titleEl.textContent.trim())
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

    const addressEl = card.querySelector('[class*="OfficeAddress"]');
    const phoneEl = card.querySelector('[class*="OfficePhoneNumber"]');
    const viewLink = card.querySelector('a[class*="OfficeLink"]');

    const textCell = [document.createComment(' field:text ')];
    if (titleEl && titleEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      textCell.push(h3);
    }
    if (addressEl) {
      // preserve line breaks in the address
      const p = document.createElement('p');
      p.innerHTML = addressEl.innerHTML;
      textCell.push(p);
    }
    if (phoneEl && phoneEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = phoneEl.textContent.trim();
      textCell.push(p);
    }
    if (viewLink && viewLink.getAttribute('href')) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', viewLink.getAttribute('href'));
      a.textContent = viewLink.textContent.replace(/\s+/g, ' ').trim() || 'View Office';
      p.appendChild(a);
      textCell.push(p);
    }

    if (Array.isArray(imageCell) || textCell.length > 1) {
      cells.push([imageCell, textCell.length > 1 ? textCell : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-office', cells });
  element.replaceWith(block);
}
