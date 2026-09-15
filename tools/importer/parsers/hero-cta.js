/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-cta. Base: hero.
 * Source: https://credera.com/en-us (footer CTA banner) + careers pages.
 * Structure (xwalk hero): 1 column, rows = image (optional) + text.
 * Fields: image (reference), imageAlt (collapsed), text (richtext).
 *
 * Two source variants share the footer-cta__FooterCtaWrapper structure:
 *   - Homepage "Let's talk!" — orange band, one paragraph + one CTA to /contact.
 *   - Careers "Ready to start your next chapter?" — dark maroon band, one
 *     paragraph + TWO links (See open positions + a cross-link). The migrated
 *     content previously dropped the paragraph (its class isn't "BodyText") and
 *     the second link (querySelector took only the first). This parser now
 *     captures the paragraph via a generic "text <p> with no anchor" rule and
 *     ALL cta links, and tags the careers instance with a `dark` variant class
 *     (keyed on a /careers CTA href) so blocks/hero-cta/hero-cta.css can paint it
 *     maroon without affecting the homepage's orange band.
 */
export default function parse(element, { document }) {
  const titleEl = element.querySelector('h1, h2, [class*="MainTitle"]');
  const titleText = titleEl ? titleEl.textContent.trim() : '';

  // Body text: the description paragraph. Prefer an explicit BodyText, else any
  // <p> that carries text and does not wrap a link (excludes the CTA rows).
  let bodyText = '';
  const bodyExplicit = element.querySelector('[class*="BodyText"] p, [class*="BodyText"], [class*="TitleSetText"]');
  if (bodyExplicit && !bodyExplicit.querySelector('a')) {
    bodyText = bodyExplicit.textContent.replace(/\s+/g, ' ').trim();
  }
  if (!bodyText) {
    const p = Array.from(element.querySelectorAll('p'))
      .find((el) => !el.querySelector('a') && el.textContent.trim());
    if (p) bodyText = p.textContent.replace(/\s+/g, ' ').trim();
  }

  // CTA links: collect ALL (not just the first), de-duplicated by href+text.
  const ctaEls = Array.from(element.querySelectorAll('[class*="ButtonContainer"] a, a[class*="StyledLink"]'));
  const seen = new Set();
  const ctas = [];
  ctaEls.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const text = a.textContent.trim();
    const key = `${href}::${text}`;
    if (!href || !text || seen.has(key)) return;
    seen.add(key);
    ctas.push({ href, text });
  });

  // Empty-block guard
  if (!titleText && !bodyText && ctas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [document.createComment(' field:text ')];

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    contentCell.push(h2);
  }

  if (bodyText) {
    const p = document.createElement('p');
    p.textContent = bodyText;
    contentCell.push(p);
  }

  ctas.forEach((cta) => {
    const a = document.createElement('a');
    a.setAttribute('href', cta.href);
    a.textContent = cta.text;
    const p = document.createElement('p');
    p.appendChild(a);
    contentCell.push(p);
  });

  const cells = [];
  // Row 2: background image (none) — empty cell, no field hint
  cells.push(['']);
  // Row 3: text content
  cells.push([contentCell]);

  // Careers CTA is the dark (maroon) variant — detect by a /careers CTA target.
  // Homepage CTA links to /contact, so it stays the default orange.
  const isDark = ctas.some((c) => /\/careers(\/|$)/.test(c.href));
  const name = isDark ? 'hero-cta (dark)' : 'hero-cta';

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
