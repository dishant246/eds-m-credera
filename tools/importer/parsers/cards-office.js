/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-office. Base: cards.
 * Source: https://credera.com/en-us/careers (offices carousel)
 * Structure (xwalk cards container): each card = one row with 2 cells:
 *   cell 1 = image  (field:image — location icon)
 *   cell 2 = text   (field:text — office name <h4>, address <p> with <br>,
 *                    optional phone <p>, and a "View Office" link)
 * Item model (cards-office-item) fields: image (richtext), text (richtext).
 *
 * Source note: each office card is an <a> (WrapperLink) that ILLEGALLY nests a
 * second <a> (OfficeLink / "View Office"). The importer's HTML parser may split
 * such nesting, so we extract per office-card CONTAINER, not per anchor, and
 * rebuild the "View Office" link cleanly.
 */
export default function parse(element, { document }) {
  const clean = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // One wrapper per office card. CardWrapper wraps OfficeCardContainer, so
  // selecting both would double-count each card — use the outer wrapper only,
  // falling back to the container if the wrapper class isn't present.
  let cards = Array.from(element.querySelectorAll('[class*="CardWrapper"]'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('[class*="OfficeCardContainer"]'));
  }
  cards = cards.filter((c) => c.querySelector('[class*="OfficeInfo"], [class*="OfficeAddress"], h4'));

  const cells = [];

  cards.forEach((card) => {
    // --- Image cell (location icon) ---
    // Gatsby wrappers place a data: blur-up placeholder <img> BEFORE the real
    // <picture><img>. Skip placeholders; fall back to srcset (img or <source>).
    let imageCell = '';
    const firstSrcsetUrl = (node) => {
      const set = node && node.getAttribute('srcset');
      if (!set) return '';
      const first = set.split(',')[0].trim().split(/\s+/)[0];
      return first && !first.startsWith('data:') ? first : '';
    };
    let iconSrc = '';
    let iconImg = null;
    const iconCandidates = Array.from(
      card.querySelectorAll('[class*="OfficeIllustration"] img, picture img, img'),
    );
    for (const candidate of iconCandidates) {
      const src = candidate.getAttribute('src') || '';
      if (src && !src.startsWith('data:')) { iconImg = candidate; iconSrc = src; break; }
      let fromSet = firstSrcsetUrl(candidate);
      if (!fromSet) {
        const pic = candidate.closest('picture');
        if (pic) {
          for (const source of pic.querySelectorAll('source')) {
            fromSet = firstSrcsetUrl(source);
            if (fromSet) break;
          }
        }
      }
      if (fromSet) { iconImg = candidate; iconSrc = fromSet; break; }
    }
    if (iconSrc) {
      const image = document.createElement('img');
      image.setAttribute('src', iconSrc);
      const alt = iconImg && iconImg.getAttribute('alt');
      if (alt) image.setAttribute('alt', alt);
      imageCell = [document.createComment(' field:image '), image];
    }

    // --- Text cell (office name, address, optional phone, View Office link) ---
    const textCell = [document.createComment(' field:text ')];

    // Office name: prefer the visible OfficeTitle inside OfficeInfo; the card
    // also carries a duplicate SecondaryOfficeTitle — pick the info-block one.
    const nameEl = card.querySelector('[class*="OfficeInfo"] [class*="OfficeTitle"], [class*="OfficeInfo"] h4, [class*="OfficeTitle"], h4');
    const nameText = clean(nameEl);
    if (nameText) {
      const h4 = document.createElement('h4');
      h4.textContent = nameText;
      textCell.push(h4);
    }

    // Address: preserve <br> line breaks by rebuilding the paragraph.
    const addressEl = card.querySelector('[class*="OfficeAddress"]');
    if (addressEl) {
      const p = document.createElement('p');
      Array.from(addressEl.childNodes).forEach((node) => {
        if (node.nodeType === 3) {
          const t = node.textContent.replace(/\s+/g, ' ').trim();
          if (t) p.appendChild(document.createTextNode(t));
        } else if (node.nodeName === 'BR') {
          p.appendChild(document.createElement('br'));
        }
      });
      if (p.childNodes.length) textCell.push(p);
    }

    // Optional phone number.
    const phoneEl = card.querySelector('[class*="OfficePhoneNumber"]');
    const phoneText = clean(phoneEl);
    if (phoneText) {
      const p = document.createElement('p');
      p.textContent = phoneText;
      textCell.push(p);
    }

    // "View Office" CTA. The source's WrapperLink <a> illegally wraps the whole
    // card and also nests the OfficeLink <a>; browser restructuring makes the
    // link's textContent absorb the entire card (name+address+phone). So read
    // only the link's own DIRECT text nodes for the label, and fall back to the
    // known "View Office" CTA text.
    const linkEl = card.querySelector('a[class*="OfficeLink"], a[linkstyle]');
    if (linkEl) {
      let label = Array.from(linkEl.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
        .join(' ')
        .trim();
      // Guard against absorbed content: if the label looks like the whole card
      // (too long / contains the office name), use the canonical CTA text.
      if (!label || label.length > 40) label = 'View Office';
      const a = document.createElement('a');
      a.setAttribute('href', linkEl.getAttribute('href') || '#');
      a.textContent = label;
      const p = document.createElement('p');
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-office', cells });
  element.replaceWith(block);
}
