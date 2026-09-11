/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-awards. Base: carousel.
 * Source: https://credera.com/en-us/careers (awards badge carousel)
 * Structure (xwalk carousel container): row 1 = block name; each subsequent
 * row = one slide. The item model (carousel-awards-item) has a single content
 * field: image (reference) + collapsed imageAlt. So each award-badge row has
 * ONE cell: field:image + <img>.
 *
 * Source shape: slides (<li class="slide">) group MULTIPLE award badges each
 * (award-carousel__GridImageContainer > picture > img alt="Grid Image").
 * We FLATTEN all badge images across all slides into one row per badge image.
 */
export default function parse(element, { document }) {
  // Gather every award-badge image, regardless of how slides group them.
  const imgs = Array.from(
    element.querySelectorAll('[class*="GridImageContainer"] img, .slide picture img, picture img'),
  );

  // De-duplicate by resolved src (comma selectors above can overlap).
  const seen = new Set();
  const cells = [];

  imgs.forEach((img) => {
    let src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) {
      // Fallback to srcset first URL if the src is a lazy-load placeholder.
      const set = img.getAttribute('srcset');
      if (set) {
        const first = set.split(',')[0].trim().split(/\s+/)[0];
        if (first && !first.startsWith('data:')) src = first;
      }
    }
    if (!src || src.startsWith('data:') || seen.has(src)) return;
    seen.add(src);

    const image = document.createElement('img');
    image.setAttribute('src', src);
    if (img.getAttribute('alt')) image.setAttribute('alt', img.getAttribute('alt'));

    // One-column row: single cell = field:image hint + the image.
    cells.push([[document.createComment(' field:image '), image]]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
