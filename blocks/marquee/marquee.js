import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the marquee (auto-scrolling text ribbon)
 * @param {Element} block The marquee block element
 */
export default function decorate(block) {
  // The block's first cell holds the ribbon text/content.
  const source = block.firstElementChild?.firstElementChild || block.firstElementChild;

  const track = document.createElement('div');
  track.className = 'marquee-track';

  // Build a single ribbon item from the authored content.
  const item = document.createElement('div');
  item.className = 'marquee-item';
  if (source) {
    moveInstrumentation(source, item);
    while (source.firstChild) item.append(source.firstChild);
  }

  track.append(item);

  // Duplicate the item enough times to fill the track for a seamless loop.
  for (let i = 0; i < 7; i += 1) {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.append(clone);
  }

  block.textContent = '';
  block.append(track);
}
