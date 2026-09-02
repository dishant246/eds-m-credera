/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-case-study. Base: cards.
 * Source: https://credera.com/en-us (Meaningful Results — case studies)
 * Two instance shapes handled:
 *   1) Featured card: the matched element IS a case-study anchor
 *      (video-background__CaseStudyContent). In the SOURCE this is a single
 *      composed card, but the anchor illegally nests another anchor (the
 *      "Read on" link), so the importer's HTML parser splits it into TWO
 *      fragment anchors (title-only, then category-only) and hoists the footer
 *      (category + Read-on) out as a sibling. The POSTER IMAGE also lives
 *      OUTSIDE the anchor, in a sibling video-background__VideoSectionWrapper.
 *      This parser therefore composes the featured card at the SCOPE level:
 *      it walks up to the wrapper that contains the poster, then gathers the
 *      poster + title + category + Read-on from the whole scope into ONE card,
 *      and removes the leftover footer so nothing renders loose. Subsequent
 *      stray fragment invocations (no title / detached scope) are dropped.
 *   2) Grid section: a wrapper containing multiple case-study-block anchors,
 *      each with image (case-study-block__CaseStudyImage), title, category, and
 *      a "Read on" link — each anchor is a well-formed single card.
 * Structure (xwalk cards container): each card = one row with 2 cells:
 *   cell 1 = image (field:image), cell 2 = text (field:text: title heading +
 *   category + linked CTA).
 * Card model fields: image (richtext), text (richtext).
 */
export default function parse(element, { document }) {
  const clean = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // Build a 2-cell card row [imageCell, textCell] from raw parts.
  const buildCardRow = (img, titleText, categoryText, ctaHref, ctaLabel) => {
    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const image = document.createElement('img');
      image.setAttribute('src', img.getAttribute('src'));
      if (img.getAttribute('alt')) image.setAttribute('alt', img.getAttribute('alt'));
      imageCell = [document.createComment(' field:image '), image];
    }
    const textCell = [document.createComment(' field:text ')];
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      textCell.push(h3);
    }
    if (categoryText) {
      const p = document.createElement('p');
      p.textContent = categoryText;
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
      return [imageCell, textCell.length > 1 ? textCell : ''];
    }
    return null;
  };

  const isFeaturedAnchor = element.matches
    && element.matches('a[class*="CaseStudyContent"]');

  // ---- Featured card (composed at scope level) ----
  if (isFeaturedAnchor) {
    // Walk up to the wrapper that also contains the poster image.
    let scope = element.parentElement;
    while (scope && !scope.querySelector('img[class*="PosterImage"]')) {
      scope = scope.parentElement;
    }
    const titleEl = scope && scope.querySelector('[class*="CaseStudyTitle"]');
    // A stray fragment (category-only anchor, or a detached scope after the
    // composed card was already built) — drop it so it doesn't render loose.
    if (!scope || !titleEl) {
      element.remove();
      return;
    }

    const img = scope.querySelector('img[class*="PosterImage"], [class*="VideoContainer"] img');
    const categoryEl = scope.querySelector('[class*="CaseStudyCategory"]');
    const linkEl = scope.querySelector('a[class*="CaseStudyLink"]');
    const cardHref = element.getAttribute('href') || '';
    const ctaHref = (linkEl && linkEl.getAttribute('href')) || cardHref;
    const ctaLabel = linkEl ? clean(linkEl) : '';

    const row = buildCardRow(img, clean(titleEl), clean(categoryEl), ctaHref, ctaLabel);
    if (!row) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'cards-case-study',
      cells: [row],
    });
    element.replaceWith(block);

    // Remove the hoisted footer (category + Read-on) so those fragments — and
    // the second fragment anchor nested inside it — don't render as loose
    // content or trigger a duplicate block.
    const footer = scope.querySelector('[class*="CaseStudyFooter"]');
    if (footer) footer.remove();
    return;
  }

  // ---- Grid section (one well-formed anchor per card) ----
  const cards = Array.from(
    element.querySelectorAll('a[class*="CaseStudyWrapper"], a[class*="CaseStudyContent"]'),
  );

  const cells = [];
  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const img = card.querySelector(
      'img[class*="CaseStudyImage"], [class*="ImageContainer"] img, [class*="ImageWrapper"] img',
    );
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

    const innerLink = card.querySelector('a[class*="CaseStudyLink"]');
    const ctaHref = (innerLink && innerLink.getAttribute('href')) || href;
    const ctaLabel = innerLink ? clean(innerLink) : '';

    const row = buildCardRow(img, clean(titleEl), category, ctaHref, ctaLabel);
    if (row) cells.push(row);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study', cells });
  element.replaceWith(block);
}
