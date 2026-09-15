/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-testimonial. Base: cards.
 * Source: https://credera.com/en-us/careers/students (+ experienced-professionals)
 *
 * The source is a "quote carousel" (quote-carousel-level-one). The per-person
 * card is an ImageDiv, which holds:
 *   - QuoteImage  → the portrait <picture>/<img>
 *   - QuoteButton → ButtonText ("Click To See X's Message") + QuoteContents
 *                   (QuoteText = the quote, AuthorName, AuthorTitle = the role)
 * The carousel ships desktop + mobile copies (7 each). We consume the desktop
 * slider only and fall back to any ImageDiv if no desktop slider is present.
 *
 * Follows the cards convention: this container block has no own model; each card
 * is one row with two cells — cell 1 = image (field:image + collapsed
 * field:imageAlt), cell 2 = text (field:text) holding grouped rich-text
 * paragraphs (label, quote, name, role). An empty cell is still emitted when a
 * part is missing.
 */
export default function parse(element, { document }) {
  const clean = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const realSrc = (scope) => {
    for (const i of scope.querySelectorAll('picture img, img')) {
      const s = i.getAttribute('src') || '';
      if (s && !s.startsWith('data:') && !s.startsWith('blob:')) return { src: s, alt: i.getAttribute('alt') || '' };
    }
    for (const src of scope.querySelectorAll('picture source')) {
      const first = (src.getAttribute('srcset') || '').split(',')[0].trim().split(/\s+/)[0];
      if (first && !first.startsWith('data:')) return { src: first, alt: '' };
    }
    return null;
  };

  // Prefer the desktop slider so we don't double-count the mobile copies.
  const desktop = element.querySelector('[class*="quote-carousel-level-one__DesktopSlider"]');
  const scope = desktop || element;
  const cards = Array.from(scope.querySelectorAll('[class*="quote-carousel-level-one__ImageDiv"]'));

  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    const hit = realSrc(card);
    const label = clean(card.querySelector('[class*="quote-carousel-level-one__ButtonText"]'));
    const quote = clean(card.querySelector('[class*="quote-carousel-level-one__QuoteText"]'));
    const name = clean(card.querySelector('[class*="quote-carousel-level-one__AuthorName"]'));
    const role = clean(card.querySelector('[class*="quote-carousel-level-one__AuthorTitle"]'));

    if (!name && !quote && !hit) return;
    // Dedupe by person in case desktop scoping fails and mobile copies leak in.
    const key = name || label || (hit && hit.src) || quote.slice(0, 40);
    if (seen.has(key)) return;
    seen.add(key);

    // Cell 1 — image (field:image; alt collapses into field:imageAlt)
    let imageCell = '';
    if (hit) {
      const img = document.createElement('img');
      img.setAttribute('src', hit.src);
      img.setAttribute('alt', hit.alt || name || '');
      imageCell = [document.createComment(' field:image '), img];
    }

    // Cell 2 — text (field:text): label + quote + name + role as grouped paragraphs
    const textCell = [document.createComment(' field:text ')];
    [label, quote, name, role].forEach((val) => {
      if (val) {
        const p = document.createElement('p');
        p.textContent = val;
        textCell.push(p);
      }
    });

    cells.push([imageCell, textCell.length > 1 ? textCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-testimonial', cells });
  element.replaceWith(block);
}
