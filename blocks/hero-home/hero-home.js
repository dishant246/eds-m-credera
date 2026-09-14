/**
 * Hero Home block
 * Authored structure (rows):
 *   row 1 -> image/media cell (often empty; background media is authored separately)
 *   row 2 -> text cell: eyebrow (p>em), h1, subheading (p), CTA (p>a)
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Last row holds the textual content; earlier row(s) hold media.
  const contentRow = rows[rows.length - 1];
  contentRow.classList.add('hero-home-content');

  rows.slice(0, -1).forEach((row) => {
    row.classList.add('hero-home-media');
    // collapse empty media rows (media authored elsewhere on this page)
    if (row.textContent.trim() === '' && !row.querySelector('picture, img, video')) {
      row.classList.add('hero-home-media-empty');
    }
  });

  // Eyebrow: paragraph whose only content is emphasis text.
  const em = block.querySelector('em');
  if (em && em.parentElement && em.parentElement.tagName === 'P') {
    em.parentElement.classList.add('hero-home-eyebrow');
  }

  // Careers variant carries a hero image; the homepage variant does not.
  const hasHeroImage = !!block.querySelector('.hero-home-media img, .hero-home-media picture');

  if (hasHeroImage) {
    // Careers layout: every standalone link becomes a pill, grouped in one row.
    // First pill = primary (filled), the rest = secondary (outlined).
    const ctaWrappers = [];
    [...contentRow.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector(':scope > a');
      if (link && p.children.length === 1 && p.textContent.trim() === link.textContent.trim()) {
        link.classList.add('hero-home-cta');
        p.classList.add('hero-home-cta-wrapper');
        ctaWrappers.push(p);
      }
    });

    ctaWrappers.forEach((p, i) => {
      if (i > 0) p.querySelector('a').classList.add('hero-home-cta-secondary');
    });

    if (ctaWrappers.length) {
      const ctaRow = document.createElement('div');
      ctaRow.className = 'hero-home-cta-row';
      ctaWrappers[0].parentElement.insertBefore(ctaRow, ctaWrappers[0]);
      ctaWrappers.forEach((p) => ctaRow.appendChild(p));
    }
  } else {
    // Homepage layout: single standalone link becomes the pill button.
    const cta = block.querySelector('a');
    if (cta) {
      cta.classList.add('hero-home-cta');
      if (cta.parentElement && cta.parentElement.tagName === 'P') {
        cta.parentElement.classList.add('hero-home-cta-wrapper');
      }
    }
  }
}
