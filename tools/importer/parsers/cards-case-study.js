/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-case-study. Base: cards.
 * Source: https://credera.com/en-us (Meaningful Results — case studies)
 * Two instance shapes handled:
 *   1) Featured card: the matched element IS a single case-study anchor
 *      (video-background__CaseStudyContent) — title only (+ category if present).
 *   2) Grid section: a wrapper containing multiple case-study-block anchors,
 *      each with image, title, category, and a "Read on" link.
 * Structure (xwalk cards container): each card = one row with 2 cells:
 *   cell 1 = image (field:image + collapsed field:imageAlt),
 *   cell 2 = text (field:text: title heading + category + linked CTA).
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Collect card anchors. If the matched element is itself a card anchor
  // (featured instance), use it directly; otherwise find card anchors inside.
  let cards;
  const selfIsCard = element.matches
    && element.matches('a[class*="CaseStudyContent"], a[class*="CaseStudyWrapper"]');
  if (selfIsCard) {
    cards = [element];
  } else {
    cards = Array.from(
      element.querySelectorAll('a[class*="CaseStudyWrapper"], a[class*="CaseStudyContent"]'),
    );
  }

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const img = card.querySelector('img[class*="CaseStudyImage"], [class*="ImageWrapper"] img, img');
    const titleEl = card.querySelector('[class*="CaseStudyTitle"], h1, h2, h3, h4');

    // Category: a leaf node containing "/" (e.g. "Pharmaceuticals / Artificial Intelligence")
    let category = '';
    const candidates = card.querySelectorAll('[class*="Category"], [class*="Tag"], div, span, p');
    for (const el of candidates) {
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t && t.includes('/') && t.length < 100 && el.children.length === 0) {
        category = t;
        break;
      }
    }

    // "Read on" style CTA (inner link) — fall back to the card href
    const innerLink = card.querySelector('a[class*="CaseStudyLink"]');
    const ctaHref = (innerLink && innerLink.getAttribute('href')) || href;
    const ctaLabel = innerLink ? innerLink.textContent.replace(/\s+/g, ' ').trim() : '';

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
      h3.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(h3);
    }
    if (category) {
      const p = document.createElement('p');
      p.textContent = category;
      textCell.push(p);
    }
    if (ctaHref && ctaLabel) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', ctaHref);
      a.textContent = ctaLabel;
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study', cells });
  element.replaceWith(block);
}
