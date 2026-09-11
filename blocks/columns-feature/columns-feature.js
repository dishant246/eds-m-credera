import { createOptimizedPicture } from '../../scripts/aem.js';

// Option classes this block understands. Missing/extra tokens are tolerated.
const OPTION_CLASSES = ['image-left', 'image-right'];

/**
 * loads and decorates the columns-feature block
 *
 * Expected authored structure: a single row with two cells —
 *  - one cell holding an image (the media side)
 *  - one cell holding text (eyebrow label, heading, paragraph, link)
 * Column order is controlled by the `image-left` / `image-right` options.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];

  cells.forEach((cell) => {
    const pic = cell.querySelector('picture');
    if (pic && cell.textContent.trim() === '') {
      // media-only cell
      cell.classList.add('columns-feature-media');
    } else if (pic && cell.querySelector('h1, h2, h3, h4, h5, h6, p')) {
      // mixed cell that still leads with media
      cell.classList.add('columns-feature-media');
    } else {
      cell.classList.add('columns-feature-text');
      // mark a short line that appears before the heading as an eyebrow label
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      const firstP = cell.querySelector('p');
      if (heading && firstP
        && heading.compareDocumentPosition(firstP) === Node.DOCUMENT_POSITION_PRECEDING) {
        firstP.classList.add('columns-feature-eyebrow');
      }
    }
  });

  // optimize any images
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  });

  // media placement: default is media on the right (text-first).
  // `image-left` puts media first; `image-right` is explicit default.
  if (active.includes('image-left')) {
    block.classList.add('columns-feature-media-first');
  }
}
