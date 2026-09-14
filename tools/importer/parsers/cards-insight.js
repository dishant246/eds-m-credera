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
  // Helper: first non-data image src (prefers a real <picture>/<source> URL over
  // a gatsby data: blur-up placeholder).
  const realImgSrc = (scope) => {
    const imgs = Array.from(scope.querySelectorAll('picture img, img'));
    for (const i of imgs) {
      const s = i.getAttribute('src') || '';
      if (s && !s.startsWith('data:')) return { src: s, alt: i.getAttribute('alt') || '' };
    }
    // fall back to a <source srcset> first URL
    for (const src of scope.querySelectorAll('picture source')) {
      const first = (src.getAttribute('srcset') || '').split(',')[0].trim().split(/\s+/)[0];
      if (first && !first.startsWith('data:')) return { src: first, alt: '' };
    }
    return null;
  };

  // ---- Careers "video gallery" shape (video-carousel__VideoCard) ----
  // Each card = a thumbnail image + a title <p> + a date <span>. No link (the
  // source plays the video inline). Different DOM from the homepage InsightCard.
  const videoCards = Array.from(element.querySelectorAll('[class*="VideoCard"]'));
  if (videoCards.length) {
    const vcells = [];
    videoCards.forEach((card) => {
      const hit = realImgSrc(card);
      const title = card.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '';
      // Date: prefer a <span>, but fall back to a date-looking leaf text node
      // (some renders wrap the date differently than a bare <span>).
      let date = card.querySelector('span')?.textContent.replace(/\s+/g, ' ').trim() || '';
      if (!date) {
        const DATE_RE = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/;
        const leaves = Array.from(card.querySelectorAll('span, time, small, div, p'))
          .filter((el) => el.children.length === 0);
        for (const el of leaves) {
          const t = el.textContent.replace(/\s+/g, ' ').trim();
          if (t && t !== title && DATE_RE.test(t)) { date = t; break; }
        }
      }
      let imageCell = '';
      if (hit) {
        const image = document.createElement('img');
        image.setAttribute('src', hit.src);
        image.setAttribute('alt', hit.alt || title);
        imageCell = [document.createComment(' field:image '), image];
      }
      const textCell = [document.createComment(' field:text ')];
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title;
        textCell.push(h3);
      }
      if (date) {
        const p = document.createElement('p');
        p.textContent = date;
        textCell.push(p);
      }
      if (textCell.length > 1 || Array.isArray(imageCell)) {
        vcells.push([imageCell, textCell.length > 1 ? textCell : '']);
      }
    });
    if (vcells.length) {
      const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insight', cells: vcells });
      element.replaceWith(block);
      return;
    }
  }

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
