import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the cards-testimonial block
 *
 * Expected authored structure: one row per person, each row holding cells for:
 *   - a portrait image
 *   - a "Click to see …" prompt label
 *   - the testimonial quote
 *   - the person's name
 *   - the person's role
 * Renders a horizontally scrolling row of testimonial cards. Each card shows the
 * photo with a prompt bar; clicking (or focusing) the card reveals the quote,
 * name and role over the photo — mirroring the source "click to see message".
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-testimonial-track';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-testimonial-card';
    moveInstrumentation(row, li);

    const cells = [...row.children];
    // First cell containing an image is the portrait; remaining cells are text.
    let imgCell = null;
    const textCells = [];
    cells.forEach((cell) => {
      if (!imgCell && cell.querySelector('picture, img')) imgCell = cell;
      else textCells.push(cell);
    });

    // Media
    const media = document.createElement('div');
    media.className = 'cards-testimonial-media';
    if (imgCell) {
      const pic = imgCell.querySelector('picture') || imgCell.querySelector('img');
      if (pic) media.append(pic);
    }
    li.append(media);

    // Text: label (prompt) + quote + name + role. Each part is its own
    // paragraph inside the text cell(s), so read paragraphs — not the merged
    // cell text — falling back to the cell's own text when it has no <p>.
    const texts = [];
    textCells.forEach((c) => {
      const paras = c.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => {
          const t = p.textContent.replace(/\s+/g, ' ').trim();
          if (t) texts.push(t);
        });
      } else {
        const t = c.textContent.replace(/\s+/g, ' ').trim();
        if (t) texts.push(t);
      }
    });

    const label = document.createElement('p');
    label.className = 'cards-testimonial-label';
    label.textContent = texts[0] || '';
    li.append(label);

    if (texts.length > 1) {
      const panel = document.createElement('div');
      panel.className = 'cards-testimonial-panel';
      // quote = second line; name = second-to-last; role = last (when present)
      const quote = document.createElement('p');
      quote.className = 'cards-testimonial-quote';
      quote.textContent = texts.slice(1, texts.length - 2).join(' ') || texts[1] || '';
      panel.append(quote);
      if (texts.length >= 3) {
        const name = document.createElement('p');
        name.className = 'cards-testimonial-name';
        name.textContent = texts[texts.length - 2];
        panel.append(name);
      }
      if (texts.length >= 4) {
        const role = document.createElement('p');
        role.className = 'cards-testimonial-role';
        role.textContent = texts[texts.length - 1];
        panel.append(role);
      }
      li.append(panel);

      // Toggle reveal on click / keyboard.
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'button');
      const toggle = () => li.classList.toggle('is-open');
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }

    ul.append(li);
  });

  // Optimize portrait images — but only same-origin ones. The AEM image
  // pipeline params (?width=…&format=webply) break external CDNs (e.g. the
  // ctfassets URLs used here), so those are left as-authored.
  ul.querySelectorAll('picture > img').forEach((img) => {
    let sameOrigin = false;
    try {
      sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    } catch (e) {
      sameOrigin = false;
    }
    if (!sameOrigin) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.textContent = '';
  block.append(ul);
}
