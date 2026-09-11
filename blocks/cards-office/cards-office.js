import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Only AEM-managed raster images can be optimized via createOptimizedPicture.
 * External CDN images, data: URIs and SVGs (the office location illustrations)
 * must be left as-is, otherwise the helper rewrites their src into a broken URL.
 */
function isOptimizable(src) {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  if (/\.svg($|[?#])/i.test(src)) return false;
  if (src.startsWith('/') || src.startsWith('./')) return true;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * loads and decorates the cards-office block
 *
 * Expected authored structure: one row per office, each containing an icon/image
 * cell and a body cell (office name, full address, "View Office" link).
 * Renders as a horizontally scrolling row of office cards.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-office-card-image';
      else div.className = 'cards-office-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isOptimizable(img.getAttribute('src'))) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
