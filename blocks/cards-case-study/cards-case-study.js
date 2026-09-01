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
  if (src.startsWith('/') || src.startsWith('./')) return true;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * Build case-study cards from the authored rows.
 *
 * The imported content is flat: each card's image, title and category arrive as
 * separate rows (e.g. [image][title][category] repeating). To render the source
 * two-up card grid, consecutive rows are grouped into a single card <li>: a new
 * card begins at every row that carries an image; text rows are folded into the
 * current card's body. This grouping is purely structural — the image-handling
 * logic below (isOptimizable guard) is unchanged.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  let li = null;
  let body = null;

  [...block.children].forEach((row) => {
    const hasPicture = !!row.querySelector('picture');
    if (hasPicture || !li) {
      li = document.createElement('li');
      moveInstrumentation(row, li);
      ul.append(li);
      body = null;
    }
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture')) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'cards-case-study-card-image';
        while (cell.firstChild) imageDiv.append(cell.firstChild);
        li.append(imageDiv);
      } else if (cell.textContent.trim() || cell.children.length) {
        if (!body) {
          body = document.createElement('div');
          body.className = 'cards-case-study-card-body';
          li.append(body);
        }
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });
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
