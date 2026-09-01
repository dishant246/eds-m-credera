/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-home. Base: hero.
 * Source: https://credera.com/en-us
 * Structure (xwalk hero): 1 column, rows = image (optional) + text.
 * Fields: image (reference), imageAlt (collapsed), text (richtext).
 */
export default function parse(element, { document }) {
  // --- Extract eyebrow / subtitle ---
  const subtitleEl = element.querySelector('.hero-section__Subtitle-sc-3sq6vd-2, [class*="Subtitle-sc"]');
  const subtitleText = subtitleEl ? subtitleEl.textContent.trim() : '';

  // --- Extract main title (desktop layout to avoid duplicated mobile text) ---
  const titleSpans = Array.from(
    element.querySelectorAll('.hero-section__DesktopTitleLayout-sc-3sq6vd-15 span[class*="TitleTextSpan"], [class*="DesktopTitleLayout"] span[class*="TitleTextSpan"]'),
  );
  let titleText = titleSpans.map((s) => s.textContent.trim()).filter(Boolean).join(' ');
  if (!titleText) {
    const h1 = element.querySelector('h1');
    titleText = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  // --- Extract body copy (single clean node preferred over line-reveal spans) ---
  // The source highlights select words in brand orange via <span> wrappers
  // (e.g. "complexity", "success."). Preserve those as <strong> so the block
  // CSS can re-apply the accent color; fall back to plain text otherwise.
  const bodyEl = element.querySelector('.hero-section__BodyText-sc-3sq6vd-9, [class*="BodyText-sc"]');
  const bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, ' ').trim() : '';
  const bodyAccents = bodyEl
    ? Array.from(bodyEl.querySelectorAll('span'))
      .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    : [];

  // --- Extract CTA ---
  const ctaSource = element.querySelector('.hero-section__ButtonDiv-sc-3sq6vd-10 a, [class*="ButtonDiv"] a, a[class*="StyledLink"]');

  // Empty-block guard
  if (!titleText && !bodyText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Build clean content nodes ---
  const contentCell = [document.createComment(' field:text ')];

  if (subtitleText) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = subtitleText;
    p.appendChild(em);
    contentCell.push(p);
  }

  if (titleText) {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    contentCell.push(h1);
  }

  if (bodyText) {
    const p = document.createElement('p');
    if (bodyAccents.length) {
      // Rebuild the sentence, wrapping each accent phrase in <strong> so the
      // brand-orange highlight survives import as rich text.
      let remaining = bodyText;
      bodyAccents.forEach((phrase) => {
        const idx = remaining.indexOf(phrase);
        if (idx === -1) return;
        if (idx > 0) p.appendChild(document.createTextNode(remaining.slice(0, idx)));
        const strong = document.createElement('strong');
        strong.textContent = phrase;
        p.appendChild(strong);
        remaining = remaining.slice(idx + phrase.length);
      });
      if (remaining) p.appendChild(document.createTextNode(remaining));
    } else {
      p.textContent = bodyText;
    }
    contentCell.push(p);
  }

  if (ctaSource) {
    const a = document.createElement('a');
    a.setAttribute('href', ctaSource.getAttribute('href') || '#');
    a.textContent = ctaSource.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(a);
    contentCell.push(p);
  }

  const cells = [];
  // Row 2: background image (none in source) — empty cell, no field hint
  cells.push(['']);
  // Row 3: text content
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });
  element.replaceWith(block);
}
