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

  // CTA: standalone link becomes the pill button.
  const cta = block.querySelector('a');
  if (cta) {
    cta.classList.add('hero-home-cta');
    if (cta.parentElement && cta.parentElement.tagName === 'P') {
      cta.parentElement.classList.add('hero-home-cta-wrapper');
    }
  }
}
