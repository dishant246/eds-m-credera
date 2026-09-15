/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-home. Base: hero.
 * Source: https://credera.com/en-us
 * Structure (xwalk hero): 1 column, rows = image (optional) + text.
 * Fields: image (reference), imageAlt (collapsed), text (richtext).
 */
export default function parse(element, { document }) {
  // ---- Careers overview hero (careers__OverviewHeroSection) ----
  // Different DOM from the homepage hero: a HeroImageTop background image, a
  // Header with the H1 + a plain intro <p>, and a ButtonContainer with TWO CTAs
  // ("Experienced Professionals" + "Students"). Handle it explicitly so the
  // image, intro paragraph, and both CTAs all survive.
  if (element.matches && element.matches('[class*="OverviewHeroSection"], [class*="OverviewHeroSection"] *')
    || element.querySelector('[class*="OverviewHeroTitleSection"], [class*="careers__Header"]')) {
    const titleSection = element.querySelector('[class*="OverviewHeroTitleSection"]') || element;
    const header = titleSection.querySelector('[class*="careers__Header"]') || titleSection;
    const h1El = header.querySelector('h1');
    const introEl = header.querySelector('p');
    // CTAs: only real links (href). The students hero's "See Open Positions" is a
    // hrefless <button> (JS scroll) — skip it since it can't become a usable link.
    const ctaEls = Array.from(
      (titleSection.querySelector('[class*="ButtonContainer"]') || titleSection)
        .querySelectorAll('a[href]'),
    );
    // Hero images: the students/experienced sub-page heroes are a two-column
    // layout — the OverviewHeroSection holds a HeroImageSection (HeroImage1 +
    // HeroImage2, stacked) beside the title section. The block instance selector
    // targets the *title* section, so the images live in a SIBLING under the
    // shared OverviewHeroSection ancestor; climb to it before searching. Also
    // covers HeroImageTop (main careers hero). Collect ALL real images so both
    // stacked photos survive into the media cell (previously only one was taken,
    // and both actually fell through as loose default content).
    const heroScope = (element.closest && element.closest('[class*="OverviewHeroSection"]'))
      || (element.matches && element.matches('[class*="OverviewHeroSection"]') ? element : element);
    const imgWrap = heroScope.querySelector('[class*="HeroImageSection"], [class*="HeroImageTop"]') || heroScope;
    const heroImgs = [];
    const seenSrc = new Set();
    Array.from(imgWrap.querySelectorAll('img')).forEach((c) => {
      const src = c.getAttribute('src') || '';
      if (!src || src.startsWith('data:') || seenSrc.has(src)) return;
      seenSrc.add(src);
      heroImgs.push({ src, alt: c.getAttribute('alt') || '' });
    });

    if (h1El || introEl || ctaEls.length) {
      const contentCell = [document.createComment(' field:text ')];
      if (h1El) {
        const h1 = document.createElement('h1');
        h1.textContent = h1El.textContent.replace(/\s+/g, ' ').trim();
        contentCell.push(h1);
      }
      if (introEl && introEl.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = introEl.textContent.replace(/\s+/g, ' ').trim();
        contentCell.push(p);
      }
      ctaEls.forEach((cta) => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.setAttribute('href', cta.getAttribute('href') || '#');
        a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
        p.appendChild(a);
        contentCell.push(p);
      });

      // Row 1: hero image(s) (field:image). The students/experienced hero stacks
      // TWO photos; the field:image is a single richtext value, so both <img>
      // must live inside ONE <p> (two separate <p>s break md2jcr's single-value
      // image-field mapping during JCR sync). The block JS reads every <img> in
      // the media cell, so a single wrapping paragraph still renders both.
      let imageCell = '';
      if (heroImgs.length) {
        const p = document.createElement('p');
        heroImgs.forEach((h) => {
          const img = document.createElement('img');
          img.setAttribute('src', h.src);
          img.setAttribute('alt', h.alt);
          p.appendChild(img);
        });
        imageCell = [document.createComment(' field:image '), p];
      }

      // Detach the source image column BEFORE swapping the title section, so the
      // two stacked photos (now copied into field:image) don't also survive as
      // loose full-width default content above the block. imgWrap is the sibling
      // HeroImageSection when present (guard against it being `element` itself).
      if (imgWrap && imgWrap !== element && imgWrap.parentNode && !imgWrap.contains(element)) {
        imgWrap.remove();
      }

      const cells = [[imageCell], [contentCell]];
      const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });
      element.replaceWith(block);
      return;
    }
  }

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
