/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards.
 * Source: https://credera.com/en-us (Industry-Specific Expertise)
 * Structure (xwalk cards container): each industry = one row with 2 cells:
 *   cell 1 = image/icon (field:image + collapsed field:imageAlt), cell 2 = text (field:text: linked heading).
 * Card model fields: image (reference), text (richtext).
 * Note: industry names are split across multiple text spans around the icon; joined here.
 */
export default function parse(element, { document }) {
  const links = Array.from(
    element.querySelectorAll('a[class*="IndustryLinkContainer"]'),
  );

  const cells = [];

  links.forEach((link) => {
    const href = link.getAttribute('href') || '';

    // Industry name: join all name-text spans (name is split around the icon)
    const nameParts = Array.from(link.querySelectorAll('[class*="IndustryNameText"]'))
      .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const name = nameParts.join(' ').replace(/\s+/g, ' ').trim();

    // Icon image
    const img = link.querySelector('img');

    // Image cell (field:image; alt collapses into imageAlt attribute)
    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const picture = document.createElement('img');
      picture.setAttribute('src', img.getAttribute('src'));
      if (img.getAttribute('alt')) picture.setAttribute('alt', img.getAttribute('alt'));
      imageCell = [document.createComment(' field:image '), picture];
    }

    // Text cell (linked heading)
    const textCell = [document.createComment(' field:text ')];
    if (name) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = name;
        h3.appendChild(a);
      } else {
        h3.textContent = name;
      }
      textCell.push(h3);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
