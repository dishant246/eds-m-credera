import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Only AEM-managed images (relative paths / media_ assets served by the EDS
 * pipeline) can be optimized via createOptimizedPicture. External CDN images
 * (e.g. Contentful) and inline data: URIs must be left as-is, otherwise the
 * helper rewrites their src into a broken `?width=&format=webply` URL and the
 * image fails to load.
 */
function isOptimizable(src) {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  // SVGs (e.g. the industry icons) can't be raster-optimized; leave them as-is.
  if (/\.svg($|[?#])/i.test(src)) return false;
  // Repo-committed icons under /icons/ (e.g. the "Our Teams" team icons) are
  // already sized static assets, not EDS-pipeline images — the optimizer's
  // ?width=&format= params 404 against them. Leave them as-is.
  if (/(^|\/)icons\//i.test(src)) return false;
  if (src.startsWith('/') || src.startsWith('./')) return true;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-industry-card-image';
      else div.className = 'cards-industry-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isOptimizable(img.getAttribute('src'))) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
