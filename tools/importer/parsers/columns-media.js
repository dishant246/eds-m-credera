/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns (xwalk columns block).
 * Source: https://credera.com/en-us/about-us (image-with-titleset sections).
 * Columns block: 1 content row with 2 columns. Per xwalk field-hinting rules,
 * Columns blocks carry NO field comments — cells hold default content only.
 * Column order is preserved from the source (image/text may be on either side).
 */
export default function parse(element, { document }) {
  const imageContainer = element.querySelector('[class*="ImageContainer"]');
  const textContainer = element.querySelector('[class*="TextSectionContainer"]');

  // Build the image column (real photo from <picture>, not the data: placeholder)
  const buildImageCol = () => {
    if (!imageContainer) return null;
    const srcImg = imageContainer.querySelector('picture img[src^="http"], picture img');
    if (!srcImg || !srcImg.getAttribute('src')) return null;
    const img = document.createElement('img');
    img.setAttribute('src', srcImg.getAttribute('src'));
    if (srcImg.getAttribute('alt')) img.setAttribute('alt', srcImg.getAttribute('alt'));
    return [img];
  };

  // Build the text column (label, heading, paragraph(s), CTA link(s))
  const buildTextCol = () => {
    if (!textContainer) return null;
    const parts = [];
    const label = textContainer.querySelector('[class*="TitleSetLabel"], p[class*="Label"]');
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      parts.push(p);
    }
    const heading = textContainer.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      parts.push(h);
    }
    // Body paragraph(s): use the rich paragraph text, skip empty/duplicate ones
    const paras = Array.from(textContainer.querySelectorAll('[class*="rich-paragraph"], [class*="TitleSetText"]'));
    const seenText = new Set();
    paras.forEach((para) => {
      const t = para.textContent.trim();
      if (t && !seenText.has(t)) {
        seenText.add(t);
        const p = document.createElement('p');
        p.textContent = t;
        parts.push(p);
      }
    });
    // CTA link(s)
    const links = Array.from(textContainer.querySelectorAll('a[href]'));
    links.forEach((link) => {
      const href = link.getAttribute('href');
      const text = link.textContent.replace(/\s+/g, ' ').trim();
      if (href && text) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = text;
        p.appendChild(a);
        parts.push(p);
      }
    });
    return parts.length ? parts : null;
  };

  const imageCol = buildImageCol();
  const textCol = buildTextCol();

  // Preserve source order: whichever container appears first in the DOM goes first.
  const cols = [];
  if (imageContainer && textContainer) {
    // DOCUMENT_POSITION_FOLLOWING === 4; avoid relying on a global `Node`.
    const imgFirst = imageContainer.compareDocumentPosition(textContainer) & 4;
    if (imgFirst) {
      if (imageCol) cols.push(imageCol);
      if (textCol) cols.push(textCol);
    } else {
      if (textCol) cols.push(textCol);
      if (imageCol) cols.push(imageCol);
    }
  } else {
    if (imageCol) cols.push(imageCol);
    if (textCol) cols.push(textCol);
  }

  // Empty-block guard (e.g. the empty paper-wrapper instance on this page)
  if (cols.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content row of N columns
  const cells = [cols];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
