/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://credera.com/en-us/careers
 * Two instance shapes handled:
 *   1) "Life at Credera" band (.animate-in Fade): eyebrow label <p>, <h2>,
 *      body <p>, "Learn more" link, and an image in an ImageContainer.
 *   2) "#featuredContent" callout (elevated-content): <h5> heading, a bare text
 *      node for the body, "Learn more" link, and the person image inside a
 *      <picture> (a gatsby blur-up data: placeholder <img> precedes it).
 * Structure (xwalk columns): row 1 = block name, row 2 = N side-by-side cells.
 * Columns blocks carry ONLY default content — no field:* hints (per hinting rules).
 * Layout normalized to text column then media column.
 */
export default function parse(element, { document }) {
  const clean = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // --- Eyebrow label (only present on the "Life at Credera" shape) ---
  const labelEl = element.querySelector('[class*="TitleSetLabel"], [class*="StyledLabel"]');

  // --- Heading (h2 on shape 1, h5 on shape 2; class casing varies) ---
  const headingEl = element.querySelector(
    'h2, h3, h4, h5, [class*="TitleSetHeading"], [class*="HeaderContainer"] h1',
  );

  // --- Body copy: dedicated <p> on shape 1; bare text node on shape 2 ---
  let bodyText = '';
  const bodyEl = element.querySelector('[class*="TitleSetText"], p[class*="StyledText"]');
  if (bodyEl) {
    bodyText = clean(bodyEl);
  } else {
    // Shape 2: the paragraph is loose text inside the text container. Clone it,
    // strip the heading and any links, and read what remains.
    const textContainer = element.querySelector('[class*="TextContainer"], [class*="ContentContainer"]');
    if (textContainer) {
      const cloneC = textContainer.cloneNode(true);
      cloneC.querySelectorAll('h1, h2, h3, h4, h5, h6, a').forEach((n) => n.remove());
      bodyText = clean(cloneC);
    }
  }

  // --- CTA link (icon-only children are dropped via textContent) ---
  const ctaEl = element.querySelector('[class*="CTALinkInternal"], a[class*="StyledLink"], a[linkstyle]');

  // --- Image: prefer a real (non-placeholder) src from a <picture> ---
  // Gatsby lazy-loads images: the <img src> may still be a data: blur-up
  // placeholder while the real URL lives in srcset (on the <img> or a <source>).
  const firstSrcsetUrl = (node) => {
    const set = node && node.getAttribute('srcset');
    if (!set) return '';
    const first = set.split(',')[0].trim().split(/\s+/)[0];
    return first && !first.startsWith('data:') ? first : '';
  };
  let realSrc = '';
  let realImg = null;
  const imgCandidates = Array.from(
    element.querySelectorAll('[class*="ImageContainer"] img, [class*="Person"] picture img, picture img, img'),
  );
  for (const candidate of imgCandidates) {
    const src = candidate.getAttribute('src') || '';
    if (src && !src.startsWith('data:')) { realImg = candidate; realSrc = src; break; }
    // Fallback: try the image's own srcset, then any <source> in its <picture>.
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
    if (fromSet) { realImg = candidate; realSrc = fromSet; break; }
  }

  // Empty-block guard
  if (!clean(headingEl) && !bodyText && !realImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Build the text cell (default content, no field hints for columns) ---
  const textCell = [];

  const labelText = clean(labelEl);
  if (labelText) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = labelText;
    p.appendChild(em);
    textCell.push(p);
  }

  const headingText = clean(headingEl);
  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    textCell.push(h2);
  }

  if (bodyText) {
    const p = document.createElement('p');
    p.textContent = bodyText;
    textCell.push(p);
  }

  if (ctaEl) {
    const a = document.createElement('a');
    a.setAttribute('href', ctaEl.getAttribute('href') || '#');
    a.textContent = clean(ctaEl);
    const p = document.createElement('p');
    p.appendChild(a);
    textCell.push(p);
  }

  // --- Build the media cell ---
  let mediaCell = '';
  if (realImg) {
    const image = document.createElement('img');
    image.setAttribute('src', realImg.getAttribute('src'));
    if (realImg.getAttribute('alt')) image.setAttribute('alt', realImg.getAttribute('alt'));
    mediaCell = image;
  }

  const cells = [];
  // Row 2: two columns — text, then media
  cells.push([textCell.length ? textCell : '', mediaCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
