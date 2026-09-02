/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards.
 * Source: https://credera.com/en-us (Industry-Specific Expertise)
 * Structure (xwalk cards container): each industry = one row with 2 cells:
 *   cell 1 = image/icon (field:image + collapsed field:imageAlt), cell 2 = text (field:text: linked heading).
 * Card model fields: image (reference), text (richtext).
 * Note: industry names are split across multiple text spans around the icon; joined here.
 *
 * ICON RECOVERY: On the live site the industry icons are rendered client-side as
 * throwaway blob: object URLs (URL.createObjectURL), which are not fetchable at
 * import time. We recovered the real SVGs and committed them to /icons/, then
 * map each industry (by its link path slug) to its committed icon file. Repo-
 * served absolute paths survive JCR ingestion cleanly (unlike data: URIs, which
 * AEM drops, and external URLs, which get DAM-rewritten and double-escaped).
 */
const ICON_BY_SLUG = {
  "consumer": "/icons/industry-consumer.svg",
  "energy-and-resources": "/icons/industry-energy-resources.svg",
  "financial-services": "/icons/industry-financial-services.svg",
  "healthcare-life-sciences": "/icons/industry-healthcare-life-sciences.svg",
  "technology-media-telecommunications": "/icons/industry-tech-media-telecom.svg",
  "publicsector": "/icons/industry-public-sector.svg",
  "business-and-industrial-markets": "/icons/industry-business-industrial-markets.svg",
};

function slugFromHref(href) {
  const m = (href || '').match(/\/industries\/([^/?#]+)/);
  return m ? m[1] : '';
}

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

    // Prefer a stable recovered icon src over the live blob: URL
    const slug = slugFromHref(href);
    let src = ICON_BY_SLUG[slug] || '';
    if (!src && img) {
      const liveSrc = img.getAttribute('src') || '';
      // Never emit a blob: URL - it will not survive import
      if (liveSrc && !liveSrc.startsWith('blob:')) src = liveSrc;
    }
    const alt = (img && img.getAttribute('alt')) || (name ? name + ' icon' : '');

    // Image cell (field:image; alt collapses into imageAlt attribute)
    let imageCell = '';
    if (src) {
      const picture = document.createElement('img');
      picture.setAttribute('src', src);
      if (alt) picture.setAttribute('alt', alt);
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
