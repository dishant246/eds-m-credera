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

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-insight-card-image';
      else div.className = 'cards-insight-card-body';
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

  // Custom scrollbar (source shows a light track with an orange thumb whose
  // width/position track the horizontal scroll of the carousel).
  const scrollbar = document.createElement('div');
  scrollbar.className = 'cards-insight-scrollbar';
  const thumb = document.createElement('div');
  thumb.className = 'cards-insight-scrollbar-thumb';
  scrollbar.append(thumb);
  block.append(scrollbar);

  const sync = () => {
    const { scrollWidth, clientWidth, scrollLeft } = ul;
    if (scrollWidth <= clientWidth) {
      scrollbar.style.display = 'none';
      return;
    }
    scrollbar.style.display = '';
    const ratio = clientWidth / scrollWidth;
    const thumbW = Math.max(ratio * scrollbar.clientWidth, 40);
    const maxThumbX = scrollbar.clientWidth - thumbW;
    const maxScroll = scrollWidth - clientWidth;
    thumb.style.width = `${thumbW}px`;
    thumb.style.transform = `translateX(${(scrollLeft / maxScroll) * maxThumbX}px)`;
  };

  ul.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  // Re-sync as the carousel's size settles (images loading change scrollWidth).
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(sync);
    ro.observe(ul);
  }
  ul.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', sync, { once: true });
  });
  requestAnimationFrame(sync);

  // Click/drag on the track scrubs the carousel.
  const scrubTo = (clientX) => {
    const rect = scrollbar.getBoundingClientRect();
    const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    ul.scrollLeft = pct * (ul.scrollWidth - ul.clientWidth);
  };
  let dragging = false;
  scrollbar.addEventListener('pointerdown', (e) => {
    dragging = true;
    scrollbar.setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
  });
  scrollbar.addEventListener('pointermove', (e) => {
    if (dragging) scrubTo(e.clientX);
  });
  scrollbar.addEventListener('pointerup', () => { dragging = false; });
}
